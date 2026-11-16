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

-- =====================================================================
-- Seed data (skips rows that already exist)
-- =====================================================================

insert into public.vendors (slug, name, logo_url, website_url, affiliate_url, code, discount_percent, discount_label, applies_to, coupon_active, featured, sort_order, verified_at, short_description, about, founded, compounds, coa_count, country, shipping_info, payment_methods, testing_lab, faqs, meta_title, meta_description, keywords, canonical_url, og_image, noindex, published) values
  ('ascension-peptides', 'Ascension Peptides', '/logos/ascension-peptides.png', 'https://ascensionpeptides.com', 'https://ascensionpeptides.com/ref/products/', 'products', 50, '50% Off', 'Sitewide', true, true, 1, '2026-11-13', 'Ascension Peptides is a U.S. research peptide supplier selling since 2023. Its prices sit above the market median on most compounds we compared.', '', 2023, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('vortex-research', 'Vortex Research', '/logos/vortex-research.png', 'https://vortexresearch.net', 'https://vortexresearch.net/?ref=adamadam', 'adamadam', 30, '30% Off', 'Sitewide', true, true, 2, '2026-11-13', 'Vortex Research is a U.S. research peptide supplier launched in 2026, with 21 products, 10 linked COA reports and a 30% discount code.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('kalyx-labs', 'Kalyx Labs', '/logos/kalyx-labs.png', 'https://kalyx-labs.com', 'https://kalyx-labs.com/?ref=peplookup', 'adamdan', 25, '25% Off', 'Sitewide', true, true, 3, '2026-11-13', 'Kalyx Labs is a U.S. research peptide supplier launched in 2026. It lists 23 compounds and was below the market median on 12 of the 22 we compared.', '', 2026, 23, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('nura-peptide', 'Nura Peptide', '/logos/nura-peptide.png', 'https://nurapeptide.com', 'https://nurapeptide.com/?ref=153', 'PEPLOOKUP', 20, '20% Off', 'Sitewide', true, true, 4, '2026-11-13', 'Nura Peptide is a U.S.-based supplier of research peptides, selling vials, capsules and nasal sprays for laboratory use only.', '', null, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('amino-club', 'Amino Club', '/logos/amino-club.png', 'https://aminoclub.com', 'https://aminoclub.com?utm_source=affiliate_marketing&code=PRODUCTS', 'PRODUCTS', 20, '20% Off', 'Sitewide', true, true, 5, '2026-11-13', 'Amino Club is a U.S. research peptide supplier selling since 2019. At our last check it was below the market median price on all 28 compounds we compared.', '', 2019, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('msamino', 'MsAmino', '/logos/msamino.png', 'https://msamino.com', 'https://msamino.com?ref=W9QVLNLY', 'W9QVLNLY', 20, '20% Off', 'Sitewide', true, true, 6, '2026-11-13', 'MsAmino is a U.S. research peptide supplier launched in 2026. It links 32 COA reports, but its prices sit above the market median.', '', 2026, null, 32, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('amino-science', 'Amino Science', '/logos/amino-science.png', 'https://aminoscience.io', 'https://aminoscience.io?ref=PRODUCTS', 'PRODUCTS', 20, '20% Off', 'Sitewide', true, true, 7, '2026-11-13', 'Amino Science is a U.S. research peptide supplier. It links 24 COA reports, but its prices sit above the market median.', '', null, null, 24, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('pepvida-labs', 'Pepvida Labs', '/logos/pepvida-labs.png', 'https://pepvidalabs.com', 'https://pepvidalabs.com/aff/27/', 'PEPLOOKUP', 20, '20% Off', 'Sitewide', true, true, 8, '2026-11-13', 'Pepvida Labs is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 18 of the 23 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('cielo-crew', 'Cielo Crew', '', '', '', 'PEPTOOKUP', 20, '20% Off', 'Sitewide', true, false, 9, '2026-11-13', 'Cielo Crew is a U.S. research peptide supplier launched in 2026. It lists 20 compounds and was below the market median on 10 of the 20 we compared.', '', 2026, 20, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('pure-amino', 'Pure Amino', '/logos/pure-amino.png', 'https://pureamino.com', 'https://www.pureamino.com/?ref=PRODUCTS', 'PRODUCTS', 20, '20% Off', 'Sitewide', true, false, 10, '2026-11-13', 'Pure Amino is a U.S. research peptide supplier selling since 2015. It lists 11 compounds and was below the market median on 6 of the 11 we compared.', '', 2015, 11, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peptides-canada', 'Peptides Canada', '/logos/peptides-canada.png', 'https://peptidescanada.store', 'https://peptidescanada.store/?ref=PEPLOOKUP', 'PEPLOOKUP', 15, '15% Off', 'Sitewide', true, false, 11, '2026-11-13', 'Peptides Canada is a Canadian research peptide supplier launched in 2026. At our last check it was below the market median price on 24 of the 27 compounds we compared.', '', 2026, null, null, 'Canada', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('sparta-labs', 'Sparta Labs', '/logos/sparta-labs.png', 'https://spartalabs.net', 'https://spartalabs.net/us/store?aff=PEPLOOKUP', 'PEPLOOKUP', 15, '15% Off', 'Sitewide', true, false, 12, '2026-11-13', 'Sparta Labs is a U.S. research peptide supplier launched in 2026. It lists 26 compounds and was below the market median on 8 of the 26 we compared.', '', 2026, 26, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('apex-peptides-lab', 'Apex Peptides Lab', '/logos/apex-peptides-lab.png', 'https://apexpeptideslab.com', 'https://apexpeptideslab.com/?coupon=peplookup', 'peplookup', 15, '15% Off', 'Sitewide', true, false, 13, '2026-11-13', 'Apex Peptides Lab is a U.S. research peptide supplier launched in 2026. It links 19 COA reports, but its prices sit above the market median.', '', 2026, null, 19, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('rejuven8-peptides', 'Rejuven8 Peptides', '/logos/rejuven8-peptides.png', 'https://rejuven8peptides.com', 'https://rejuven8peptides.com/?aff=peplookup', 'adam15', 15, '15% Off', 'Sitewide', true, false, 14, '2026-11-13', 'Rejuven8 Peptides is a U.S. research peptide supplier selling since 2025. It lists 28 compounds and was below the market median on 12 of the 28 we compared.', '', 2025, 28, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('rivn-research', 'RIVN Research', '/logos/rivn-research.png', 'https://rivnresearch.com', 'https://rivnresearch.com/?sld=3866', 'adamdan668815', 15, '15% Off', 'Sitewide', true, false, 15, '2026-11-13', 'RIVN Research is a U.S. research peptide supplier launched in 2026. It lists 26 compounds and was below the market median on 9 of the 24 we compared.', '', 2026, 26, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('ares-research-lab', 'Ares Research Lab', '/logos/ares-research-lab.png', 'https://aresresearchlab.com', 'https://aresresearchlab.com?ref=PRODUCTS', 'PRODUCTS', 15, '15% Off', 'Sitewide', true, false, 16, '2026-11-13', 'Ares Research Lab is a U.S. research peptide supplier launched in 2026. It lists 10 compounds and was below the market median on 4 of the 10 we compared.', '', 2026, 10, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('99-purity-peptides', '99 Purity Peptides', '/logos/99-purity-peptides.png', 'https://99puritypeptides.com', 'https://99puritypeptides.com/ref/PEPLOOKUP', 'adam-dan', 15, '15% Off', 'Sitewide', true, false, 17, '2026-11-13', '99 Purity Peptides is a U.S. research peptide supplier selling since 2025. It lists 12 compounds and was below the market median on 4 of the 12 we compared.', '', 2025, 12, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('biopeptide-technologies', 'BioPeptide Technologies', '', 'https://biopeptitech.com', 'https://biopeptitech.com/peplookup', 'peplookup', 15, '15% Off', 'Sitewide', true, false, 18, '2026-11-13', 'BioPeptide Technologies is a U.S. research peptide supplier selling since 2023. It lists 21 compounds and was below the market median on 8 of the 21 we compared.', '', 2023, 21, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('heez-research', 'HEEZ Research', '/logos/heez-research.png', 'https://heezresearch.com', 'https://heezresearch.com/?ref=peplookup', 'peplookup', 15, '15% Off', 'Sitewide', true, false, 19, '2026-11-13', 'HEEZ Research is a U.S. research peptide supplier launched in 2026. It links 10 COA reports, but its prices sit above the market median.', '', 2026, null, 10, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('pivot-labs', 'Pivot Labs', '/logos/pivot-labs.png', 'https://pivotlabsglobal.com', 'https://pivotlabsglobal.com/?ref=peplookup', 'adamdan', 15, '15% Off', 'Sitewide', true, false, 20, '2026-11-13', 'Pivot Labs is a U.S. research peptide supplier selling since 2024. Its prices sit above the market median on most compounds we compared.', '', 2024, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('aminovault', 'AminoVault', '/logos/aminovault.png', 'https://aminovault.com', 'https://aminovault.com/crew/112/', 'PEPLOOKUP', 15, '15% Off', 'Sitewide', true, false, 21, '2026-11-13', 'AminoVault is a U.S. research peptide supplier selling since 2025. It links 4 COA reports, but its prices sit above the market median.', '', 2025, null, 4, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('dynotides', 'Dynotides', '/logos/dynotides.png', 'https://dynotides.shop', 'https://dynotides.shop/?aff=31', 'PEPLOOKUP', 15, '15% Off', 'Sitewide', true, false, 22, '2026-11-13', 'Dynotides is a U.S. research peptide supplier launched in 2026. It links 14 COA reports, but its prices sit above the market median.', '', 2026, null, 14, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peptixa-labs', 'Peptixa Labs', '/logos/peptixa-labs.png', 'https://peptixalabs.com', 'https://peptixalabs.com/?ic=ADAMD', 'ADAMD', 15, '15% Off', 'Sitewide', true, false, 23, '2026-11-13', 'Peptixa Labs is a small U.S. research peptide supplier launched in 2026. It sells 9 products, links a COA for every compound, and offers 15% off with code ADAMD.', '', 2026, 9, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('disguised-alpha', 'Disguised Alpha', '/logos/disguised-alpha.png', 'https://disguisedalpha.com', 'https://disguisedalpha.com/?coupon=peplookup', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 24, '2026-11-13', 'Disguised Alpha is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 26 of the 31 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('biologix-labs', 'Biologix Labs', '/logos/biologix-labs.png', 'https://biologixlabsresearch.com', 'https://www.biologixlabsresearch.com/r/PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 25, '2026-11-13', 'Biologix Labs is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 22 of the 24 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peptide-labs-inc', 'Peptide Labs Inc', '/logos/peptide-labs-inc.png', 'https://peptidelabsinc.com', 'https://peptidelabsinc.com/?aff=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 26, '2026-11-13', 'Peptide Labs Inc is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on all 29 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('royal-peptides', 'Royal Peptides', '/logos/royal-peptides.png', 'https://royal-peptides.com', 'https://royal-peptides.com/?ref=peplookup', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 27, '2026-11-13', 'Royal Peptides is a research peptide supplier selling since 2024. It lists 24 compounds and was below the market median on 15 of the 24 we compared.', '', 2024, 24, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peptide-giants', 'Peptide Giants', '/logos/peptide-giants.png', 'https://peptidegiants.com', 'https://peptidegiants.com/?ref=peplookup', 'adamdan', 10, '10% Off', 'Sitewide', true, false, 28, '2026-11-13', 'Peptide Giants is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 27 of the 30 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('axon-chems', 'Axon Chems', '/logos/axon-chems.png', 'https://axonchems.com', 'https://axonchems.com/aff/Dlj7pbr', 'Dlj7pbr', 10, '10% Off', 'Sitewide', true, false, 29, '2026-11-13', 'Axon Chems is a U.S. research peptide supplier launched in 2026. It lists 27 compounds and was below the market median on 11 of the 27 we compared.', '', 2026, 27, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('american-peptides', 'American Peptides', '/logos/american-peptides.png', 'https://americanpeptides.us', 'https://www.americanpeptides.us/discount/PEPLOOKUP?ref=uzmxt6yada', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 30, '2026-11-13', 'American Peptides is a new U.S. supplier, launched in 2026. It links a lab report on 47 of its 53 products, but its prices usually sit above the market median.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peptide-titans', 'Peptide Titans', '/logos/peptide-titans.png', 'https://peptidetitans.com', 'https://peptidetitans.com/ref/PEPLOOKUP', 'products', 10, '10% Off', 'Sitewide', true, false, 31, '2026-11-13', 'Peptide Titans is a U.S. research peptide supplier launched in 2026. It lists 27 compounds and was below the market median on 14 of the 27 we compared.', '', 2026, 27, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('zc-labs', 'ZC Labs', '', 'https://zclabs.shop', 'https://zclabs.shop/?ea_ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 32, '2026-11-13', 'ZC Labs is a U.S. research peptide supplier launched in 2026. At our last check it had the lowest price per mg on 8 of the 19 compounds we could compare.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('eon-peptides', 'Eon Peptides', '/logos/eon-peptides.png', 'https://eonpeptides.com', 'https://eonpeptides.com/?utm_source=affiliate_marketing&code=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 33, '2026-11-13', 'Eon Peptides is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on all 25 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('elite-edge-biotech', 'Elite Edge Biotech', '/logos/elite-edge-biotech.png', 'https://eliteedgebiotech.com', 'https://eliteedgebiotech.com/ref/74/', '10ADAMDAN668', 10, '10% Off', 'Sitewide', true, false, 34, '2026-11-13', 'Elite Edge Biotech is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 24 of the 28 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('renova-peptides', 'Renova Peptides', '/logos/renova-peptides.png', 'https://renovapeptides.net', 'https://renovapeptides.net/?ref=peplookup', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 35, '2026-11-13', 'Renova Peptides is a research peptide supplier selling since 2025. At our last check it was below the market median price on all 13 compounds we compared.', '', 2025, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('neurolabs-research', 'NeuroLabs Research', '/logos/neurolabs-research.png', 'https://neurolabsresearch.com', 'https://neurolabsresearch.com/?ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 36, '2026-11-13', 'NeuroLabs Research is a U.S. research peptide supplier selling since 2025. It lists 27 compounds and was below the market median on 8 of the 25 we compared.', '', 2025, 27, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('prpeps', 'Prpeps', '/logos/prpeps.png', 'https://prpeps.com', 'https://prpeps.com?ref=66', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 37, '2026-11-13', 'Prpeps is a U.S. research peptide supplier selling since 2025. It lists 29 compounds and was below the market median on 10 of the 29 we compared.', '', 2025, 29, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peppy-and-me', 'Peppy&Me', '/logos/peppy-and-me.png', 'https://peppyandme.com', 'https://peppyandme.com/?ref=peplookup', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 38, '2026-11-13', 'Peppy&Me is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 22 of the 24 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('void-research', 'Void Research', '/logos/void-research.png', 'https://voidresearch.shop', 'https://voidresearch.shop/?ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 39, '2026-11-13', 'Void Research is a research peptide supplier launched in 2026. It lists 27 compounds and was below the market median on 13 of the 22 we compared.', '', 2026, 27, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('hlx-labs', 'HLX Labs', '/logos/hlx-labs.png', 'https://hlxlabs.shop', 'https://hlxlabs.shop/?ref=peplookup', 'products', 10, '10% Off', 'Sitewide', true, false, 40, '2026-11-13', 'HLX Labs is a U.S. research peptide supplier launched in 2026. It lists 23 compounds and was below the market median on 12 of the 22 we compared.', '', 2026, 23, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('elite-research-lab', 'Elite Research Lab', '/logos/elite-research-lab.png', 'https://eliteresearchlab.com', 'https://www.eliteresearchlab.com/?ref=peplookup', 'adamdan', 10, '10% Off', 'Sitewide', true, false, 41, '2026-11-13', 'Elite Research Lab is a U.S. research peptide supplier selling since 2025. It lists 25 compounds and was below the market median on 13 of the 25 we compared.', '', 2025, 25, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('vertex-labs', 'Vertex Labs', '/logos/vertex-labs.png', 'https://vertexpeptideslab.org', 'https://vertexpeptideslab.org/?coupon=products', 'products', 10, '10% Off', 'Sitewide', true, false, 42, '2026-11-13', 'Vertex Labs (Vertex Peptides Lab) is a U.S. research peptide supplier launched in 2026. We link 23 of its COA reports, and all 39 listings we track were in stock.', '', 2026, null, 23, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('alpha-peptides', 'Alpha Peptides', '/logos/alpha-peptides.png', 'https://alpha-peptides.com', 'https://alpha-peptides.com/aff/peplookup/', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 43, '2026-11-13', 'Alpha Peptides is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 20 of the 23 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('crownwell-research', 'Crownwell Research', '/logos/crownwell-research.png', 'https://crownwellresearch.com', 'https://crownwellresearch.com/afref/ax9/?campaign=tes&sub_id=peplookup', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 44, '2026-11-13', 'Crownwell Research is a U.S. research peptide supplier launched in 2026. It lists 18 compounds and was below the market median on 12 of the 18 we compared.', '', 2026, 18, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('nextgen-peps', 'NextGen Peps', '/logos/nextgen-peps.png', 'https://nextgenpeps.com', 'https://nextgenpeps.com?ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 45, '2026-11-13', 'NextGen Peps is a research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.', '', 2025, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('puratek-peptides', 'PuraTek Peptides', '/logos/puratek-peptides.png', 'https://puratekpeptides.com', 'https://puratekpeptides.com/ref/370/', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 46, '2026-11-13', 'PuraTek Peptides is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 25 of the 26 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('synthesis-peptides', 'Synthesis Peptides', '/logos/synthesis-peptides.png', 'https://synthesispeptides.co', 'https://synthesispeptides.co/?synthaff=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 47, '2026-11-13', 'Synthesis Peptides is a U.S. research peptide supplier launched in 2026. It links 23 COA reports, but its prices sit above the market median.', '', 2026, null, 23, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('qureshi-labs', 'Qureshi Labs', '/logos/qureshi-labs.png', 'https://qureshilabs.com', 'https://qureshilabs.com/?utm_source=partner&code=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 48, '2026-11-13', 'Qureshi Labs is a U.S. research peptide supplier launched in 2026. It lists 21 compounds and was below the market median on 6 of the 21 we compared.', '', 2026, 21, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('blank-peptides', 'Blank Peptides', '', 'https://blankpeptides.com', 'https://blankpeptides.com/r/peplookup', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 49, '2026-11-13', 'Blank Peptides is a U.S. research peptide supplier launched in 2026. It links 27 COA reports and offers overnight shipping, but its prices sit above the market median.', '', 2026, null, 27, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('bioinfinity', 'Bioinfinity', '/logos/bioinfinity.png', 'https://bioinfinity.co', 'https://bioinfinity.co?ref=peplookup', 'adamdaFAKR', 10, '10% Off', 'Sitewide', true, false, 50, '2026-11-13', 'Bioinfinity is a U.S. research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('prime-peptide-solutions', 'Prime Peptide Solutions', '/logos/prime-peptide-solutions.png', 'https://primepepsolutions.com', 'https://primepepsolutions.com/?ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 51, '2026-11-13', 'Prime Peptide Solutions is a U.S. research peptide supplier launched in 2026. It lists 25 compounds and was below the market median on 9 of the 25 we compared.', '', 2026, 25, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('simms-research', 'Simms Research', '/logos/simms-research.png', 'https://simmsresearch.com', 'https://simmsresearch.com/?sr_ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 52, '2026-11-13', 'Simms Research is a U.S. research peptide supplier launched in 2026. Its prices sit above the market median on most compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('genpeptide', 'GenPeptide', '/logos/genpeptide.png', 'https://genpeptide.com', 'https://www.genpeptide.com/?ref=peplookup', 'adamdan', 10, '10% Off', 'Sitewide', true, false, 53, '2026-11-13', 'GenPeptide is a research peptide supplier selling since 2025. It lists 22 compounds and was below the market median on 15 of the 22 we compared.', '', 2025, 22, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('axis-peptide-labs', 'Axis Peptide Labs', '/logos/axis-peptide-labs.png', 'https://axispeptidelabs.com', 'https://axispeptidelabs.com/ref/peplookup/', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 54, '2026-11-13', 'Axis Peptide Labs is a U.S. research peptide supplier launched in 2026. Its COAs come from Janoshik and we link 15 of them, but its prices sit above the market median.', '', 2026, null, 15, 'United States', '', '', 'Janoshik Analytical', '[]'::jsonb, '', '', '', '', '', false, true),
  ('ramp-peptides', 'RAMP Peptides', '/logos/ramp-peptides.png', 'https://ramppeptides.com', 'https://ramppeptides.com/?coupon=products', 'products', 10, '10% Off', 'Sitewide', true, false, 55, '2026-11-13', 'RAMP Peptides is a U.S. research peptide supplier launched in 2026. It lists 23 compounds and was below the market median on 17 of the 23 we compared.', '', 2026, 23, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('palmetto-peptides', 'Palmetto Peptides', '/logos/palmetto-peptides.png', 'https://palmettopeptides.com', 'https://palmettopeptides.com/?ref=PRODUCTS', 'PRODUCTS', 10, '10% Off', 'Sitewide', true, false, 56, '2026-11-13', 'Palmetto Peptides is a U.S. research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('vantage-aminos', 'Vantage Aminos', '/logos/vantage-aminos.png', 'https://vantageaminos.co', 'https://vantageaminos.co/ref/peplookup/', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 57, '2026-11-13', 'Vantage Aminos is a U.S. research peptide supplier launched in 2026. It links 6 COA reports, but its prices sit above the market median.', '', 2026, null, 6, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('aminexa', 'Aminexa', '/logos/aminexa.png', 'https://aminexa.net', 'https://aminexa.net/r/products', 'products', 10, '10% Off', 'Sitewide', true, false, 58, '2026-11-13', 'Aminexa is a U.S. research peptide supplier launched in 2026. Its prices sit above the market median on most compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('blue-ridge-peptides', 'Blue Ridge Peptides', '/logos/blue-ridge-peptides.png', 'https://blueridgepeptides.com', 'https://blueridgepeptides.com/?coupon=products', 'products', 10, '10% Off', 'Sitewide', true, false, 59, '2026-11-13', 'Blue Ridge Peptides is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 22 of the 23 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('ameano-peptides', 'Ameano Peptides', '/logos/ameano-peptides.png', 'https://ameanopeptides.com', 'https://ameanopeptides.com/?ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 60, '2026-11-13', 'Ameano Peptides is a U.S. research peptide supplier selling since 2025. It lists 21 compounds and was below the market median on 9 of the 21 we compared.', '', 2025, 21, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('arizen-biolabs', 'Arizen BioLabs', '/logos/arizen-biolabs.png', 'https://arizenbiolabs.com', 'https://arizenbiolabs.com/ref/PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 61, '2026-11-13', 'Arizen BioLabs is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 13 of the 17 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('true-peptides', 'True Peptides', '/logos/true-peptides.png', 'https://true-peptides.com', 'https://true-peptides.com/?ref=products', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 62, '2026-11-13', 'True Peptides is a U.S. research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('ventra-sciences', 'Ventra Sciences', '/logos/ventra-sciences.png', 'https://ventrasciences.com', 'https://ventrasciences.com/go/PRODUCTS/', 'PRODUCTS', 10, '10% Off', 'Sitewide', true, false, 63, '2026-11-13', 'Ventra Sciences is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 13 of the 17 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('ech3lon-labs', 'Ech3lon Labs', '/logos/ech3lon-labs.png', 'https://ech3lonlabs.com', 'https://ech3lonlabs.com/?ref=PRODUCTS', 'PRODUCTS', 10, '10% Off', 'Sitewide', true, false, 64, '2026-11-13', 'Ech3lon Labs is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on all 15 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('elevate-research-co', 'Elevate Research Co', '/logos/elevate-research-co.png', 'https://elevateresearchco.com', 'https://elevateresearchco.com/?ref=PRODUCTS', 'PRODUCTS', 10, '10% Off', 'Sitewide', true, false, 65, '2026-11-13', 'Elevate Research Co is a U.S. research peptide supplier launched in 2026. It lists 16 compounds and was below the market median on 8 of the 16 we compared.', '', 2026, 16, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('trusted-peps', 'Trusted Peps', '/logos/trusted-peps.png', 'https://trustedpeps.us', 'https://trustedpeps.us/?aff=13', 'products', 10, '10% Off', 'Sitewide', true, false, 66, '2026-11-13', 'Trusted Peps is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 14 of the 15 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('la-peptides', 'LA Peptides', '/logos/la-peptides.png', 'https://lapeptides.net', 'https://lapeptides.net/?ref=peplookup', 'ADAMDAN', 10, '10% Off', 'Sitewide', true, false, 67, '2026-11-13', 'LA Peptides is a U.S. research peptide supplier selling since 2025. It lists 11 compounds and was below the market median on 3 of the 11 we compared.', '', 2025, 11, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('bionova-peptides', 'Bionova Peptides', '', '', '', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 68, '2026-11-13', 'Bionova Peptides is a U.S. research peptide supplier launched in 2026. It lists 16 compounds and was below the market median on 6 of the 16 we compared.', '', 2026, 16, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('idun-peptides', 'IDUN Peptides', '/logos/idun-peptides.png', 'https://idunpeptides.com', 'https://idunpeptides.com/?ref=PEPLOOKUP', 'PEPLOOKUP', 10, '10% Off', 'Sitewide', true, false, 69, '2026-11-13', 'IDUN Peptides is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 14 of the 15 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('elytra-labs', 'Elytra Labs', '/logos/elytra-labs.png', 'https://elytralabs.shop', 'https://elytralabs.shop/?aff=PRODUCTS', 'PRODUCTS', 10, '10% Off', 'Sitewide', true, false, 70, '2026-11-13', 'Elytra Labs is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on all 13 compounds we compared.', '', 2026, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('genx', 'GenX', '/logos/genx.png', 'https://genx.bio', 'https://genx.bio/ref/31/', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 71, '2026-11-13', 'GenX is a U.S. research peptide supplier selling since 2017. Its prices sit above the market median on most compounds we compared.', '', 2017, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('pepvida', 'Pepvida', '/logos/pepvida.png', 'https://pepvida.com', 'https://pepvida.com/?ref=peplookup', 'ADAM', 10, '10% Off', 'Sitewide', true, false, 72, '2026-11-13', 'Pepvida is a Canadian research peptide supplier selling since 2025. It links 8 COA reports, but its prices sit above the market median.', '', 2025, null, 8, 'Canada', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peptix-usa', 'Peptix USA', '/logos/peptix-usa.png', 'https://peptixusa.com', 'https://peptixusa.com?ref=peplookup', 'peplookup', 10, '10% Off', 'Sitewide', true, false, 73, '2026-11-13', 'Peptix USA is a small U.S. research peptide supplier launched in 2026. It lists 5 products, and its BPC-157 was below the market median price at our last check.', '', 2026, 5, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('licensed-peptides', 'Licensed Peptides', '/logos/licensed-peptides.png', 'https://licensedpeptides.com', 'https://licensedpeptides.com/ref/peplookup/', 'peplookup', 5, '5% Off', 'Sitewide', true, false, 74, '2026-11-13', 'Licensed Peptides is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 23 of the 29 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('reta-one-labs', 'Reta One Labs', '/logos/reta-one-labs.png', 'https://retaonelabs.com', 'https://retaonelabs.com/ref/owc70/', 'peplookup', 5, '5% Off', 'Sitewide', true, false, 75, '2026-11-13', 'Reta One Labs is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on all 15 compounds we compared.', '', 2025, null, null, 'United States', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('the-peptide-labs', 'The Peptide Labs', '', 'https://thepeptidelabs.ca', 'https://thepeptidelabs.ca/ref/165/', '', 0, 'Partner deal', 'Sitewide', false, false, 200, '2026-11-13', 'The Peptide Labs is a Canadian research peptide supplier. We have a partner link but no verified public code yet.', '', null, null, null, 'Canada', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('peak-lab-peptides', 'Peak Lab Peptides', '/logos/peak-lab-peptides.png', 'https://peaklabpeptides.com', 'https://peaklabpeptides.com?afref=a1n9', '', 0, 'Partner deal', 'Sitewide', false, false, 201, '2026-11-13', 'Peak Lab Peptides is a research peptide supplier. We have a partner link but no verified public code yet.', '', null, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('aero-peptides', 'Aero Peptides', '/logos/aero-peptides.png', 'https://aeropeptides.com', 'https://aeropeptides.com/?ref=peplookup', '', 0, 'Partner deal', 'Sitewide', false, false, 202, '2026-11-13', 'Aero Peptides is a research peptide supplier. We have a partner link but no verified public code yet.', '', null, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('pristine-aminos', 'Pristine Aminos', '/logos/pristine-aminos.png', 'https://pristineaminos.com', 'https://pristineaminos.com/aff/18/', '', 0, 'Partner deal', 'Sitewide', false, false, 203, '2026-11-13', 'Pristine Aminos is a research peptide supplier. We have a partner link but no verified public code yet.', '', null, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('kylo-peptides', 'Kylo Peptides', '/logos/kylo-peptides.png', 'https://kylopeptides.com', 'https://kylopeptides.com/?wpam_id=163', '', 0, 'Partner deal', 'Sitewide', false, false, 204, '2026-11-13', 'Kylo Peptides is a research peptide supplier. We have a partner link but no verified public code yet.', '', null, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('pure-peptides', 'Pure Peptides', '/logos/pure-peptides.png', 'https://purepeptides.com', 'https://purepeptides.com?ref=ADAMDAN9789', '', 0, 'Partner deal', 'Sitewide', false, false, 205, '2026-11-13', 'Pure Peptides is a research peptide supplier. We have a partner link but no verified public code yet.', '', null, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true),
  ('ps-peptides', 'PS Peptides', '/logos/ps-peptides.png', 'https://pspeptides.com', 'https://pspeptides.com/?ref=peplookup-com', '', 0, 'Partner deal', 'Sitewide', false, false, 206, '2026-11-13', 'PS Peptides is a research peptide supplier. We have a partner link but no verified public code yet.', '', null, null, null, '', '', '', '', '[]'::jsonb, '', '', '', '', '', false, true)
on conflict (slug) do nothing;

insert into public.pages (slug, title, subtitle, content, faqs, meta_title, meta_description, keywords, canonical_url, og_image, noindex) values
  ('home', 'Peptide Coupon & Discount Codes', 'Copy a verified peptide coupon code from 80+ research peptide suppliers, up to 50% off. Every promo code is checked by hand and dated.', '## Peptide coupon codes, checked and dated

PeptidesCodes lists working **peptide coupon codes**, **peptide discount codes** and **peptide promo codes** for research peptide suppliers in the United States, Canada and beyond. Instead of a long list of expired codes, every entry shows the discount, whether it is sitewide or limited to eligible products, and the date we last confirmed it.

### How to pick the best peptide discount code

- **Compare the final price, not just the percentage.** A 10% code at a cheaper store can beat a 30% code elsewhere. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows the maths.
- **Check the COA.** A discount only matters if the product is what the label says. Learn [how to read a peptide COA](/guides/how-to-read-a-peptide-coa).
- **Use one code per order.** Most vendors don''t allow stacking.

### Research use only

Products sold by the suppliers listed here are for laboratory research use only. PeptidesCodes does not sell peptides or give medical advice.', '[{"q":"What is a peptide coupon code?","a":"A peptide coupon code is a short text code a research peptide supplier accepts at checkout for a discount, usually a percentage off eligible products or the whole order. Copy the code here, paste it into the store''s coupon box and check that the saving appears before you pay."},{"q":"Are the codes on PeptidesCodes verified?","a":"Yes. Each code shows the date we last checked it. We apply codes in a real cart where possible and remove or flag codes that stop working."},{"q":"Which peptide supplier has the biggest discount right now?","a":"The table on this page is sorted by discount. The highest current code is listed first, and the top deals section shows our featured offers."},{"q":"Can I combine two peptide coupon codes?","a":"Most suppliers accept one code per order. Unless a vendor page says stacking is confirmed, plan on using a single code."},{"q":"Does PeptidesCodes sell peptides?","a":"No. PeptidesCodes is an independent coupon directory. We don''t sell products or give medical advice. Products from listed suppliers are for laboratory research use only."},{"q":"How do you make money?","a":"Some links on this site are affiliate links. If you buy after clicking one, the supplier may pay us a commission at no extra cost to you. It does not change the discount you get."}]'::jsonb, 'Peptide Coupon Codes & Discount Codes | Up to 50% Off | PeptidesCodes', 'Verified peptide coupon codes and promo codes from 80+ research peptide vendors, up to 50% off. Copy a code in one click, every code is checked and dated.', 'peptide coupon code, peptide discount code, peptide promo code, research peptide coupon, peptides codes', '', '', false),
  ('coupons', 'All Peptide Promo Codes & Coupons', 'Every peptide promo code we track, from 5% to 50% off. Search by vendor, filter by discount or offer type, and copy a code in one click.', '', '[{"q":"How often are these peptide promo codes updated?","a":"We re-check codes on a rolling basis and show the last verified date beside every code."},{"q":"What does ''Sitewide'' mean?","a":"A sitewide code applies to the whole order. ''Eligible products'' means the vendor limits the code to certain items."}]'::jsonb, 'All Peptide Promo Codes & Coupons (Verified List) | PeptidesCodes', 'The full list of verified peptide promo codes and coupons, sorted by discount. Filter by vendor, discount or offer type and copy a code in one click.', 'peptide promo codes, peptide coupons list, research peptide discount codes', '', '', false),
  ('vendors', 'Research Peptide Vendors A-Z', 'Every research peptide supplier we track, with its current coupon code, discount and verification date.', '', '[]'::jsonb, 'Research Peptide Vendors A-Z With Coupon Codes | PeptidesCodes', 'Browse every research peptide vendor we track, A to Z, with current coupon codes, discounts, COA counts and verification dates.', 'peptide vendors, research peptide suppliers, peptide vendor list', '', '', false),
  ('guides', 'Peptide Buying Guides', 'Plain-English guides to using peptide coupon codes, reading certificates of analysis and comparing prices.', '', '[]'::jsonb, 'Peptide Buying Guides | Coupons, COAs & Price Comparison | PeptidesCodes', 'Guides on using peptide coupon codes, reading a peptide certificate of analysis (COA) and comparing peptide prices per mg after a discount.', 'peptide guide, how to read peptide COA, peptide price per mg', '', '', false),
  ('extension', 'Get Peptide Coupon Codes Automatically', 'Our free Chrome extension shows a verified code and the supplier''s rating the moment you open a supported peptide store.', '## How it works

1. Visit a supported supplier''s website.
2. If we have a verified code for that store, the extension icon shows a badge and a small card appears with the discount and the code.
3. Click **Activate offer**, then copy the code or fill it into the store''s coupon field.
4. Press the store''s own Apply button to see your discount.

## Privacy first

- Runs only on supported supplier websites
- Does not read or collect your browsing history
- Does not collect personal information, passwords or payment details
- Your settings are stored locally in your browser

## Affiliate disclosure

When you click **Activate offer**, we may earn a commission from the supplier at no extra cost to you. Offers are only activated when you click, and the extension never replaces another site''s referral.', '[{"q":"Is the extension free?","a":"Yes. The extension is free to install and use."},{"q":"Does the extension place orders or submit forms?","a":"No. Auto-fill is off by default and the extension never submits forms or places orders for you."},{"q":"Which browsers are supported?","a":"Google Chrome and Chromium-based browsers that can install extensions from the Chrome Web Store, such as Brave and Edge."}]'::jsonb, 'Peptide Coupon Code Chrome Extension (Free) | PeptidesCodes', 'Install our free Chrome extension to see verified peptide promo codes on 80+ supplier sites and apply them in one click. No browsing history collected.', 'peptide coupon extension, peptide promo code chrome extension, peplookup extension', '', '', false),
  ('about', 'About PeptidesCodes', 'An independent directory of verified research peptide coupon codes.', '## What we do

PeptidesCodes collects coupon and promo codes from research peptide suppliers, checks them, and lists each one with the date of our last check. You can copy a code in one click and go straight to the store.

## How we verify codes

1. **We source the code** directly from the supplier or its partner program.
2. **We test it** in a real cart where the store allows it, and note whether it is sitewide or limited to eligible products.
3. **We date it.** Every code shows the day we last confirmed it worked.
4. **We remove dead codes.** If a code stops working, we update or flag it.

## Independence

We don''t sell peptides and we don''t give medical advice. Some links are affiliate links, which is how the site is funded; a commission never changes the discount you receive. Read our [affiliate disclosure](/affiliate-disclosure).

## Research use only

Products sold by listed suppliers are intended for laboratory research use only and are not for human consumption.', '[]'::jsonb, 'About PeptidesCodes | How We Verify Peptide Coupon Codes', 'PeptidesCodes is an independent directory of verified research peptide coupon codes. Learn how we source, test and date every code.', 'about peptidescodes, peptide coupon verification', '', '', false),
  ('contact', 'Contact Us', 'Found a code that doesn''t work, or want your store listed? Get in touch.', 'We usually reply within one business day. Suppliers who want to be listed or update a code can use the form and include the store URL.', '[]'::jsonb, 'Contact PeptidesCodes | Report a Code or List Your Store', 'Contact PeptidesCodes to report a peptide coupon code that doesn''t work, suggest a supplier, or list your research peptide store.', 'contact peptidescodes', '', '', false),
  ('affiliate-disclosure', 'Affiliate Disclosure', 'How PeptidesCodes is funded.', 'PeptidesCodes is reader-supported. Some links on this website are affiliate links. If you click one and make a purchase, the supplier may pay us a commission **at no extra cost to you**.

Affiliate relationships do not change the discount a code gives you, and we list codes from suppliers whether or not we have a partner agreement with them.

Coupon codes such as partner codes may be tied to our affiliate account with the supplier.

If you have questions, email us at info@peptidescodes.com.', '[]'::jsonb, 'Affiliate Disclosure | PeptidesCodes', 'How PeptidesCodes is funded: some links are affiliate links and we may earn a commission at no extra cost to you.', '', '', '', false),
  ('privacy-policy', 'Privacy Policy', 'What we collect and why.', '## Information we collect

- **Contact form:** your name, email and message, used only to reply to you.
- **Newsletter:** your email address, used only to send code updates. You can unsubscribe at any time.
- **Click statistics:** when you click a deal we record which vendor was clicked and when, without personal identifiers, so we can see which codes are useful.

## Cookies

We use only essential storage needed for the site to work. Supplier websites you visit through our links have their own privacy policies and may set affiliate cookies.

## Your rights

To access or delete data you have sent us, email info@peptidescodes.com.', '[]'::jsonb, 'Privacy Policy | PeptidesCodes', 'The PeptidesCodes privacy policy: what information we collect, how we use it, and how to contact us.', '', '', '', false),
  ('terms', 'Terms of Use & Research Disclaimer', 'Please read before using this website.', '## Information only

PeptidesCodes publishes coupon codes and supplier information for convenience. Codes, prices and terms are set by suppliers and can change without notice. Always confirm the discount at checkout before paying.

## Research use only

Products sold by suppliers listed on this website are intended for **laboratory research use only**. They are not drugs, foods or cosmetics and are not for human or veterinary use. Nothing on this site is medical advice.

## No endorsement

Listing a supplier is not an endorsement. Do your own due diligence, including reviewing certificates of analysis.

## Limitation of liability

PeptidesCodes is not responsible for purchases made on third-party websites.', '[]'::jsonb, 'Terms of Use & Research Disclaimer | PeptidesCodes', 'Terms of use for PeptidesCodes and the research-use-only disclaimer for products sold by listed peptide suppliers.', '', '', '', false)
on conflict (slug) do nothing;

insert into public.posts (slug, title, excerpt, cover_image, author, published, published_at, content, faqs, meta_title, meta_description, keywords, canonical_url, og_image, noindex) values
  ('how-to-use-a-peptide-coupon-code', 'How to Use a Peptide Coupon Code (and Make Sure It Worked)', 'A step-by-step guide to applying a research peptide promo code at checkout, plus the five most common reasons a code fails.', '/guides/how-to-use-a-peptide-coupon-code.svg', '', true, '2026-11-10', 'Applying a coupon code takes under a minute, but a few small mistakes cause most failed codes. Here is the process we use when we verify codes.

## Step 1: Copy the exact code

Use the **Copy** button on PeptidesCodes rather than typing the code. Codes can be case sensitive, and a stray space at the end is the most common reason a code is rejected.

## Step 2: Open the store through the deal link

Click **Get deal** to open the supplier. Some partner codes are tied to the referral link, so opening the store through it helps make sure the discount is credited.

## Step 3: Add eligible products to your cart

Check whether the code is **Sitewide** or limited to **Eligible products**. Our vendor pages show this for every code.

## Step 4: Paste the code at checkout

Find the field labelled *coupon*, *promo code* or *discount code*, usually on the cart page or the first checkout step. Paste and press **Apply**.

## Step 5: Check the discount line

Before paying, confirm the discount appears as its own line in the order summary and that the total dropped by the expected amount.

## Why isn''t my peptide coupon code working?

1. **Extra spaces or wrong case.** Paste the code again.
2. **Another code is already applied.** Most stores accept one code per order.
3. **Items aren''t eligible.** Sale items or bundles are often excluded.
4. **Minimum order not met.** Some codes need a minimum cart value.
5. **The code has expired.** Check the verified date on our page and try the next-best code.

If a code still fails, [contact us](/contact) and we will re-check it.', '[{"q":"Are peptide coupon codes case sensitive?","a":"Some stores treat codes as case sensitive. Copying the code with the Copy button avoids the problem."},{"q":"Can I use a coupon code on sale items?","a":"It depends on the supplier. Many exclude items that are already discounted."}]'::jsonb, 'How to Use a Peptide Coupon Code (Step-by-Step) | PeptidesCodes', 'Learn how to apply a research peptide coupon code at checkout, check the discount worked, and fix the 5 most common reasons a promo code fails.', 'how to use peptide coupon code, peptide promo code not working', '', '', false),
  ('how-to-read-a-peptide-coa', 'How to Read a Peptide Certificate of Analysis (COA)', 'What purity, identity and batch numbers on a peptide COA actually mean, and the red flags to look for before you order.', '/guides/how-to-read-a-peptide-coa.svg', '', true, '2026-11-08', 'A certificate of analysis (COA) is a lab report for a specific batch of a product. For research peptides, it is the main evidence that what is in the vial matches the label.

## The parts of a COA

- **Product name and amount** | for example *BPC-157, 10 mg*. It should match the vial you buy.
- **Batch or lot number** | the COA must refer to the same batch printed on your product. A COA for a different batch tells you little.
- **Testing laboratory** | the name of the lab that ran the test. Independent third-party labs carry more weight than in-house testing.
- **Test date** | recent tests are more relevant than reports that are years old.
- **Purity (HPLC)** | high-performance liquid chromatography reports the percentage of the sample that is the target compound. Research suppliers often report 98-99%+.
- **Identity (mass spectrometry)** | MS confirms the molecular mass matches the expected peptide.
- **Quantity** | some labs also measure the actual amount of peptide in the vial versus the labelled amount.

## Red flags

1. No batch number, or a batch number that doesn''t match your product.
2. A report that can''t be verified with the testing lab.
3. Purity reported without a chromatogram.
4. The same COA reused across many products or years.

## Use COAs alongside coupon codes

A large discount is only worth it if the product is what it claims to be. Our vendor pages show how many COAs a supplier publishes where we have that data.', '[{"q":"What purity should a research peptide COA show?","a":"Many research suppliers report HPLC purity of 98% or higher. Always check that the COA matches your batch."},{"q":"What is HPLC on a COA?","a":"High-performance liquid chromatography, a test that separates the sample to estimate what percentage is the target compound."}]'::jsonb, 'How to Read a Peptide COA (Certificate of Analysis) | PeptidesCodes', 'Learn how to read a research peptide certificate of analysis: batch numbers, HPLC purity, mass spec identity, test dates and the red flags to watch for.', 'how to read peptide coa, peptide certificate of analysis, peptide hplc purity', '', '', false),
  ('compare-peptide-prices-after-discount', 'How to Compare Peptide Prices After a Discount', 'The biggest percentage off isn''t always the cheapest order. Here''s how to compare research peptide prices per mg after a coupon code.', '/guides/compare-peptide-prices-after-discount.svg', '', true, '2026-11-05', 'A 50% coupon at an expensive store can cost more than a 10% coupon at a cheaper one. Comparing the **price per milligram after the discount** is the fairest way to decide.

## The formula

**Price per mg = (list price × (1 − discount)) ÷ mg in the vial**

Example: a 10 mg vial listed at $60 with a 20% code costs $48, or **$4.80 per mg**. A 10 mg vial at $45 with a 10% code costs $40.50, or **$4.05 per mg**, cheaper despite the smaller discount.

## Don''t forget shipping

Add shipping to the total before dividing, especially on small orders. Some suppliers offer free shipping over a threshold, which can change the result.

## Check the quantity and the COA

Make sure you are comparing the same compound and the same vial size, and that each supplier publishes a recent certificate of analysis. Read our guide on [how to read a peptide COA](/guides/how-to-read-a-peptide-coa).

## Use the codes

Once you have picked a supplier, grab its code from our [full coupon list](/coupons).', '[{"q":"Is the biggest discount always the best deal?","a":"No. Compare the final price per mg after the discount and shipping, not the percentage off."}]'::jsonb, 'How to Compare Peptide Prices Per mg After a Discount | PeptidesCodes', 'Why the biggest peptide coupon isn''t always cheapest: learn to compare research peptide prices per mg after the discount and shipping, with worked examples.', 'peptide price per mg, compare peptide prices, cheapest peptide vendor', '', '', false)
on conflict (slug) do nothing;

insert into public.settings (id, data) values (1, '{"site_name":"PeptidesCodes","tagline":"Verified peptide coupon codes","site_url":"https://peptidescodes.com","lang":"en-US","publisher_name":"PeptidesCodes","publisher_logo":"/logo.png","author_name":"PeptidesCodes Editorial Team","author_url":"https://peptidescodes.com/about","author_bio":"The PeptidesCodes team checks research peptide coupon codes by hand, records the date of every check and lists the result.","contact_email":"info@peptidescodes.com","contact_phone":"+1 (260) 218-1154","extension_url":"https://chromewebstore.google.com/detail/pogbkndeefgihpmgpgidimjapbocfckd?utm_source=item-share-cb","extension_name":"Verified Peptides Promo Code & Coupons | PepLookup","twitter":"","default_meta_title":"Peptide Coupon Codes & Discount Codes (Verified) | PeptidesCodes","default_meta_description":"Verified research peptide coupon codes and discount codes from 80+ suppliers, up to 50% off. Every code is checked and dated.","default_keywords":"peptide coupon code, peptide discount code, peptide promo code, research peptides coupon, peptides codes","default_og_image":"","google_site_verification":"","bing_site_verification":"","ga_measurement_id":"","announcement":"New: get verified peptide codes automatically with our free Chrome extension"}'::jsonb) on conflict (id) do nothing;
