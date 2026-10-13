alter table public.settings add column default_prep_minutes integer not null default 25 check(default_prep_minutes between 5 and 180);
alter table public.orders add column estimated_prep_minutes integer not null default 25 check(estimated_prep_minutes between 5 and 180), add column ready_at timestamptz, add column customer_message text not null default '' check(length(customer_message)<=500);
-- Existing orders SELECT/UPDATE policies require auth.uid() membership in staff.
-- Table RLS remains enabled; no policy is broadened by this migration.
DO $$ BEGIN IF NOT (select relrowsecurity from pg_class where oid='public.orders'::regclass) OR NOT EXISTS(select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_update' and qual like '%staff.user_id%' and with_check like '%staff.user_id%') THEN RAISE EXCEPTION 'Staff-only RLS must be present before granting timing columns'; END IF; END $$;
grant update(estimated_prep_minutes,ready_at,customer_message) on public.orders to authenticated;
create function public.set_order_timing() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then select default_prep_minutes into new.estimated_prep_minutes from public.settings where id=1;end if;
 if new.status in ('accepted','preparing') and new.ready_at is null then new.ready_at=now()+make_interval(mins=>new.estimated_prep_minutes);end if;
 return new;
end;$$;
revoke all on function public.set_order_timing() from public,anon,authenticated;
create trigger order_timing before insert or update on public.orders for each row execute function public.set_order_timing();
