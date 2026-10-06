alter table public.tt_notifications drop constraint tt_notifications_kind_check;
alter table public.tt_notifications add constraint tt_notifications_kind_check check(kind in ('application','message','complaint','compliment','city','housing','shift_report','alert'));
alter table public.tt_notifications drop constraint tt_notifications_body_check;
alter table public.tt_notifications add constraint tt_notifications_body_check check(length(body)<=16000);
alter table public.tt_notifications add column recipient text not null default '';
alter table public.tt_notifications add constraint tt_notifications_recipient_check check(length(recipient)<=200);
alter table public.tt_notifications add column details jsonb not null default '{}'::jsonb;
alter table public.tt_notifications add constraint tt_notifications_details_check check(octet_length(details::text)<=64000);
grant insert (recipient,details) on public.tt_notifications to anon,authenticated;
