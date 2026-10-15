-- Keep add-ons scoped to a single category, including mini manakish.
alter table public.extras drop constraint extras_vegetable_manakish;
alter table public.extras add constraint extras_vegetable_manakish check (group_name<>'vegetable' or categories in ('["Manakish"]'::jsonb,'["MiniManakish"]'::jsonb));
insert into public.menu_items(id,cat,name_ar,name_en,desc_ar,desc_en,image,price,sizes,toppings,enabled,sort_order)
select v.id,'AmericanPizza',v.ar,v.en,'بيتزا أمريكية — خصّص المكوّنات والإضافات على ذوقك','American pizza — customize your toppings and extras',v.image,round(v.lbp/s.exchange_rate,6),jsonb_build_array(jsonb_build_object('id','regular','name_ar','عادي','name_en','Regular','price',round(v.lbp/s.exchange_rate,6),'enabled',true)),v.toppings,true,v.ord
from (values
('am_pepperoni','بيبروني','Pepperoni',1650000::numeric,'assets/items/pz-pepperoni.jpg','["cheese","pepperoni"]'::jsonb,100),
('am_vegetarian','خضار','Vegetarian',1350000::numeric,'assets/items/pz-vegetarian.jpg','["cheese","mushroom","olive","pepper","onion"]'::jsonb,101),
('am_sausage','سجق','Sausage',1650000::numeric,'assets/items/pz-bresaola.jpg','["cheese","sausage"]'::jsonb,102),
('am_margarita','مارغريتا','Margarita',1350000::numeric,'assets/items/pz-margherita.jpg','["cheese","basil"]'::jsonb,103),
('am_chicken_bbq','دجاج باربكيو','Chicken BBQ',165000::numeric,'assets/items/pz-turkey.jpg','["bbq","cheese","chicken","onion"]'::jsonb,104)
) v(id,ar,en,lbp,image,toppings,ord) cross join public.settings s where s.id=1 on conflict(id) do nothing;
insert into public.menu_items(id,cat,name_ar,name_en,desc_ar,desc_en,image,price,sizes,toppings,enabled,sort_order)
select id,'Pastries',ar,en,ar,en,'assets/logo.png',price,jsonb_build_array(jsonb_build_object('id','regular','name_ar','قطعة','name_en','Piece','price',price,'enabled',true)),'[]'::jsonb,true,ord
from (values ('ps_spinach','فطاير سبانخ','Spinach Fatayer',1::numeric,120),('ps_purslane','فطاير بقلة','Purslane Fatayer',1::numeric,121),('ps_bacon','بيكون','Bikon Pastry',1.5::numeric,122),('ps_shamiyeh','شامية','Shamiyeh',1::numeric,123),('ps_halloumi_pesto','حلوم بيستو','Halloumi Pesto',2::numeric,124),('ps_pizza','بيتزا','Pizza Pastry',1.5::numeric,125)) v(id,ar,en,price,ord) on conflict(id) do nothing;
insert into public.menu_items(id,cat,name_ar,name_en,desc_ar,desc_en,image,price,sizes,toppings,enabled,sort_order)
select 'mini_'||m.id,'MiniManakish','ميني — '||m.name_ar,'Mini — '||m.name_en,'منقوشة ميني — السعر للقطعة','Mini manoushe — price per piece',m.image,p.price,jsonb_build_array(jsonb_build_object('id','mini','name_ar','ميني — قطعة','name_en','Mini — piece','price',p.price,'enabled',true)),m.toppings,true,150+row_number() over(order by m.sort_order,m.id)
from public.menu_items m cross join lateral (select greatest(0.5,round(coalesce((select (v->>'price')::numeric from jsonb_array_elements(m.sizes) v where (v->>'price')::numeric>0 and coalesce((v->>'enabled')::boolean,true) limit 1),nullif(m.price,0),1)/2,2)) price) p where m.cat='Manakish' on conflict(id) do nothing;
insert into public.extras(id,name_ar,name_en,price,visual,categories,enabled,sort_order,group_name,allowed_items,image)
select 'am_'||id,name_ar,name_en,price,visual,'["AmericanPizza"]'::jsonb,enabled,sort_order,group_name,'[]'::jsonb,image from public.extras where categories='["Pizza"]'::jsonb on conflict(id) do nothing;
insert into public.extras(id,name_ar,name_en,price,visual,categories,enabled,sort_order,group_name,allowed_items,image)
select 'mini_'||e.id,e.name_ar,e.name_en,e.price,e.visual,'["MiniManakish"]'::jsonb,e.enabled,e.sort_order,e.group_name,coalesce((select jsonb_agg('mini_'||allowed.value) from jsonb_array_elements_text(e.allowed_items) as allowed(value)),'[]'::jsonb),e.image from public.extras e where categories='["Manakish"]'::jsonb on conflict(id) do nothing;
-- Append new tabs without disturbing the restaurant's saved ordering.
update public.settings set menu_category_order=menu_category_order || case when not menu_category_order @> '["AmericanPizza"]'::jsonb then '["AmericanPizza"]'::jsonb else '[]'::jsonb end || case when not menu_category_order @> '["MiniManakish"]'::jsonb then '["MiniManakish"]'::jsonb else '[]'::jsonb end where id=1;
insert into public.extras(id,name_ar,name_en,price,visual,categories,enabled,sort_order,group_name,allowed_items,image) values
('am_sausage_extra','سجق','Sausage',2,'sausage','["AmericanPizza"]'::jsonb,true,40,'topping','[]'::jsonb,''),
('am_chicken_extra','دجاج','Chicken',2,'chicken','["AmericanPizza"]'::jsonb,true,41,'topping','[]'::jsonb,''),
('am_bbq_extra','صوص باربكيو','BBQ sauce',0.5,'bbq','["AmericanPizza"]'::jsonb,true,42,'topping','[]'::jsonb,'') on conflict(id) do nothing;
