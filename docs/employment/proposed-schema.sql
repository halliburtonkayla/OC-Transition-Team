-- REVIEW PROPOSAL ONLY. Do not run against production before owner approval.
-- Additive tables; existing accounts, ttWorld, balances and progress are untouched.
begin;
alter table public.tt_monitor_devices add column private_mail boolean not null default false;
create table public.tt_employment_applications (
 source_id text primary key references public.tt_notifications(source_id),
 student text not null check(length(student) between 1 and 120),
 position text not null check(length(position) between 1 and 200),
 business text not null check(length(business) between 1 and 200),
 applied_at timestamptz not null default now(),
 decision text not null default 'Pending Ms. Kayla Review',
 feedback text not null default '' check(length(feedback)<=8000),
 revision integer not null default 1,
 round integer not null default 0,
 updated_at timestamptz not null default now()
);
create table public.tt_job_interviews (
 id uuid primary key default gen_random_uuid(),
 source_id text not null references public.tt_employment_applications(source_id),
 student text not null,
 round integer not null check(round>0),
 question_set text not null,
 questions jsonb not null check(jsonb_array_length(questions)=10),
 responses jsonb not null default '[]' check(jsonb_typeof(responses)='array'),
 status text not null default 'invited' check(status in ('invited','in_progress','completed')),
 invited_at timestamptz not null default now(),
 started_at timestamptz,
 completed_at timestamptz,
 feedback text not null default '',
 decision text not null default 'Pending Ms. Kayla Review',
 reviewed_by text,
 revision integer not null default 1,
 unique(source_id,round)
);
create table public.tt_student_mail (
 id uuid primary key default gen_random_uuid(),
 student text not null check(length(student) between 1 and 120),
 event_key text not null check(length(event_key) between 1 and 300),
 kind text not null,
 title text not null check(length(title)<=250),
 body text not null check(length(body)<=16000),
 interview_id uuid references public.tt_job_interviews(id),
 source_id text references public.tt_employment_applications(source_id),
 created_at timestamptz not null default now(),
 read_at timestamptz,
 acknowledged_at timestamptz,
 unique(student,event_key)
);
create table public.tt_employment_commands (
 actor text not null,
 command_id uuid not null,
 result jsonb not null,
 request jsonb not null,
 created_at timestamptz not null default now(),
 primary key(actor,command_id)
);
create index tt_student_mail_owner_created on public.tt_student_mail(student,created_at desc,id);
create index tt_student_mail_unacknowledged on public.tt_student_mail(student) where acknowledged_at is null;
create index tt_employment_applications_student on public.tt_employment_applications(student,source_id);
create index tt_job_interviews_student on public.tt_job_interviews(student,source_id);
alter table public.tt_employment_applications enable row level security;
alter table public.tt_job_interviews enable row level security;
alter table public.tt_student_mail enable row level security;
alter table public.tt_employment_commands enable row level security;
revoke all on public.tt_employment_applications,public.tt_job_interviews,public.tt_student_mail,public.tt_employment_commands from public,anon,authenticated;
grant all on public.tt_employment_applications,public.tt_job_interviews,public.tt_student_mail,public.tt_employment_commands to service_role;

-- Every command, its mail and its decision commit or roll back together.
-- Actor and student are supplied only after Edge authorization; callers cannot execute this RPC.
create function public.tt_employment_command(p_action text,p_actor text,p_command uuid,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare
 a public.tt_employment_applications;
 i public.tt_job_interviews;
 n public.tt_notifications;
 old_result jsonb;
 result jsonb;
 recipient text:=p_payload->>'student';
 source text:=p_payload->>'source_id';
 choice text:=p_payload->>'decision';
 v_feedback text:=coalesce(p_payload->>'feedback','');
 event jsonb;
 round_number integer;
 legacy_choice text;
begin
 perform pg_advisory_xact_lock(hashtext(p_actor),hashtext(p_command::text));
 select c.result into old_result from public.tt_employment_commands c where actor=p_actor and command_id=p_command;
 if found then
  if (select request from public.tt_employment_commands where actor=p_actor and command_id=p_command)<>jsonb_build_object('action',p_action,'payload',p_payload) then raise exception using errcode='PT409',message='Request identifier was already used';end if;
  return old_result;
 end if;
 if p_action='register' then
  -- The server stamps applicant from its verified device. Legacy records remain unchanged.
  insert into public.tt_notifications(source_id,kind,applicant,employer,title,body,recipient,details)
   values(source,'application',recipient,p_payload->>'business',p_payload->>'position','Application submitted.','Miss Kayla',coalesce(p_payload->'details','{}')) on conflict(source_id) do nothing;
  select * into n from public.tt_notifications where source_id=source for update;
  if n.kind<>'application' then raise exception 'Application source mismatch'; end if;
  insert into public.tt_employment_applications(source_id,student,position,business,applied_at)
   values(source,recipient,p_payload->>'position',p_payload->>'business',coalesce((p_payload->>'applied_at')::timestamptz,now())) on conflict(source_id) do nothing;
  select * into a from public.tt_employment_applications where source_id=source for update;
  if a.student<>recipient then raise exception 'Application owner mismatch'; end if;
  insert into public.tt_student_mail(student,event_key,kind,title,body,source_id)
   values(recipient,'application:'||source,'application','Application submitted',a.position||' at '||a.business||' was submitted for teacher review.',source) on conflict(student,event_key) do nothing;
  result:=jsonb_build_object('application',to_jsonb(a));
 elsif p_action='decide' then
  select * into a from public.tt_employment_applications where source_id=source for update;
  if not found then raise exception 'Verify and connect this application to a student first';end if;
  if a.revision<>(p_payload->>'revision')::integer then raise exception using errcode='PT409',message='Refresh this application before changing the decision';end if;
  if choice not in ('Approved / Hired','Interview Requested','Second Interview Requested','Declined','Pending Ms. Kayla Review') then raise exception 'Invalid decision';end if;
  select * into i from public.tt_job_interviews where source_id=source order by round desc limit 1;
  if a.decision=choice and a.feedback=v_feedback then
   result:=jsonb_build_object('application',to_jsonb(a),'interview',case when i.id is null then null else to_jsonb(i) end);
  else
   if choice='Second Interview Requested' and (i.id is null or i.status<>'completed') then raise exception 'Complete the current interview before requesting another'; end if;
   if choice='Interview Requested' and i.id is not null then raise exception 'An interview already exists; use Request Second Interview after completion';end if;
   if choice='Second Interview Requested' then update public.tt_job_interviews set feedback=v_feedback,decision=choice,reviewed_by=p_actor where id=i.id; end if;
   if choice in ('Interview Requested','Second Interview Requested') then
    round_number:=a.round+1;
    insert into public.tt_job_interviews(source_id,student,round,question_set,questions)
     values(source,a.student,round_number,p_payload->>'question_set',p_payload->'questions') returning * into i;
    update public.tt_employment_applications set round=round_number where source_id=source;
   else
    update public.tt_job_interviews set feedback=v_feedback,decision=choice,reviewed_by=p_actor where id=i.id;
   end if;
   update public.tt_employment_applications set decision=choice,feedback=v_feedback,revision=revision+1,updated_at=now() where source_id=source returning * into a;
   legacy_choice:=case when choice='Second Interview Requested' then 'Interview Requested' else choice end;
   insert into public.tt_job_decisions(source_id,decision,decided_at) values(source,legacy_choice,now())
    on conflict(source_id) do update set decision=excluded.decision,decided_at=excluded.decided_at;
   insert into public.tt_student_mail(student,event_key,kind,title,body,interview_id,source_id)
    values(a.student,'decision:'||source||':'||a.revision,'employment',choice,
     a.position||' at '||a.business||': '||choice||case when v_feedback<>'' then E'\n\nTeacher feedback: '||v_feedback else '' end,
     case when choice in ('Interview Requested','Second Interview Requested') then i.id else null end,source);
   result:=jsonb_build_object('application',to_jsonb(a),'interview',case when i.id is null then null else to_jsonb(i) end);
  end if;
 elsif p_action='save' then
  select * into i from public.tt_job_interviews where id=(p_payload->>'id')::uuid and student=recipient for update;
  if not found then raise exception 'Interview unavailable';end if;
  if i.status='completed' then raise exception 'Interview is already submitted';end if;
  if i.revision<>(p_payload->>'revision')::integer then raise exception using errcode='PT409',message='Another device saved this interview. Reload before editing';end if;
  update public.tt_job_interviews set responses=p_payload->'responses',status=case when (p_payload->>'complete')::boolean then 'completed' else 'in_progress' end,
   started_at=coalesce(started_at,now()),completed_at=case when (p_payload->>'complete')::boolean then now() else null end,revision=revision+1 where id=i.id returning * into i;
  if i.status='completed' then
   insert into public.tt_student_mail(student,event_key,kind,title,body,source_id)
    values(recipient,'interview-complete:'||i.id,'interview','Interview submitted','Great job! Your teacher can now review your interview. Your hiring decision will arrive here.',i.source_id) on conflict(student,event_key) do nothing;
  end if;
  result:=jsonb_build_object('interview',to_jsonb(i));
 elsif p_action='events' then
  for event in select value from jsonb_array_elements(p_payload->'events') loop
   insert into public.tt_student_mail(student,event_key,kind,title,body)
    values(recipient,event->>'event_key',event->>'kind',event->>'title',event->>'body') on conflict(student,event_key) do nothing;
  end loop;
  result:='{"ok":true}';
 else raise exception 'Unknown employment command';
 end if;
 insert into public.tt_employment_commands(actor,command_id,result,request)values(p_actor,p_command,result,jsonb_build_object('action',p_action,'payload',p_payload));
 return result;
end $$;
revoke all on function public.tt_employment_command(text,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.tt_employment_command(text,text,uuid,jsonb) to service_role;
-- Existing town phone messages also arrive in the recipient's mailbox.
create function public.tt_mail_name(n text) returns text language sql immutable security invoker set search_path=public,pg_temp as $$
 select case n when 'Max' then 'Bradley' when 'Nick' then 'Nicholas' when 'Aubry' then 'Aubrey' when 'Jayden' then 'Jaden' else n end
$$;
revoke all on function public.tt_mail_name(text) from public,anon,authenticated;
grant execute on function public.tt_mail_name(text) to service_role;
create function public.tt_phone_to_mail() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare recipient text;
begin
 for recipient in
  select distinct public.tt_mail_name(n) from (
   select name as n from public.tt_phone_contacts where new.to_name='Everyone' and name<>'Miss Kayla'
   union select full_name from public.student_accounts where new.to_name='Everyone' and enrollment_status='active' and full_name<>''
   union select unnest(members) from public.tt_phone_groups where id=new.group_id
   union select new.to_name where new.group_id is null and new.to_name not in ('Everyone','Group','Miss Kayla')
  ) recipients
 loop
  insert into public.tt_student_mail(student,event_key,kind,title,body)
   values(recipient,'phone:'||new.id,'message','Message from '||new.from_name,new.body) on conflict(student,event_key) do nothing;
 end loop;
 return new;
end $$;
revoke all on function public.tt_phone_to_mail() from public,anon,authenticated;
grant execute on function public.tt_phone_to_mail() to service_role;
create trigger tt_phone_mail after insert on public.tt_town_messages for each row execute function public.tt_phone_to_mail();
commit;
