create table public.customer_feedback(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('review','complaint','suggestion')),rating integer check(rating between 1 and 5),customer_name text not null default '',phone text not null default '',order_reference text not null default '',message text not null check(length(message) between 5 and 1500),status text not null default 'new' check(status in ('new','in_progress','resolved')),staff_note text not null default '' check(length(staff_note)<=1500),ip_hash text not null,created_at timestamptz not null default now());
alter table public.customer_feedback enable row level security;
revoke all on public.customer_feedback from public,anon,authenticated;
create policy feedback_staff_read on public.customer_feedback for select to authenticated using(exists(select 1 from public.staff where user_id=(select auth.uid())));
create policy feedback_staff_update on public.customer_feedback for update to authenticated using(exists(select 1 from public.staff where user_id=(select auth.uid()))) with check(exists(select 1 from public.staff where user_id=(select auth.uid())));
grant select on public.customer_feedback to authenticated;
grant update(status,staff_note) on public.customer_feedback to authenticated;
grant all on public.customer_feedback to service_role;
create index feedback_status_created on public.customer_feedback(status,created_at desc);
create index feedback_ip_created on public.customer_feedback(ip_hash,created_at desc);
create function public.record_feedback(payload jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;begin
 perform pg_advisory_xact_lock(hashtextextended(payload->>'ip_hash',71));
 if(select count(*) from public.customer_feedback where ip_hash=payload->>'ip_hash' and created_at>now()-interval '1 hour')>=5 then raise exception 'Too many messages. Please contact us on WhatsApp.';end if;
 insert into public.customer_feedback(kind,rating,customer_name,phone,order_reference,message,ip_hash) values(payload->>'kind',(payload->>'rating')::integer,payload->>'customer_name',payload->>'phone',payload->>'order_reference',payload->>'message',payload->>'ip_hash') returning id into result;return result;end;$$;
revoke all on function public.record_feedback(jsonb) from public,anon,authenticated;
grant execute on function public.record_feedback(jsonb) to service_role;
