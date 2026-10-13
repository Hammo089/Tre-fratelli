-- Optional photographic cutout for each add-on, editable by existing menu managers.
alter table public.extras add column if not exists image text not null default '';
