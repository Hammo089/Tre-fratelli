-- Owner-editable extra menu categories and background music (managed from the dashboard "Landing page" tab).
alter table public.settings add column if not exists custom_categories jsonb not null default '[]';
alter table public.settings add column if not exists music jsonb not null default '{"enabled":true,"url":""}';
alter table public.settings add constraint settings_custom_categories_array check (jsonb_typeof(custom_categories)='array');
alter table public.settings add constraint settings_music_object check (jsonb_typeof(music)='object');
