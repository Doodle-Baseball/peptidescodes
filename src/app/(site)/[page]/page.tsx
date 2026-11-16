import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPage, getSettings, isPagePublished } from "@/lib/data";
import { serverClient } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { FaqList, JsonLd, Markdown, PageHero, faqJsonLd } from "@/components/Content";
import { seedPages } from "@/data/seed-data.mjs";

export const revalidate = 3600;
export const dynamicParams = true;

/** Pages rendered by their own routes, never by this catch-all. */
const RESERVED = new Set(["home", "coupons", "vendors", "guides", "extension", "contact", "admin", "api"]);

export async function generateStaticParams() {
  const slugs = new Set<string>((seedPages as { slug: string }[]).map((p) => p.slug));
  try {
    const { data } = await serverClient().from("pages").select("slug");
    data?.forEach((p: { slug: string }) => slugs.add(p.slug));
  } catch { /* fallback to seed */ }
  return Array.from(slugs).filter((s) => !RESERVED.has(s)).map((page) => ({ page }));
}

async function load(slug: string) {
  if (RESERVED.has(slug) || !/^[a-z0-9-]+$/.test(slug)) return null;
  const page = await getPage(slug);
  // getPage returns a stub when nothing exists — detect that.
  if (!page.updated_at && page.title === slug && !page.content) return null;
  if (!isPagePublished(page)) return null; // Draft pages are hidden from the public site
  return page;
}

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: slug } = await params;
  const [settings, page] = await Promise.all([getSettings(), load(slug)]);
  if (!page) return { title: "Not found", robots: { index: false } };
  return buildMetadata({ settings, seo: page, path: `/${slug}`, title: page.meta_title || page.title, description: page.meta_description || page.subtitle || "", ogTitle: page.title });
}

export default async function CmsPage({ params }: Props) {
  const { page: slug } = await params;
  const [settings, page] = await Promise.all([getSettings(), load(slug)]);
  if (!page) notFound();
  const faqs = page.faqs || [];
  return (
    <>
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <PageHero crumbs={[{ name: page.title, href: `/${slug}` }]} siteUrl={settings.site_url} title={page.title} subtitle={page.subtitle} />
      <section className="py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 max-w-3xl">
            <Markdown content={page.content} />
            {faqs.length > 0 && <div className="mt-12"><h2 className="h-display mb-6 text-[30px] text-ink">Questions</h2><FaqList faqs={faqs} /></div>}
            {page.updated_at && <p className="mt-10 text-[13.5px] text-muted">Last updated {formatDate(page.updated_at)}</p>}
          </div>
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">Quick links</h2>
              <ul className="mt-3 space-y-2 text-[15px] font-semibold">
                {[["/coupons", "All coupon codes"], ["/vendors", "Vendors A-Z"], ["/guides", "Buying guides"], ["/extension", "Chrome extension"], ["/contact", "Contact us"]].map(([h, l]) => (
                  <li key={h}><Link href={h} className="text-ink hover:text-navy">{l}</Link></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
