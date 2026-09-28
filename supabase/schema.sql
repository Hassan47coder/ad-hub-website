-- AD HUB Supabase schema. Safe to run again after the first setup.
create extension if not exists pgcrypto;
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (char_length(name) between 1 and 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  category text not null references public.categories(name) on update cascade on delete restrict,
  description text default '',
  thumbnail_url text default '',
  video_url text default '',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Add the category relationship if this is upgrading an early AD HUB schema.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'videos_category_fkey'
      and conrelid = 'public.videos'::regclass
  ) then
    alter table public.videos
      add constraint videos_category_fkey
      foreign key (category) references public.categories(name)
      on update cascade on delete restrict;
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
before update on public.videos
for each row execute function public.set_updated_at();

-- SECURITY DEFINER is required so policy checks do not recurse through admin_users RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.categories enable row level security;
alter table public.videos enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Public read videos" on public.videos;
drop policy if exists "Authenticated manage categories" on public.categories;
drop policy if exists "Authenticated manage videos" on public.videos;
drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Admins manage videos" on public.videos;
create policy "Public read categories" on public.categories for select to anon, authenticated using (true);
create policy "Public read videos" on public.videos for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage videos" on public.videos for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.categories(name,sort_order) values
('Real Estate',1),('Restaurants',2),('Skincare / Beauty',3),('Jewelry',4),('Fashion',5),('Clinics',6),('Products',7),('Corporate / Business',8),('Other',9)
on conflict (name) do nothing;

-- Public portfolio buckets. Limits match the client-side validation.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values
  ('portfolio-videos','portfolio-videos',true,52428800,array['video/mp4','video/webm','video/quicktime']),
  ('portfolio-thumbnails','portfolio-thumbnails',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public view portfolio assets" on storage.objects;
drop policy if exists "Authenticated upload portfolio assets" on storage.objects;
drop policy if exists "Authenticated update portfolio assets" on storage.objects;
drop policy if exists "Authenticated delete portfolio assets" on storage.objects;
drop policy if exists "Admins upload portfolio assets" on storage.objects;
drop policy if exists "Admins update portfolio assets" on storage.objects;
drop policy if exists "Admins delete portfolio assets" on storage.objects;
create policy "Public view portfolio assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('portfolio-videos','portfolio-thumbnails'));
create policy "Admins upload portfolio assets" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('portfolio-videos','portfolio-thumbnails') and (select public.is_admin()));
create policy "Admins update portfolio assets" on storage.objects
  for update to authenticated
  using (bucket_id in ('portfolio-videos','portfolio-thumbnails') and (select public.is_admin()))
  with check (bucket_id in ('portfolio-videos','portfolio-thumbnails') and (select public.is_admin()));
create policy "Admins delete portfolio assets" on storage.objects
  for delete to authenticated
  using (bucket_id in ('portfolio-videos','portfolio-thumbnails') and (select public.is_admin()));

-- FINAL MANUAL STEP after creating the Auth user:
-- insert into public.admin_users(user_id) values ('PASTE-AUTH-USER-UUID-HERE');
