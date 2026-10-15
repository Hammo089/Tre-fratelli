alter table public.settings add column if not exists all_item_order jsonb not null default '[]';
alter table public.settings add constraint settings_all_item_order_array check (jsonb_typeof(all_item_order)='array');
