alter table public.settings add column if not exists offer jsonb not null default '{"enabled":false,"title_ar":"","title_en":"","message_ar":"","message_en":"","image":"","item_id":""}';
alter table public.settings add constraint settings_offer_object check (jsonb_typeof(offer)='object');
