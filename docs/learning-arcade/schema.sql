-- REVIEW ONLY: no production change is made by this PR. Apply in a transaction
-- after owner approval and a verified backup. Existing account/state tables are
-- extended, never replaced. No real students or credentials belong in this file.
begin;
alter table public.student_accounts
 add column if not exists full_name text not null default '',
 add column if not exists school_key text check(school_key in ('sf','oc')),
 add column if not exists record_key text,
 add column if not exists enrollment_status text not null default 'review' check(enrollment_status in ('active','archived','on_hold','review')),
 add column if not exists program text not null default 'preets' check(program in ('cdc','preets','esp')),
 add column if not exists grade text not null default '',
 add column if not exists grade_verified boolean not null default false,
 add column if not exists grade_source text not null default '',
 add column if not exists profile jsonb not null default '{}'::jsonb,
 add column if not exists revision bigint not null default 0;
create unique index if not exists tt_account_import_key on public.student_accounts(school_key,record_key) where record_key is not null;
create unique index if not exists tt_account_full_name on public.student_accounts(school_key,lower(regexp_replace(full_name,'[^[:alnum:]]','','g'))) where full_name<>'';
alter table public.student_state add column if not exists revision bigint not null default 0;
alter table public.tt_monitor_devices add column if not exists student_id uuid references public.student_accounts(id);
alter table public.tt_monitor_settings add column if not exists roster_revision bigint not null default 0;
create table if not exists public.tt_student_aliases(alias text primary key check(length(alias) between 1 and 100),student_id uuid not null references public.student_accounts(id));
create unique index if not exists tt_alias_normalized on public.tt_student_aliases(lower(alias));
create table if not exists public.tt_roster_changes(id uuid primary key default gen_random_uuid(),teacher_id uuid not null references auth.users(id),at timestamptz not null default now(),before_rows jsonb not null,after_rows jsonb not null);
-- Authenticated alone is not teacher authorization. All access goes through
-- classroom-monitor's verified teacher allowlist or an approved device token.
alter table public.student_accounts enable row level security;
alter table public.student_state enable row level security;
alter table public.tt_student_aliases enable row level security;
alter table public.tt_roster_changes enable row level security;
revoke all on public.student_accounts,public.student_state,public.tt_student_aliases,public.tt_roster_changes from public,anon,authenticated;
grant select,insert,update on public.student_accounts,public.student_state,public.tt_student_aliases,public.tt_roster_changes to service_role;

-- Atomic reconciliation: an alias cannot be reassigned and no state, historic
-- monitor event, balance, business membership or phone contact is deleted.
create or replace function public.tt_arcade_reconcile(p_rows jsonb,p_teacher uuid,p_expected bigint) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare item jsonb; r public.student_accounts; old_rows jsonb:='[]'; new_rows jsonb:='[]'; alias_name text; rev bigint; ident uuid;
begin
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>100 or jsonb_array_length(p_rows)=0 then raise exception 'Invalid roster batch'; end if;
 select roster_revision into rev from public.tt_monitor_settings where id=true for update;
 if rev is distinct from p_expected then raise exception 'Roster changed; preview again' using errcode='40001';end if;
 for item in select value from jsonb_array_elements(p_rows) loop
  if item->>'action' not in ('create','update') or length(item#>>'{student,fullName}')<3 or item#>>'{student,school}' not in ('sf','oc') or item#>>'{student,status}' not in ('active','archived','on_hold','review') or length(item#>>'{student,recordKey}')<8 then raise exception 'Unreviewed or invalid roster row';end if;
  if item->>'action'='update' then
   ident:=(item->>'id')::uuid;select * into r from public.student_accounts where id=ident for update;
   if not found or r.school_key is distinct from item#>>'{student,school}' then raise exception 'Existing school or account does not match';end if;
   old_rows:=old_rows||jsonb_build_array(to_jsonb(r));
   if r.record_key is not null and r.record_key<>item#>>'{student,recordKey}' then raise exception 'Stable key mismatch';end if;
   update public.student_accounts set full_name=item#>>'{student,fullName}',school_key=item#>>'{student,school}',record_key=item#>>'{student,recordKey}',enrollment_status=item#>>'{student,status}',program=item#>>'{student,program}',grade=item#>>'{student,grade}',grade_verified=(item#>>'{student,gradeVerified}')::boolean,grade_source=item#>>'{student,source}',profile=profile||jsonb_build_object('learning',item#>'{student,learning}','rosterNote',item#>>'{student,note}'),revision=revision+1 where id=ident;
  else
   ident:=gen_random_uuid();insert into public.student_accounts(id,first_name,pin_hash,full_name,school_key,record_key,enrollment_status,program,grade,grade_verified,grade_source,profile) values(ident,split_part(item#>>'{student,fullName}',' ',1),'disabled-import-'||gen_random_uuid(),item#>>'{student,fullName}',item#>>'{student,school}',item#>>'{student,recordKey}',item#>>'{student,status}',item#>>'{student,program}',item#>>'{student,grade}',(item#>>'{student,gradeVerified}')::boolean,item#>>'{student,source}',jsonb_build_object('learning',item#>'{student,learning}','rosterNote',item#>>'{student,note}'));
  end if;
  for alias_name in select jsonb_array_elements_text(item#>'{student,aliases}') loop
   if exists(select 1 from public.tt_student_aliases where lower(alias)=lower(alias_name) and student_id<>ident) then raise exception 'Alias is already assigned';end if;
   insert into public.tt_student_aliases(alias,student_id)values(alias_name,ident)on conflict(alias)do nothing;
  end loop;
  if jsonb_array_length(coalesce(item#>'{student,initialSchedule}','[]'))>0 then
   insert into public.student_state(student_id)values(ident)on conflict do nothing;
   update public.student_state set state=jsonb_set(state,'{management}',coalesce(state->'management','{}')||jsonb_build_object('schedule',item#>'{student,initialSchedule}')),revision=revision+1 where student_id=ident and coalesce(jsonb_array_length(state#>'{management,schedule}'),0)=0;
  end if;
  new_rows:=new_rows||jsonb_build_array((select to_jsonb(a) from public.student_accounts a where id=ident));
 end loop;
 insert into public.tt_roster_changes(teacher_id,before_rows,after_rows)values(p_teacher,old_rows,new_rows);
 update public.tt_monitor_settings set roster_revision=roster_revision+1 where id=true;
 return jsonb_build_object('revision',rev+1,'count',jsonb_array_length(new_rows));
end $$;
revoke all on function public.tt_arcade_reconcile(jsonb,uuid,bigint) from public,anon,authenticated;
grant execute on function public.tt_arcade_reconcile(jsonb,uuid,bigint) to service_role;

-- Merge one game's evidence into the existing state while holding its row lock.
-- Retried saves cannot overwrite a newer result or any unrelated state fields.
create or replace function public.tt_arcade_save_run(p_student uuid,p_run jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.student_state; old jsonb; key text:=p_run->>'id';
begin
 if length(key)>100 or key is null or jsonb_typeof(p_run->'rounds')<>'array' then raise exception 'Invalid practice record';end if;
 insert into public.student_state(student_id)values(p_student)on conflict do nothing;
 select * into r from public.student_state where student_id=p_student for update;
 old:=r.state#>array['arcade',key];
 if old is not null and ((old->>'activeMs')::numeric>(p_run->>'activeMs')::numeric or jsonb_array_length(old->'rounds')>jsonb_array_length(p_run->'rounds') or (old->>'endedAt' is not null and p_run->>'endedAt' is null)) then return jsonb_build_object('saved',false,'reason','Newer practice is already saved');end if;
 if old is not null and old ? 'checkpointRevision' and p_run ? 'checkpointRevision' and (old->>'checkpointRevision')::numeric >= (p_run->>'checkpointRevision')::numeric then
  if old=p_run then return jsonb_build_object('saved',true); end if;
  return jsonb_build_object('saved',false,'reason','Newer game progress is already saved; reconnect before continuing');
 end if;
 r.state:=jsonb_set(r.state,'{arcade}',coalesce(r.state->'arcade','{}'::jsonb)||jsonb_build_object(key,p_run));
 if octet_length(r.state::text)>5000000 then raise exception 'Learning storage is full; ask your teacher to export records';end if;
 update public.student_state set state=r.state,revision=revision+1,updated_at=now()where student_id=p_student;
 return jsonb_build_object('saved',true);
end $$;
revoke all on function public.tt_arcade_save_run(uuid,jsonb)from public,anon,authenticated;
grant execute on function public.tt_arcade_save_run(uuid,jsonb)to service_role;

create or replace function public.tt_arcade_management(p_student uuid,p_value jsonb,p_expected bigint)returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.student_state;
begin
 insert into public.student_state(student_id)values(p_student)on conflict do nothing;
 select * into r from public.student_state where student_id=p_student for update;
 if r.revision<>p_expected then raise exception 'Record changed; refresh and review again' using errcode='40001';end if;
 update public.student_state set state=jsonb_set(state,'{management}',p_value),revision=revision+1,updated_at=now()where student_id=p_student;
 return jsonb_build_object('saved',true,'revision',r.revision+1);
end $$;
revoke all on function public.tt_arcade_management(uuid,jsonb,bigint)from public,anon,authenticated;
grant execute on function public.tt_arcade_management(uuid,jsonb,bigint)to service_role;
-- One lock covers the weekly plan across both schools and every student.
create or replace function public.tt_arcade_add_plan(p_student uuid,p_plan jsonb,p_expected bigint)returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.student_state; entry jsonb; a text; b text; match_found boolean:=false; start_min integer; finish_min integer; other_start integer; other_end integer; buffer integer; actual_school text; weekday text; duration integer;
begin
 perform pg_advisory_xact_lock(827364,19201);
 select school_key into actual_school from public.student_accounts where id=p_student;
 if p_plan->>'school' is distinct from actual_school or p_plan->>'studentId'<>p_student::text then raise exception 'Plan identity mismatch';end if;
 duration:=(p_plan->>'duration')::integer;
 if duration<5 or duration>120 or p_plan->>'start'!~'^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Invalid plan time';end if;
 start_min:=split_part(p_plan->>'start',':',1)::int*60+split_part(p_plan->>'start',':',2)::int;finish_min:=start_min+duration;
 if finish_min>1440 then raise exception 'Invalid finish time';end if;
 insert into public.student_state(student_id)values(p_student)on conflict do nothing;
 select * into r from public.student_state where student_id=p_student for update;
 if r.revision<>p_expected then raise exception 'Record changed; refresh and review again' using errcode='40001';end if;
 weekday:=(array['SU','MO','TU','WE','TH','FR','SA'])[extract(dow from (p_plan->>'date')::date)::int+1];
 for entry in select value from jsonb_array_elements(coalesce(r.state#>'{management,schedule}','[]')) loop
  if entry->>'type'='elective' and entry->>'verified'='true' and entry->'days' ? weekday and (entry->>'start')::time <= (p_plan->>'start')::time and (entry->>'end')::time >= ((p_plan->>'start')::time+make_interval(mins=>duration)) then match_found:=true;end if;
 end loop;
 if not match_found then raise exception 'No verified elective at this time';end if;
 for entry in select x.value from public.student_state s cross join lateral jsonb_array_elements(coalesce(s.state#>'{management,plans}','[]')) x where x.value->>'date'=p_plan->>'date' and x.value->>'status'<>'cancelled' loop
  other_start:=split_part(entry->>'start',':',1)::int*60+split_part(entry->>'start',':',2)::int;other_end:=other_start+(entry->>'duration')::int;buffer:=case when entry->>'school'<>actual_school then 20 else 0 end;
  if start_min<other_end+buffer and other_start<finish_min+buffer then raise exception 'Planned session conflicts or needs school travel time';end if;
 end loop;
 r.state:=jsonb_set(r.state,'{management}',coalesce(r.state->'management','{}')||jsonb_build_object('plans',coalesce(r.state#>'{management,plans}','[]')||jsonb_build_array(p_plan)));
 update public.student_state set state=r.state,revision=revision+1,updated_at=now()where student_id=p_student;
 return jsonb_build_object('saved',true,'revision',r.revision+1);
end $$;
revoke all on function public.tt_arcade_add_plan(uuid,jsonb,bigint)from public,anon,authenticated;
grant execute on function public.tt_arcade_add_plan(uuid,jsonb,bigint)to service_role;
commit;
