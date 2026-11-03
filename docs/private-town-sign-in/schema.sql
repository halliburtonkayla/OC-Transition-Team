-- Add private Town sign-in metadata to the existing account registry.
alter table public.student_accounts
  add column if not exists full_name text not null default '',
  add column if not exists school_key text check (school_key in ('sf','oc')),
  add column if not exists record_key text,
  add column if not exists enrollment_status text not null default 'review'
    check (enrollment_status in ('active','archived','on_hold','review')),
  add column if not exists program text not null default 'preets'
    check (program in ('cdc','preets','esp')),
  add column if not exists grade text not null default '',
  add column if not exists grade_verified boolean not null default false,
  add column if not exists grade_source text not null default '',
  add column if not exists profile jsonb not null default '{}'::jsonb;
create unique index if not exists tt_account_import_key
  on public.student_accounts(school_key,record_key) where record_key is not null;
create unique index if not exists tt_account_full_name
  on public.student_accounts(school_key,lower(regexp_replace(full_name,'[^[:alnum:]]','','g'))) where full_name<>'';
create unique index if not exists tt_account_town_access_hash
  on public.student_accounts(pin_hash) where pin_hash like 'tt-town-access-v1:%';
alter table public.student_accounts enable row level security;
revoke all on public.student_accounts from public,anon,authenticated;
grant select,insert,update on public.student_accounts to service_role;
