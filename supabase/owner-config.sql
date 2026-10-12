create table public.owner_config(id integer primary key check(id=1),email text not null);
alter table public.owner_config enable row level security;
revoke all on public.owner_config from public,anon,authenticated;
grant all on public.owner_config to service_role;
-- Insert the verified owner's email through a private admin connection; never commit personal account metadata.
