-- =====================================================================
-- PeptidesCodes: database schema, security rules and storage
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / ON CONFLICT.
-- =====================================================================

create extension if not exists pgcrypto;

-- Admin check: the admin user has app_metadata.role = 'admin'
-- (app_metadata can only be changed with the service/secret key, never by the user).
create or replace function public.is_admin() returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- vendors
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  headline text,
  logo_url text,
  website_url text,
  affiliate_url text,
  code text,
  discount_percent int not null default 0 check (discount_percent between 0 and 100),
  discount_label text,
  applies_to text default 'Sitewide',
  coupon_active boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 100,
  verified_at date default current_date,
  short_description text,
  about text,
  country text,
  founded int,
  compounds int,
  coa_count int,
  testing_lab text,
  shipping_info text,
  payment_methods text,
  open_to text,
  combinable text,
  min_order text,
  expiry text,
  faqs jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  keywords text,
  canonical_url text,
  og_image text,
  noindex boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pages add column if not exists published boolean not null default true;

-- ---------------------------------------------------------------- pages
create table if not exists public.pages (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  subtitle text,
  content text,
  faqs jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  keywords text,
  canonical_url text,
  og_image text,
  noindex boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- posts (guides)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  excerpt text,
  content text,
  cover_image text,
  author text,
  published boolean not null default true,
  published_at date default current_date,
  faqs jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  keywords text,
  canonical_url text,
  og_image text,
  noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- settings (single row)
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- inbox + analytics
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  subject text check (char_length(subject) <= 120),
  message text not null check (char_length(message) between 1 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 3 and 200),
  created_at timestamptz not null default now()
);

create table if not exists public.click_events (
  id bigint generated always as identity primary key,
  vendor_slug text not null check (char_length(vendor_slug) <= 120),
  kind text not null check (kind in ('copy', 'deal')),
  source text check (char_length(source) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists click_events_created_idx on public.click_events (created_at desc);
create index if not exists click_events_vendor_idx on public.click_events (vendor_slug);
create index if not exists vendors_sort_idx on public.vendors (sort_order);

-- ---------------------------------------------------------------- triggers
drop trigger if exists vendors_touch on public.vendors;
create trigger vendors_touch before update on public.vendors for each row execute function public.touch_updated_at();
drop trigger if exists pages_touch on public.pages;
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- row level security
alter table public.vendors enable row level security;
alter table public.pages enable row level security;
alter table public.posts enable row level security;
alter table public.settings enable row level security;
alter table public.messages enable row level security;
alter table public.subscribers enable row level security;
alter table public.click_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.vendors, public.pages, public.posts, public.settings to anon, authenticated;
grant insert, update, delete on public.vendors, public.pages, public.posts, public.settings to authenticated;
grant insert on public.messages, public.subscribers, public.click_events to anon, authenticated;
grant select, update, delete on public.messages, public.subscribers, public.click_events to authenticated;

-- public read
drop policy if exists "vendors read" on public.vendors;
create policy "vendors read" on public.vendors for select to anon, authenticated using (published or (select public.is_admin()));
drop policy if exists "pages read" on public.pages;
create policy "pages read" on public.pages for select to anon, authenticated using (true);
drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts for select to anon, authenticated using (published or (select public.is_admin()));
drop policy if exists "settings read" on public.settings;
create policy "settings read" on public.settings for select to anon, authenticated using (true);

-- admin write
drop policy if exists "vendors admin write" on public.vendors;
create policy "vendors admin write" on public.vendors for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "pages admin write" on public.pages;
create policy "pages admin write" on public.pages for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write" on public.posts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- visitors can submit; only admin can read
drop policy if exists "messages insert" on public.messages;
create policy "messages insert" on public.messages for insert to anon, authenticated with check (read = false);
drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "subscribers insert" on public.subscribers;
create policy "subscribers insert" on public.subscribers for insert to anon, authenticated with check (true);
drop policy if exists "subscribers admin" on public.subscribers;
create policy "subscribers admin" on public.subscribers for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "clicks insert" on public.click_events;
create policy "clicks insert" on public.click_events for insert to anon, authenticated with check (true);
drop policy if exists "clicks admin" on public.click_events;
create policy "clicks admin" on public.click_events for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------- storage (logos, images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'])
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));
