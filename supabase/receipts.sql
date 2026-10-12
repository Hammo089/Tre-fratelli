alter table public.orders add column receipt_path text;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('payment-receipts','payment-receipts',false,2097152,array['image/jpeg','image/png','image/webp']);
create policy receipt_staff_read on storage.objects for select to authenticated using(bucket_id='payment-receipts' and exists(select 1 from public.staff where user_id=(select auth.uid())));
