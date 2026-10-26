create table if not exists public.tt_career_feud_rooms (
 code text primary key check (code ~ '^[A-Z2-9]{6}$'),
 teacher_id uuid not null,
 host_hash text not null,
 team_hashes jsonb not null default '[null,null]'::jsonb,
 state jsonb not null,
 version bigint not null default 0,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 days'
);
alter table public.tt_career_feud_rooms enable row level security;
revoke all on public.tt_career_feud_rooms from public,anon,authenticated;
grant select,insert,update,delete on public.tt_career_feud_rooms to service_role;
create index if not exists tt_career_feud_teacher on public.tt_career_feud_rooms(teacher_id,created_at desc);
comment on table public.tt_career_feud_rooms is 'Private Career Feud room state. Edge function alone validates host and team capabilities and filters answers. No browser table access.';
