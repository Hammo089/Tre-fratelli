set search_path=public,extensions;
create table public."customer_addresses" ("id" uuid default gen_random_uuid() not null,
"user_id" uuid default auth.uid() not null,
"label" text not null,
"address" text not null,
"created_at" timestamptz default now() not null,
constraint "customer_addresses_label_check" CHECK (((char_length(btrim(label)) >= 1) AND (char_length(btrim(label)) <= 40))),
constraint "customer_addresses_address_check" CHECK (((char_length(btrim(address)) >= 1) AND (char_length(btrim(address)) <= 500))),
constraint "customer_addresses_pkey" PRIMARY KEY (id));
alter table public."customer_addresses" enable row level security;
revoke all on public."customer_addresses" from public,anon,authenticated;
create table public."customer_feedback" ("id" uuid default gen_random_uuid() not null,
"kind" text not null,
"rating" int4,
"customer_name" text default ''::text not null,
"phone" text default ''::text not null,
"order_reference" text default ''::text not null,
"message" text not null,
"status" text default 'new'::text not null,
"staff_note" text default ''::text not null,
"ip_hash" text not null,
"created_at" timestamptz default now() not null,
constraint "customer_feedback_kind_check" CHECK ((kind = ANY (ARRAY['review'::text, 'complaint'::text, 'suggestion'::text]))),
constraint "customer_feedback_rating_check" CHECK (((rating >= 1) AND (rating <= 5))),
constraint "customer_feedback_message_check" CHECK (((length(message) >= 5) AND (length(message) <= 1500))),
constraint "customer_feedback_status_check" CHECK ((status = ANY (ARRAY['new'::text, 'in_progress'::text, 'resolved'::text]))),
constraint "customer_feedback_staff_note_check" CHECK ((length(staff_note) <= 1500)),
constraint "customer_feedback_pkey" PRIMARY KEY (id));
alter table public."customer_feedback" enable row level security;
revoke all on public."customer_feedback" from public,anon,authenticated;
create table public."extras" ("id" text not null,
"name_ar" text not null,
"name_en" text not null,
"price" numeric not null,
"visual" text not null,
"categories" jsonb not null,
"enabled" bool default true,
"sort_order" int4 default 0,
"group_name" text default 'topping'::text not null,
"allowed_items" jsonb default '[]'::jsonb not null,
"image" text default ''::text not null,
"price_lbp" int8,
constraint "extras_price_check" CHECK ((price >= (0)::numeric)),
constraint "extras_pkey" PRIMARY KEY (id),
constraint "extras_single_category" CHECK (((jsonb_typeof(categories) = 'array'::text) AND (jsonb_array_length(categories) = 1))),
constraint "extras_vegetable_manakish" CHECK (((group_name <> 'vegetable'::text) OR (categories = ANY (ARRAY['["Manakish"]'::jsonb, '["MiniManakish"]'::jsonb])))),
constraint "extras_price_lbp_check" CHECK (((price_lbp >= 0) AND (price_lbp <= '9007199254740991'::bigint))));
alter table public."extras" enable row level security;
revoke all on public."extras" from public,anon,authenticated;
create table public."menu_items" ("id" text not null,
"cat" text not null,
"name_ar" text not null,
"name_en" text not null,
"desc_ar" text default ''::text,
"desc_en" text default ''::text,
"image" text default ''::text,
"price" numeric not null,
"sizes" jsonb not null,
"toppings" jsonb default '[]'::jsonb not null,
"enabled" bool default true,
"sort_order" int4 default 0,
constraint "menu_items_price_check" CHECK ((price >= (0)::numeric)),
constraint "menu_items_pkey" PRIMARY KEY (id));
alter table public."menu_items" enable row level security;
revoke all on public."menu_items" from public,anon,authenticated;
create table public."orders" ("id" uuid default gen_random_uuid() not null,
"order_number" int8 generated always as identity not null,
"request_id" uuid not null,
"tracking_token" uuid default gen_random_uuid() not null,
"customer_name" text not null,
"phone" text not null,
"address" text default ''::text not null,
"map_url" text default ''::text,
"fulfillment" text not null,
"payment" text not null,
"payment_confirmed" bool default false not null,
"channel" text not null,
"status" text not null,
"items" jsonb not null,
"notes" text default ''::text,
"subtotal_usd" numeric not null,
"delivery_fee_lbp" int4 not null,
"exchange_rate" numeric not null,
"total_usd" numeric not null,
"total_lbp" int8 not null,
"ip_hash" text not null,
"created_at" timestamptz default now() not null,
"receipt_path" text,
"estimated_prep_minutes" int4 default 25 not null,
"ready_at" timestamptz,
"customer_message" text default ''::text not null,
"customer_user_id" uuid,
constraint "orders_fulfillment_check" CHECK ((fulfillment = ANY (ARRAY['delivery'::text, 'pickup'::text]))),
constraint "orders_payment_check" CHECK ((payment = ANY (ARRAY['cash'::text, 'whish'::text]))),
constraint "orders_channel_check" CHECK ((channel = ANY (ARRAY['web'::text, 'whatsapp'::text]))),
constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'whatsapp_pending'::text, 'accepted'::text, 'preparing'::text, 'ready'::text, 'out_for_delivery'::text, 'delivered'::text, 'cancelled'::text]))),
constraint "orders_subtotal_usd_check" CHECK ((subtotal_usd >= (0)::numeric)),
constraint "orders_delivery_fee_lbp_check" CHECK ((delivery_fee_lbp >= 0)),
constraint "orders_exchange_rate_check" CHECK ((exchange_rate > (0)::numeric)),
constraint "orders_total_usd_check" CHECK ((total_usd >= (0)::numeric)),
constraint "orders_total_lbp_check" CHECK ((total_lbp >= 0)),
constraint "orders_pkey" PRIMARY KEY (id),
constraint "orders_order_number_key" UNIQUE (order_number),
constraint "orders_request_id_key" UNIQUE (request_id),
constraint "orders_tracking_token_key" UNIQUE (tracking_token),
constraint "orders_estimated_prep_minutes_check" CHECK (((estimated_prep_minutes >= 5) AND (estimated_prep_minutes <= 180))),
constraint "orders_customer_message_check" CHECK ((length(customer_message) <= 500)));
alter table public."orders" enable row level security;
revoke all on public."orders" from public,anon,authenticated;
create table public."owner_config" ("id" int4 not null,
"email" text not null,
constraint "owner_config_id_check" CHECK ((id = 1)),
constraint "owner_config_pkey" PRIMARY KEY (id));
alter table public."owner_config" enable row level security;
revoke all on public."owner_config" from public,anon,authenticated;
create table public."settings" ("id" int4 not null,
"accepting_orders" bool default false not null,
"exchange_rate" numeric default 89500 not null,
"delivery_fee_lbp" int4 default 100000 not null,
"whatsapp_number" text default '9613960649'::text not null,
"whish_number" text default ''::text,
"address_ar" text default ''::text,
"address_en" text default ''::text,
"hours" text default ''::text,
"minimum_order_usd" numeric default 0,
"default_prep_minutes" int4 default 25 not null,
"business_name" text default 'Wake and Bake - Tre Fratelli'::text not null,
"site_url" text default 'https://tre-fratelli-wheat.vercel.app'::text not null,
"instagram_url" text default ''::text not null,
"tiktok_url" text default ''::text not null,
"facebook_url" text default ''::text not null,
"google_maps_url" text default ''::text not null,
"google_site_verification" text default ''::text not null,
"opening_time" text default '06:00'::text not null,
"closing_time" text default '22:00'::text not null,
"hero_image" text default ''::text not null,
"landing_order" jsonb default '["hero", "menu", "heritage", "feedback"]'::jsonb not null,
"menu_category_order" jsonb default '["Pizza", "Manakish", "Pastries", "Drinks", "Dessert"]'::jsonb not null,
"all_item_order" jsonb default '[]'::jsonb not null,
"offer" jsonb default '{"image": "", "enabled": false, "item_id": "", "title_ar": "", "title_en": "", "message_ar": "", "message_en": ""}'::jsonb not null,
"custom_categories" jsonb default '[]'::jsonb not null,
"music" jsonb default '{"enabled":false,"url":""}'::jsonb not null,
"vegetable_bundle_lbp" int4 default 45000 not null,
"customer_accounts_enabled" bool default false not null,
constraint "settings_id_check" CHECK ((id = 1)),
constraint "settings_exchange_rate_check" CHECK ((exchange_rate > (0)::numeric)),
constraint "settings_delivery_fee_lbp_check" CHECK ((delivery_fee_lbp >= 0)),
constraint "settings_minimum_order_usd_check" CHECK ((minimum_order_usd >= (0)::numeric)),
constraint "settings_pkey" PRIMARY KEY (id),
constraint "settings_default_prep_minutes_check" CHECK (((default_prep_minutes >= 5) AND (default_prep_minutes <= 180))),
constraint "settings_landing_order_array" CHECK ((jsonb_typeof(landing_order) = 'array'::text)),
constraint "settings_category_order_array" CHECK ((jsonb_typeof(menu_category_order) = 'array'::text)),
constraint "settings_all_item_order_array" CHECK ((jsonb_typeof(all_item_order) = 'array'::text)),
constraint "settings_offer_object" CHECK ((jsonb_typeof(offer) = 'object'::text)),
constraint "settings_custom_categories_array" CHECK ((jsonb_typeof(custom_categories) = 'array'::text)),
constraint "settings_music_object" CHECK ((jsonb_typeof(music) = 'object'::text)),
constraint "settings_vegetable_bundle_lbp_check" CHECK ((vegetable_bundle_lbp >= 0)));
alter table public."settings" enable row level security;
revoke all on public."settings" from public,anon,authenticated;
create table public."staff" ("user_id" uuid not null,
"role" text not null,
constraint "staff_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'manager'::text, 'cashier'::text]))),
constraint "staff_pkey" PRIMARY KEY (user_id));
alter table public."staff" enable row level security;
revoke all on public."staff" from public,anon,authenticated;
alter table public."staff" add constraint "staff_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public."orders" add constraint "orders_customer_user_id_fkey" FOREIGN KEY (customer_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public."customer_addresses" add constraint "customer_addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX menu_category_sort ON public.menu_items USING btree (cat, sort_order);
CREATE INDEX orders_status_created ON public.orders USING btree (status, created_at DESC);
CREATE INDEX orders_phone_created ON public.orders USING btree (phone, created_at DESC);
CREATE INDEX orders_ip_created ON public.orders USING btree (ip_hash, created_at DESC);
CREATE INDEX orders_customer_history_idx ON public.orders USING btree (customer_user_id, created_at DESC) WHERE (customer_user_id IS NOT NULL);
CREATE INDEX feedback_status_created ON public.customer_feedback USING btree (status, created_at DESC);
CREATE INDEX feedback_ip_created ON public.customer_feedback USING btree (ip_hash, created_at DESC);
CREATE OR REPLACE FUNCTION public.set_order_timing()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 if TG_OP='INSERT' then select default_prep_minutes into new.estimated_prep_minutes from public.settings where id=1;end if;
 if new.status in ('accepted','preparing') and new.ready_at is null then new.ready_at=now()+make_interval(mins=>new.estimated_prep_minutes);end if;
 return new;
end;$function$
;
revoke all on function public.set_order_timing() from public,anon,authenticated;
grant execute on function public.set_order_timing() to service_role;
CREATE OR REPLACE FUNCTION public.record_feedback(payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare result uuid;begin
 perform pg_advisory_xact_lock(hashtextextended(payload->>'ip_hash',71));
 if(select count(*) from public.customer_feedback where ip_hash=payload->>'ip_hash' and created_at>now()-interval '1 hour')>=5 then raise exception 'Too many messages. Please contact us on WhatsApp.';end if;
 insert into public.customer_feedback(kind,rating,customer_name,phone,order_reference,message,ip_hash) values(payload->>'kind',(payload->>'rating')::integer,payload->>'customer_name',payload->>'phone',payload->>'order_reference',payload->>'message',payload->>'ip_hash') returning id into result;return result;end;$function$
;
revoke all on function public.record_feedback(payload jsonb) from public,anon,authenticated;
grant execute on function public.record_feedback(payload jsonb) to service_role;
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
revoke all on function public.record_order(payload jsonb) from public,anon,authenticated;
grant execute on function public.record_order(payload jsonb) to service_role;
CREATE TRIGGER order_timing BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION set_order_timing();
create policy "receipt_staff_read" on "storage"."objects" as PERMISSIVE for SELECT to "authenticated" using (((bucket_id = 'payment-receipts'::text) AND (EXISTS ( SELECT 1
   FROM staff
  WHERE (staff.user_id = ( SELECT auth.uid() AS uid))))));
create policy "menu_image_delete" on "storage"."objects" as PERMISSIVE for DELETE to "authenticated" using (((bucket_id = 'menu-images'::text) AND (EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text])))))));
create policy "menu_image_update" on "storage"."objects" as PERMISSIVE for UPDATE to "authenticated" using (((bucket_id = 'menu-images'::text) AND (EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text]))))))) with check (((bucket_id = 'menu-images'::text) AND (EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text])))))));
create policy "menu_image_create" on "storage"."objects" as PERMISSIVE for INSERT to "authenticated" with check (((bucket_id = 'menu-images'::text) AND (EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text])))))));
create policy "menu_image_read" on "storage"."objects" as PERMISSIVE for SELECT to "anon","authenticated" using ((bucket_id = 'menu-images'::text));
create policy "menu_manage" on "public"."menu_items" as PERMISSIVE for ALL to "authenticated" using ((EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text])))))) with check ((EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));
create policy "menu_read" on "public"."menu_items" as PERMISSIVE for SELECT to "anon","authenticated" using (true);
create policy "extras_manage" on "public"."extras" as PERMISSIVE for ALL to "authenticated" using ((EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text])))))) with check ((EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));
create policy "extras_read" on "public"."extras" as PERMISSIVE for SELECT to "anon","authenticated" using (true);
create policy "settings_manage" on "public"."settings" as PERMISSIVE for UPDATE to "authenticated" using ((EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text])))))) with check ((EXISTS ( SELECT 1
   FROM staff
  WHERE ((staff.user_id = ( SELECT auth.uid() AS uid)) AND (staff.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));
create policy "settings_read" on "public"."settings" as PERMISSIVE for SELECT to "anon","authenticated" using (true);
create policy "orders_update" on "public"."orders" as PERMISSIVE for UPDATE to "authenticated" using ((EXISTS ( SELECT 1
   FROM staff
  WHERE (staff.user_id = ( SELECT auth.uid() AS uid))))) with check ((EXISTS ( SELECT 1
   FROM staff
  WHERE (staff.user_id = ( SELECT auth.uid() AS uid)))));
create policy "orders_read" on "public"."orders" as PERMISSIVE for SELECT to "authenticated" using ((EXISTS ( SELECT 1
   FROM staff
  WHERE (staff.user_id = ( SELECT auth.uid() AS uid)))));
create policy "staff_self" on "public"."staff" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "customer_addresses_remove" on "public"."customer_addresses" as PERMISSIVE for DELETE to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "customer_addresses_add" on "public"."customer_addresses" as PERMISSIVE for INSERT to "authenticated" with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy "customer_addresses_read" on "public"."customer_addresses" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "feedback_staff_update" on "public"."customer_feedback" as PERMISSIVE for UPDATE to "authenticated" using ((EXISTS ( SELECT 1
   FROM staff
  WHERE (staff.user_id = ( SELECT auth.uid() AS uid))))) with check ((EXISTS ( SELECT 1
   FROM staff
  WHERE (staff.user_id = ( SELECT auth.uid() AS uid)))));
create policy "feedback_staff_read" on "public"."customer_feedback" as PERMISSIVE for SELECT to "authenticated" using ((EXISTS ( SELECT 1
   FROM staff
  WHERE (staff.user_id = ( SELECT auth.uid() AS uid)))));
grant INSERT on public."menu_items" to "service_role";
grant SELECT on public."menu_items" to "service_role";
grant UPDATE on public."menu_items" to "service_role";
grant DELETE on public."menu_items" to "service_role";
grant TRUNCATE on public."menu_items" to "service_role";
grant REFERENCES on public."menu_items" to "service_role";
grant TRIGGER on public."menu_items" to "service_role";
grant SELECT on public."menu_items" to "anon";
grant INSERT on public."menu_items" to "authenticated";
grant SELECT on public."menu_items" to "authenticated";
grant UPDATE on public."menu_items" to "authenticated";
grant DELETE on public."menu_items" to "authenticated";
grant INSERT on public."extras" to "service_role";
grant SELECT on public."extras" to "service_role";
grant UPDATE on public."extras" to "service_role";
grant DELETE on public."extras" to "service_role";
grant TRUNCATE on public."extras" to "service_role";
grant REFERENCES on public."extras" to "service_role";
grant TRIGGER on public."extras" to "service_role";
grant SELECT on public."extras" to "anon";
grant INSERT on public."extras" to "authenticated";
grant SELECT on public."extras" to "authenticated";
grant UPDATE on public."extras" to "authenticated";
grant DELETE on public."extras" to "authenticated";
grant INSERT on public."settings" to "service_role";
grant SELECT on public."settings" to "service_role";
grant UPDATE on public."settings" to "service_role";
grant DELETE on public."settings" to "service_role";
grant TRUNCATE on public."settings" to "service_role";
grant REFERENCES on public."settings" to "service_role";
grant TRIGGER on public."settings" to "service_role";
grant SELECT on public."settings" to "anon";
grant SELECT on public."settings" to "authenticated";
grant UPDATE on public."settings" to "authenticated";
grant INSERT on public."orders" to "service_role";
grant SELECT on public."orders" to "service_role";
grant UPDATE on public."orders" to "service_role";
grant DELETE on public."orders" to "service_role";
grant TRUNCATE on public."orders" to "service_role";
grant REFERENCES on public."orders" to "service_role";
grant TRIGGER on public."orders" to "service_role";
grant SELECT on public."orders" to "authenticated";
grant INSERT on public."staff" to "service_role";
grant SELECT on public."staff" to "service_role";
grant UPDATE on public."staff" to "service_role";
grant DELETE on public."staff" to "service_role";
grant TRUNCATE on public."staff" to "service_role";
grant REFERENCES on public."staff" to "service_role";
grant TRIGGER on public."staff" to "service_role";
grant SELECT on public."staff" to "authenticated";
grant INSERT on public."owner_config" to "service_role";
grant SELECT on public."owner_config" to "service_role";
grant UPDATE on public."owner_config" to "service_role";
grant DELETE on public."owner_config" to "service_role";
grant TRUNCATE on public."owner_config" to "service_role";
grant REFERENCES on public."owner_config" to "service_role";
grant TRIGGER on public."owner_config" to "service_role";
grant INSERT on public."customer_addresses" to "service_role";
grant SELECT on public."customer_addresses" to "service_role";
grant UPDATE on public."customer_addresses" to "service_role";
grant DELETE on public."customer_addresses" to "service_role";
grant TRUNCATE on public."customer_addresses" to "service_role";
grant REFERENCES on public."customer_addresses" to "service_role";
grant TRIGGER on public."customer_addresses" to "service_role";
grant SELECT on public."customer_addresses" to "authenticated";
grant DELETE on public."customer_addresses" to "authenticated";
grant INSERT on public."customer_feedback" to "service_role";
grant SELECT on public."customer_feedback" to "service_role";
grant UPDATE on public."customer_feedback" to "service_role";
grant DELETE on public."customer_feedback" to "service_role";
grant TRUNCATE on public."customer_feedback" to "service_role";
grant REFERENCES on public."customer_feedback" to "service_role";
grant TRIGGER on public."customer_feedback" to "service_role";
grant SELECT on public."customer_feedback" to "authenticated";
grant INSERT ("address") on public."customer_addresses" to "authenticated";
grant UPDATE ("customer_message") on public."orders" to "authenticated";
grant UPDATE ("estimated_prep_minutes") on public."orders" to "authenticated";
grant INSERT ("label") on public."customer_addresses" to "authenticated";
grant UPDATE ("payment_confirmed") on public."orders" to "authenticated";
grant UPDATE ("ready_at") on public."orders" to "authenticated";
grant UPDATE ("staff_note") on public."customer_feedback" to "authenticated";
grant UPDATE ("status") on public."customer_feedback" to "authenticated";
grant UPDATE ("status") on public."orders" to "authenticated";
grant usage,select on all sequences in schema public to service_role;
alter publication supabase_realtime add table public.orders;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('payment-receipts','payment-receipts',false,2097152,array['image/jpeg','image/png','image/webp']);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('menu-images','menu-images',true,8388608,array['image/jpeg','image/png','image/webp']);

-- Checkout is WhatsApp-only: do not permit server-side order creation.
revoke execute on function public.record_order(jsonb) from public,anon,authenticated,service_role;
revoke insert on public.orders from anon,authenticated,service_role;
