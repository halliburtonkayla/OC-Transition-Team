-- Append-only submissions: student devices can submit, only the existing
-- teacher-code Edge Function can read. No public read/update/delete access.
create table public.tt_interview_decisions (
 id uuid primary key,
 source_id text not null check(length(source_id) between 40 and 180),
 revision integer not null check(revision between 1 and 2147483647),
 shop_id text not null check(shop_id in ('main-attraction','cool-vibes','3k-tire-shop','the-zoo','guardian-angel')),
 shop_name text not null check(length(shop_name) between 1 and 100),
 applicant_id text not null check(applicant_id ~ '^[a-z0-9-]{1,60}$'),
 applicant_name text not null check(length(applicant_name) between 1 and 100),
 owner_name text not null check(length(owner_name) between 1 and 200),
 decision text not null check(decision in ('Hired','On hold','Declined')),
 decided_at timestamptz not null,
 details jsonb not null check(jsonb_typeof(details)='object' and octet_length(details::text)<=200000),
 received_at timestamptz not null default now(),
 unique(source_id, revision)
);
alter table public.tt_interview_decisions enable row level security;
revoke all on public.tt_interview_decisions from anon, authenticated;
grant insert(id,source_id,revision,shop_id,shop_name,applicant_id,applicant_name,owner_name,decision,decided_at,details) on public.tt_interview_decisions to anon, authenticated;
grant all on public.tt_interview_decisions to service_role;
create policy interview_decision_submit on public.tt_interview_decisions for insert to anon,authenticated with check(true);
create index tt_interview_decisions_latest_idx on public.tt_interview_decisions(source_id,revision desc);
create view public.tt_interview_decisions_latest with (security_invoker=true) as
 select distinct on (source_id) * from public.tt_interview_decisions order by source_id,revision desc;
revoke all on public.tt_interview_decisions_latest from public,anon,authenticated;
grant select on public.tt_interview_decisions_latest to service_role;
