create table public.tt_teacher_access (
 email text primary key check(email=lower(email))
);
alter table public.tt_teacher_access enable row level security;
grant select on public.tt_teacher_access to authenticated;
create policy teacher_own_access on public.tt_teacher_access for select to authenticated using (email=lower(auth.jwt()->>'email'));
-- Teacher access is provisioned privately in the database.
create table public.tt_notifications (
 id uuid primary key default gen_random_uuid(),
 source_id text not null unique check(length(source_id) between 1 and 200),
 kind text not null check(kind in ('application','message')),
 employer text not null default '' check(length(employer)<=200),
 applicant text not null check(length(applicant) between 1 and 120),
 title text not null check(length(title)<=200),
 body text not null default '' check(length(body)<=3000),
 created_at timestamptz not null default now(),
 read_at timestamptz
);
alter table public.tt_notifications enable row level security;
grant insert (source_id,kind,employer,applicant,title,body) on public.tt_notifications to anon, authenticated;
grant select, update(read_at) on public.tt_notifications to authenticated;
create policy notification_submit on public.tt_notifications for insert to anon,authenticated with check(read_at is null);
create policy teacher_notifications_read on public.tt_notifications for select to authenticated using (exists(select 1 from public.tt_teacher_access where email=lower(auth.jwt()->>'email')));
create policy teacher_notifications_review on public.tt_notifications for update to authenticated using (exists(select 1 from public.tt_teacher_access where email=lower(auth.jwt()->>'email'))) with check (exists(select 1 from public.tt_teacher_access where email=lower(auth.jwt()->>'email')));
create index tt_notifications_created_at on public.tt_notifications(created_at desc);
