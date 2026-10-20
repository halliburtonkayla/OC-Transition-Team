-- Shared simulation records only. Existing town, interviews and profiles are untouched.
create table if not exists public.tt_shop_workspaces (
  scope text not null,
  shop text not null check (shop in ('cool-vibes','the-zoo','guardian-angel','3k-tire-shop','main-attraction')),
  revision bigint not null default 1 check (revision > 0),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (scope, shop)
);
alter table public.tt_shop_workspaces enable row level security;
revoke all on public.tt_shop_workspaces from anon, authenticated, public;
grant select, insert, update, delete on public.tt_shop_workspaces to service_role;
comment on table public.tt_shop_workspaces is 'Classroom student-shop simulation; code-authenticated Edge Function only, no direct client access.';
