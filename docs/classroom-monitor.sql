-- Additive private classroom records. Existing student money, shops and interviews are untouched.
create table if not exists public.tt_monitor_settings (
 id boolean primary key default true check(id), enabled boolean not null default false,
 approval_reference text not null default '', retention_days integer check(retention_days between 1 and 365),
 updated_by uuid, updated_at timestamptz not null default now()
);
insert into public.tt_monitor_settings(id) values(true) on conflict do nothing;
create table if not exists public.tt_monitor_devices (
 id uuid primary key default gen_random_uuid(), student text not null, school text not null default '',
 token_hash text unique not null, pair_code text not null, approved_at timestamptz, approved_by uuid,
 created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '8 hours'),
 revoked_at timestamptz, last_seen timestamptz not null default now()
);
create table if not exists public.tt_monitor_groups (
 id uuid primary key default gen_random_uuid(), title text not null, school text not null, service text not null,
 members jsonb not null, teacher_id uuid not null, started_at timestamptz not null default now(),
 ends_at timestamptz not null default (now()+interval '30 minutes'), ended_at timestamptz
);
create table if not exists public.tt_monitor_sessions (
 id uuid primary key default gen_random_uuid(), device_id uuid not null references public.tt_monitor_devices(id) on delete cascade,
 student text not null, school text not null, group_id uuid references public.tt_monitor_groups(id) on delete set null,
 started_at timestamptz not null default now(), ended_at timestamptz, last_seen timestamptz not null default now(),
 status text not null default 'active' check(status in ('active','paused','ended')),
 page text not null default '', business text not null default '', activity text not null default '', mirror_allowed boolean not null default false
);
create unique index if not exists tt_monitor_one_active_device on public.tt_monitor_sessions(device_id) where ended_at is null;
create table if not exists public.tt_monitor_events (
 id uuid primary key, session_id uuid not null references public.tt_monitor_sessions(id) on delete cascade,
 student text not null, at timestamptz not null, received_at timestamptz not null default now(),
 kind text not null, source text not null, summary text not null, business text not null default '', page text not null default '', details jsonb not null default '{}'
);
create index if not exists tt_monitor_student_history on public.tt_monitor_events(student,at desc);
create index if not exists tt_monitor_session_events on public.tt_monitor_events(session_id,at);
create table if not exists public.tt_monitor_reports (
 id uuid primary key default gen_random_uuid(), report_key text not null unique,
 student text not null, school text not null, group_id uuid references public.tt_monitor_groups(id) on delete set null,
 session_id uuid references public.tt_monitor_sessions(id) on delete set null,
 draft jsonb not null, status text not null default 'draft' check(status in ('draft','approved')),
 revision integer not null default 1, approved_at timestamptz, approved_by uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tt_monitor_signals (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.tt_monitor_sessions(id) on delete cascade,
 teacher_id uuid not null, channel uuid not null, sender text not null check(sender in ('teacher','student')),
 kind text not null check(kind in ('request','offer','answer','ice','stop')), payload jsonb not null default '{}',
 created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '90 seconds')
);
create index if not exists tt_monitor_signal_session on public.tt_monitor_signals(session_id,created_at);
-- No browser can query these tables, even with a public API key or a student Auth JWT.
-- The Edge Function verifies teacher Auth or approved per-device tokens for each operation.
alter table public.tt_monitor_settings enable row level security;
alter table public.tt_monitor_devices enable row level security;
alter table public.tt_monitor_groups enable row level security;
alter table public.tt_monitor_sessions enable row level security;
alter table public.tt_monitor_events enable row level security;
alter table public.tt_monitor_reports enable row level security;
alter table public.tt_monitor_signals enable row level security;
revoke all on public.tt_monitor_settings,public.tt_monitor_devices,public.tt_monitor_groups,public.tt_monitor_sessions,public.tt_monitor_events,public.tt_monitor_reports,public.tt_monitor_signals from public,anon,authenticated;
grant select,insert,update,delete on public.tt_monitor_settings,public.tt_monitor_devices,public.tt_monitor_groups,public.tt_monitor_sessions,public.tt_monitor_events,public.tt_monitor_reports,public.tt_monitor_signals to service_role;
-- Optional, bounded HTTPS live-view fallback. Disabled until a teacher explicitly enables it.
alter table public.tt_monitor_settings add column if not exists allow_snapshot_fallback boolean not null default false;
create table if not exists public.tt_monitor_frames (
 channel uuid primary key, session_id uuid not null references public.tt_monitor_sessions(id) on delete cascade,
 teacher_id uuid not null, payload text not null check(length(payload)<=40000), encoding text not null check(encoding='gzip'),
 at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '20 seconds')
);
create table if not exists public.tt_monitor_live_usage (
 teacher_id uuid not null, day date not null default current_date, bytes bigint not null check(bytes between 0 and 20000000),primary key(teacher_id,day)
);
alter table public.tt_monitor_frames enable row level security;
alter table public.tt_monitor_live_usage enable row level security;
revoke all on public.tt_monitor_frames,public.tt_monitor_live_usage from public,anon,authenticated;
grant select,insert,update,delete on public.tt_monitor_frames,public.tt_monitor_live_usage to service_role;
create or replace function public.tt_monitor_reserve_live_bytes(p_teacher uuid,p_bytes integer) returns boolean
language sql security invoker set search_path=pg_catalog,public as $$
 with reserved as (
 insert into public.tt_monitor_live_usage(teacher_id,day,bytes)
 select p_teacher,current_date,p_bytes where p_bytes between 1 and 40000
 on conflict(teacher_id,day) do update set bytes=public.tt_monitor_live_usage.bytes+excluded.bytes
 where public.tt_monitor_live_usage.bytes+excluded.bytes<=20000000
 returning teacher_id
 ) select exists(select 1 from reserved);
$$;
revoke all on function public.tt_monitor_reserve_live_bytes(uuid,integer) from public,anon,authenticated;
grant execute on function public.tt_monitor_reserve_live_bytes(uuid,integer) to service_role;

-- Reports can be removed from the active list and restored before retention expiry.
alter table public.tt_monitor_reports add column if not exists deleted_at timestamptz;
alter table public.tt_monitor_reports add column if not exists deleted_by uuid;
