alter table public.settings add column if not exists hero_image text not null default '';
alter table public.settings add column if not exists landing_order jsonb not null default '["hero","menu","heritage","feedback"]';
alter table public.settings add column if not exists menu_category_order jsonb not null default '["Pizza","Manakish","Pastries","Drinks","Dessert"]';
-- Each add-on belongs to one menu category. Historical order snapshots stay intact.
update public.extras set categories='["Manakish"]'::jsonb where group_name='vegetable';
update public.extras set categories='["Pizza"]'::jsonb where categories @> '["Pizza"]'::jsonb and categories @> '["Manakish"]'::jsonb;
alter table public.extras add constraint extras_single_category check (jsonb_typeof(categories)='array' and jsonb_array_length(categories)=1);
alter table public.extras add constraint extras_vegetable_manakish check (group_name<>'vegetable' or categories='["Manakish"]'::jsonb);
alter table public.settings add constraint settings_landing_order_array check (jsonb_typeof(landing_order)='array');
alter table public.settings add constraint settings_category_order_array check (jsonb_typeof(menu_category_order)='array');
