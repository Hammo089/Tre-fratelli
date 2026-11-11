alter table public.settings add column if not exists vegetable_bundle_lbp integer not null default 45000 check (vegetable_bundle_lbp >= 0);
alter table public.extras add column if not exists price_lbp bigint check (price_lbp >= 0 and price_lbp <= 9007199254740991);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('menu-music','menu-music',true,6291456,array['audio/mpeg'])
on conflict (id) do nothing;
create policy menu_music_staff_insert on storage.objects for insert to authenticated
with check (bucket_id = 'menu-music' and exists (
 select 1 from public.staff where user_id=(select auth.uid()) and role in ('owner','manager')
));
