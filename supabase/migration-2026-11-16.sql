-- =====================================================================
-- PeptidesCodes update — 2026-11-16
-- Run once in Supabase → SQL Editor. Safe to run more than once.
-- =====================================================================

-- 1) Page status (Published / Draft) for the admin "Pages & SEO" screen.
alter table public.pages add column if not exists published boolean not null default true;
update public.pages set published = true where slug = 'home';

-- 2) Drag-and-drop vendor order: start from the order visitors currently see
--    (featured first, then biggest discount), numbered 1, 2, 3 …
with ranked as (
  select id, row_number() over (order by featured desc, discount_percent desc, sort_order asc, name asc) as rn
  from public.vendors
)
update public.vendors v set sort_order = ranked.rn
from ranked where ranked.id = v.id and v.sort_order is distinct from ranked.rn;

-- 3) Indexing: only the homepage is indexed; every subpage gets noindex.
--    (Switch any page back to "index" from Admin → Pages & SEO.)
update public.pages   set noindex = (slug <> 'home') where noindex is distinct from (slug <> 'home');
update public.vendors set noindex = true where noindex is distinct from true;
update public.posts   set noindex = true where noindex is distinct from true;
