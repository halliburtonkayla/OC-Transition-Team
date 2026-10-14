-- Additive: no existing town records, policies or functions are changed.
create table public.tt_biz_state (
 id text primary key,
 business text not null,
 state jsonb not null,
 version bigint not null default 0,
 updated_at timestamptz not null default now()
);
create table public.tt_biz_sessions (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 active boolean not null default true,
 businesses text[] not null,
 service text not null,
 practice boolean not null default false,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 ended_at timestamptz,
 observations jsonb not null default '{}'::jsonb
);
create table public.tt_biz_members (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references public.tt_biz_sessions(id),
 name text not null,
 business text not null,
 role text not null check (role in ('manager','cashier','prep','inventory')),
 solo boolean not null default false,
 approved boolean not null default false,
 revoked boolean not null default false,
 token_hash text not null unique,
 pair_code text not null,
 last_seen timestamptz not null default now(),
 clock_in timestamptz,
 clock_out timestamptz,
 created_at timestamptz not null default now()
);
create index tt_biz_members_session on public.tt_biz_members(session_id);
create unique index tt_biz_one_approved_device on public.tt_biz_members(session_id,name) where approved and not revoked;
create table public.tt_biz_commands (
 id uuid primary key,
 session_id uuid not null references public.tt_biz_sessions(id),
 member_id uuid references public.tt_biz_members(id),
 state_id text not null references public.tt_biz_state(id),
 request_hash text not null,
 event jsonb not null,
 result jsonb not null,
 created_at timestamptz not null default now()
);
create index tt_biz_commands_session on public.tt_biz_commands(session_id,created_at);
create table public.tt_biz_rate (id text primary key,window_started timestamptz not null default now(),hits integer not null default 1);
-- All student data is available only through the authenticated server, not the Data API.
alter table public.tt_biz_state enable row level security;
alter table public.tt_biz_sessions enable row level security;
alter table public.tt_biz_members enable row level security;
alter table public.tt_biz_commands enable row level security;
alter table public.tt_biz_rate enable row level security;
revoke all on public.tt_biz_state,public.tt_biz_sessions,public.tt_biz_members,public.tt_biz_commands,public.tt_biz_rate from anon,authenticated;
grant all on public.tt_biz_state,public.tt_biz_sessions,public.tt_biz_members,public.tt_biz_commands,public.tt_biz_rate to service_role;
-- SECURITY INVOKER, service-only. Atomic version check + durable deduplication + audit event.
create function public.tt_biz_commit(p_id uuid,p_session uuid,p_member uuid,p_state_id text,p_hash text,p_version bigint,p_state jsonb,p_event jsonb,p_result jsonb,p_role text,p_solo boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare sess public.tt_biz_sessions; mem public.tt_biz_members; prior public.tt_biz_commands; count_rows integer;
begin
 select * into sess from public.tt_biz_sessions where id=p_session for share;
 if not found or not sess.active or sess.expires_at<=now() then raise exception 'Classroom session has ended'; end if;
 if not (p_state->>'business'=any(sess.businesses)) then raise exception 'Business inactive'; end if;
 if p_state_id<>(case when sess.practice then 'practice:'||p_session::text||':' else 'business:' end)|| (p_state->>'business') then raise exception 'Invalid state scope'; end if;
 if p_member is not null then
   select * into mem from public.tt_biz_members where id=p_member and session_id=p_session for share;
   if not found or not mem.approved or mem.revoked or mem.business<>p_state->>'business' or mem.role<>p_role or mem.solo<>p_solo or mem.name<>p_event->>'student' then raise exception 'Device permission changed'; end if;
 end if;
 -- Serialize per business before checking receipt to cover concurrent identical retries.
 perform 1 from public.tt_biz_state where id=p_state_id for update;
 select * into prior from public.tt_biz_commands where id=p_id;
 if found then
   if prior.request_hash<>p_hash or prior.session_id<>p_session or prior.member_id is distinct from p_member then raise exception 'Request ID already used'; end if;
   return jsonb_build_object('duplicate',true,'result',prior.result);
 end if;
 update public.tt_biz_state set state=p_state,version=version+1,updated_at=now() where id=p_state_id and version=p_version;
 get diagnostics count_rows=row_count;
 if count_rows=0 then return jsonb_build_object('conflict',true); end if;
 insert into public.tt_biz_commands(id,session_id,member_id,state_id,request_hash,event,result) values(p_id,p_session,p_member,p_state_id,p_hash,p_event,p_result);
 return jsonb_build_object('ok',true,'result',p_result);
end $$;
revoke all on function public.tt_biz_commit(uuid,uuid,uuid,text,text,bigint,jsonb,jsonb,jsonb,text,boolean) from public,anon,authenticated;
grant execute on function public.tt_biz_commit(uuid,uuid,uuid,text,text,bigint,jsonb,jsonb,jsonb,text,boolean) to service_role;
create function public.tt_biz_rate_check(p_id text,p_limit integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.tt_biz_rate(id) values(p_id) on conflict(id) do update set hits=case when public.tt_biz_rate.window_started<now()-interval '1 minute' then 1 else public.tt_biz_rate.hits+1 end,window_started=case when public.tt_biz_rate.window_started<now()-interval '1 minute' then now() else public.tt_biz_rate.window_started end returning hits into n;
 return n<=p_limit;
end $$;
revoke all on function public.tt_biz_rate_check(text,integer) from public,anon,authenticated;
grant execute on function public.tt_biz_rate_check(text,integer) to service_role;
