-- Classroom-dollar work pay. Private server-side progress; no student direct table access.
create table if not exists public.tt_student_work_pay (
 student text primary key,
 active_seconds numeric not null default 0 check(active_seconds>=0 and active_seconds<1500),
 total_paid integer not null default 0 check(total_paid>=0 and total_paid%200=0),
 notified_paid integer not null default 0 check(notified_paid>=0 and notified_paid<=total_paid),
 last_ping timestamptz,
 last_device uuid,
 last_working boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.tt_student_work_pay enable row level security;
revoke all on public.tt_student_work_pay from public,anon,authenticated;
grant select,insert,update,delete on public.tt_student_work_pay to service_role;
create or replace function public.tt_work_pay_pulse(p_student text,p_device uuid,p_session uuid,p_working boolean)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.tt_student_work_pay; eligible boolean; elapsed numeric:=0; reward integer:=0; stamp timestamptz:=clock_timestamp();
begin
 if not exists(select 1 from public.tt_monitor_sessions s join public.tt_monitor_devices d on d.id=s.device_id where s.id=p_session and s.student=p_student and d.id=p_device and d.approved_at is not null and d.revoked_at is null and d.expires_at>stamp and s.ended_at is null and s.status='active') then raise exception 'Active verified student session required'; end if;
 insert into public.tt_student_work_pay(student) values(p_student) on conflict do nothing;
 select * into r from public.tt_student_work_pay where student=p_student for update;
 eligible:=p_working and exists(select 1 from public.tt_monitor_events e where e.session_id=p_session and e.at>stamp-interval '45 seconds' and e.kind in ('action','completed','correction','choice','decision') and e.page ~ '^(shop-floor|cool-vibes|the-zoo|3k-tire-shop|guardian-angel|main-attraction(-studio|-service|-workstations|-appointments)?|grocery-employee|pizza-employee|coffee-employee|salon-simulator)\.html' and e.summary !~* '(customer arrival|shift clock|automatic|background|shift finished)');
 if eligible and r.last_working and r.last_device=p_device and r.last_ping>stamp-interval '25 seconds' then elapsed:=least(15,greatest(0,extract(epoch from stamp-r.last_ping))); end if;
 r.active_seconds:=r.active_seconds+elapsed;
 if r.active_seconds>=1500 then reward:=floor(r.active_seconds/1500)*200;r.total_paid:=r.total_paid+reward;r.active_seconds:=mod(r.active_seconds,1500);end if;
 update public.tt_student_work_pay set active_seconds=r.active_seconds,total_paid=r.total_paid,last_ping=stamp,last_device=p_device,last_working=eligible,updated_at=stamp where student=p_student;
 return jsonb_build_object('active_seconds',floor(r.active_seconds),'total_paid',r.total_paid,'unseen_paid',r.total_paid-r.notified_paid,'earned_now',reward,'working',eligible);
end $$;
create or replace function public.tt_work_pay_ack(p_student text)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.tt_student_work_pay;
begin
 select * into r from public.tt_student_work_pay where student=p_student for update;
 if not found then return jsonb_build_object('ok',true);end if;
 update public.tt_student_work_pay set notified_paid=least(total_paid,notified_paid+200) where student=p_student;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.tt_work_pay_pulse(text,uuid,uuid,boolean) from public,anon,authenticated;
revoke all on function public.tt_work_pay_ack(text) from public,anon,authenticated;
grant execute on function public.tt_work_pay_pulse(text,uuid,uuid,boolean) to service_role;
grant execute on function public.tt_work_pay_ack(text) to service_role;
