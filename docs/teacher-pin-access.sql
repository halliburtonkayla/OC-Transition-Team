create table if not exists public.tt_monitor_pin_settings(id boolean primary key default true check(id),pin_hash text not null,teacher_id uuid not null references auth.users(id));
create table if not exists public.tt_monitor_pin_attempts(fingerprint text primary key,tries integer not null default 0,window_started timestamptz not null default now());
create table if not exists public.tt_monitor_teacher_sessions(token_hash text primary key,teacher_id uuid not null references auth.users(id),created_at timestamptz not null default now(),expires_at timestamptz not null default(now()+interval '1 hour'),revoked_at timestamptz);
alter table public.tt_monitor_pin_settings enable row level security;alter table public.tt_monitor_pin_attempts enable row level security;alter table public.tt_monitor_teacher_sessions enable row level security;
revoke all on public.tt_monitor_pin_settings,public.tt_monitor_pin_attempts,public.tt_monitor_teacher_sessions from public,anon,authenticated;
grant select,insert,update,delete on public.tt_monitor_pin_settings,public.tt_monitor_pin_attempts,public.tt_monitor_teacher_sessions to service_role;
create or replace function public.tt_monitor_check_pin(p_fingerprint text,p_hash text) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.tt_monitor_pin_attempts; uid uuid;
begin
insert into public.tt_monitor_pin_attempts(fingerprint)values(p_fingerprint)on conflict do nothing;
select * into r from public.tt_monitor_pin_attempts where fingerprint=p_fingerprint for update;
if r.window_started<clock_timestamp()-interval '15 minutes' then r.tries:=0;r.window_started:=clock_timestamp();end if;
if r.tries>=5 then return jsonb_build_object('blocked',true);end if;
select teacher_id into uid from public.tt_monitor_pin_settings where id and pin_hash=p_hash;
update public.tt_monitor_pin_attempts set tries=case when uid is null then r.tries+1 else 0 end,window_started=r.window_started where fingerprint=p_fingerprint;
return jsonb_build_object('teacher_id',uid,'blocked',false);
end $$;
revoke all on function public.tt_monitor_check_pin(text,text) from public,anon,authenticated;
grant execute on function public.tt_monitor_check_pin(text,text) to service_role;
-- Configure the chosen PIN hash and existing teacher Auth ID privately through the connected project. Never put the passcode in frontend JavaScript.
