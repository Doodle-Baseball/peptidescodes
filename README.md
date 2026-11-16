# PeptidesCodes — peptidescodes.com

A coupon-code website for research peptide vendors. Built with Next.js 15, Tailwind CSS 4 and Supabase.

- **Public site:** home page, `/coupons` (all codes with filters), `/coupons/<vendor>` (one SEO page per vendor), `/vendors` (A–Z), `/guides` (blog), `/extension`, `/contact`, `/about` and the legal pages.
- **Admin panel:** `/admin`. From here you can edit vendors, codes, affiliate links, logos, every page's content and FAQs, and all SEO fields (meta title, description, keywords, canonical, slug, OG image, noindex). Settings cover language, publisher, author, contact details, Google/Bing verification and GA4.
- **SEO:** static pages refreshed hourly (and right after every admin save). You also get an automatic sitemap.xml and robots.txt, canonical and hreflang tags, Open Graph images generated per page, and JSON-LD data: Organization, WebSite with a search box, BreadcrumbList, FAQPage, WebPage/Offer, Article and SoftwareApplication.

## 1. One-time database setup (required)

1. Open https://supabase.com/dashboard/project/onezidietuvicehxjtmo/sql/new
2. Paste the whole contents of `supabase/setup.sql` and click **Run**.

This creates the tables, the security rules (row-level security: only the admin can write; visitors can only read, send messages and subscribe), a `media` storage bucket for logo and image uploads, and loads all vendors, pages and guides.
It is safe to run again; existing rows are kept.

Until you run it, the site displays the bundled data from `src/data/seed-data.mjs`.

The admin user `info@peptidescodes.com` already exists, with the `admin` role.

## 2. Run locally

```bash
npm install
npm run dev        # http://localhost:3000  — admin at /admin
```

### Database update 2026-11-16 (run once on the existing database)

Open the Supabase SQL Editor, paste `supabase/migration-2026-11-16.sql` and click **Run**. It:
- adds page **status** (Published / Draft) used by **Admin → Pages & SEO**,
- numbers vendors 1, 2, 3 … in the order visitors currently see, as the starting point for drag-and-drop ordering,
- sets **noindex** on every page except the homepage (switch any page back from **Admin → Pages & SEO**).

## 3. Deploy (Vercel recommended)

1. Push this folder to a GitHub repo and import it in Vercel (framework preset: **Next.js**, no build settings to change).
2. Add these environment variables for **Production** and **Preview** (same values as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://peptidescodes.com`
   - `NEXT_PUBLIC_WEB3FORMS_KEY` (contact form emails to info@peptidescodes.com)
3. Add the domain `peptidescodes.com` (and `www.peptidescodes.com`, set to redirect to `peptidescodes.com`) in Vercel → Domains and set the DNS records it shows.
4. Submit `https://peptidescodes.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools. Paste their verification codes in **Admin → Site settings**.

Preview deployments (`*.vercel.app`) automatically send `noindex` and block crawlers in robots.txt; only the production domain can be indexed.

The secret Supabase key is **not** used by the website and must never be put in the env vars or code.

## Useful scripts

| Command | What it does |
| --- | --- |
| `npm run logos` | Downloads vendor favicons into `public/logos/` (add `-- --force` to refresh) |
| `npm run seed:sql` | Rebuilds `supabase/setup.sql` from `supabase/schema.sql` + `src/data/seed-data.mjs` |

## Data notes

- **Cielo Crew** and **Bionova Peptides** have codes but no affiliate link was provided. Their buttons are disabled until you add one in admin.
- **Cielo Crew's** code is stored exactly as given: `PEPTOOKUP`. Check it isn't meant to be `PEPLOOKUP`.
- 7 partner stores had a link but no code. They are listed as "partner deals": The Peptide Labs, Peak Lab Peptides, Aero Peptides, Pristine Aminos, Kylo Peptides, Pure Peptides and PS Peptides.
- `peptime.link/peplookup` was not added because the store name wasn't clear. Add it in **Admin → Vendors → Add vendor**.
- 6 vendors have no logo (a coloured initials badge is shown instead), and some logos are small 32px favicons. Upload better logos in admin.
