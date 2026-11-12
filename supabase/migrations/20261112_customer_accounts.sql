alter table public.settings add column if not exists customer_accounts_enabled boolean not null default false;
alter table public.orders add column if not exists customer_user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_customer_history_idx on public.orders(customer_user_id,created_at desc) where customer_user_id is not null;

create table public.customer_addresses (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 label text not null check (char_length(btrim(label)) between 1 and 40),
 address text not null check (char_length(btrim(address)) between 1 and 500),
 created_at timestamptz not null default now()
);
alter table public.customer_addresses enable row level security;
revoke all on public.customer_addresses from public,anon,authenticated;
grant select,delete on public.customer_addresses to authenticated;
grant insert(label,address) on public.customer_addresses to authenticated;
create policy customer_addresses_read on public.customer_addresses for select to authenticated using (user_id=(select auth.uid()));
create policy customer_addresses_add on public.customer_addresses for insert to authenticated with check (user_id=(select auth.uid()));
create policy customer_addresses_remove on public.customer_addresses for delete to authenticated using (user_id=(select auth.uid()));

CREATE OR REPLACE FUNCTION public.record_order(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare old public.orders; result public.orders;begin
 perform pg_advisory_xact_lock(hashtextextended(payload->>'ip_hash',0));
 select * into old from public.orders where request_id=(payload->>'request_id')::uuid;
 if found then
  if old.customer_user_id is distinct from nullif(payload->>'customer_user_id','')::uuid then raise exception 'Invalid order reference'; end if;
  return to_jsonb(old);
 end if;
 if (select count(*) from public.orders where ip_hash=payload->>'ip_hash' and created_at>now()-interval '10 minutes')>=8 then raise exception 'Too many orders. Please contact the restaurant.';end if;
 if (select count(*) from public.orders where phone=payload->>'phone' and created_at>now()-interval '10 minutes')>=5 then raise exception 'Too many orders for this phone number.';end if;
 insert into public.orders(request_id,customer_name,phone,address,map_url,fulfillment,payment,channel,status,items,notes,subtotal_usd,delivery_fee_lbp,exchange_rate,total_usd,total_lbp,ip_hash,customer_user_id)
 values((payload->>'request_id')::uuid,payload->>'customer_name',payload->>'phone',payload->>'address',payload->>'map_url',payload->>'fulfillment',payload->>'payment',payload->>'channel',payload->>'status',payload->'items',payload->>'notes',(payload->>'subtotal_usd')::numeric,(payload->>'delivery_fee_lbp')::integer,(payload->>'exchange_rate')::numeric,(payload->>'total_usd')::numeric,(payload->>'total_lbp')::bigint,payload->>'ip_hash',nullif(payload->>'customer_user_id','')::uuid) returning * into result;
 return to_jsonb(result);end;$function$
;
revoke all on function public.record_order(jsonb) from public,anon,authenticated;
grant execute on function public.record_order(jsonb) to service_role;
