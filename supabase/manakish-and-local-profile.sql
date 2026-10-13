alter table public.extras add column group_name text not null default 'topping',add column allowed_items jsonb not null default '[]';
alter table public.settings add column business_name text not null default 'Wake and Bake - Tre Fratelli',add column site_url text not null default 'https://tre-fratelli-wheat.vercel.app',add column instagram_url text not null default '',add column tiktok_url text not null default '',add column facebook_url text not null default '',add column google_maps_url text not null default '',add column google_site_verification text not null default '',add column opening_time text not null default '06:00',add column closing_time text not null default '22:00';
update public.settings set address_ar='بيروت، ساقية الجنزير، شارع ساقية الجنزير',address_en='Sakiet El Janzeer Street, Sakiet El Janzeer, Beirut, Lebanon',hours='يومياً 06:00–22:00 / Daily 6 AM–10 PM',instagram_url='https://www.instagram.com/wakebake.lb/',tiktok_url='https://www.tiktok.com/@wake.bk',google_maps_url='https://maps.app.goo.gl/B67enhKKk5qCEZPJA',opening_time='06:00',closing_time='22:00' where id=1;
insert into public.extras(id,name_ar,name_en,price,visual,categories,enabled,sort_order,group_name,allowed_items) values
('veg_sesame','سمسم','Sesame',0.50,'sesame','["Manakish"]',true,20,'vegetable','["mk1","mk3"]'),
('veg_tomato','بندورة','Tomato',0.50,'tomato','["Manakish"]',true,21,'vegetable','[]'),
('veg_mint','نعنع','Mint',0.50,'mint','["Manakish"]',true,22,'vegetable','[]'),
('veg_pickle','كبيس','Pickles',0.50,'pickle','["Manakish"]',true,23,'vegetable','[]'),
('veg_cucumber','خيار','Cucumber',0.50,'cucumber','["Manakish"]',true,24,'vegetable','[]'),
('veg_arugula','روكا','Arugula',0.50,'arugula','["Manakish"]',true,25,'vegetable','[]'),
('veg_corn','ذرة','Corn',0.50,'corn','["Manakish"]',true,26,'vegetable','[]'),
('veg_olive','زيتون','Olives',0.50,'olive','["Manakish"]',true,27,'vegetable','[]'),
('veg_mayonnaise','مايونيز','Mayonnaise',0.50,'mayonnaise','["Manakish"]',true,28,'vegetable','[]'),
('veg_lettuce','خس','Lettuce',0.50,'lettuce','["Manakish"]',true,29,'vegetable','[]');
update public.menu_items set toppings='["kishk"]' where id='mk3';
update public.menu_items set toppings='["minced"]' where id='mk5';
update public.menu_items set toppings='["spinach"]' where id='mk7';
