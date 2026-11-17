import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getSettings, getVendors, lite, siteStats, isPagePublished } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { pageOverride } from "@/lib/page-seo-overrides";
import { formatDate } from "@/lib/format";
import { CouponTable } from "@/components/CouponTable";
import { FaqList, JsonLd, Markdown, PageHero, faqJsonLd } from "@/components/Content";
import { VendorLogo } from "@/components/VendorLogo";
import { CouponsGuide } from "@/components/CouponsGuide";
import { IconArrowUpRight } from "@/components/Icons";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page, stats, vendors] = await Promise.all([getSettings(), getPage("coupons"), siteStats(), getVendors()]);
  const override = pageOverride("coupons");
  const meta = override?.meta?.({ vendors, stats });
  const seo = override
    ? { ...page, ...(override.forceIndex ? { noindex: false } : {}), ...(meta ? { meta_title: meta.title, meta_description: meta.description, keywords: meta.keywords.join(", ") } : {}) }
    : page;
  return buildMetadata({ settings, seo, path: "/coupons", title: page.meta_title || page.title, description: page.meta_description || page.subtitle || "", ogTitle: page.title, ogSub: `${stats.codes} verified codes · up to ${stats.maxDiscount}% off` });
}

export default async function CouponsPage() {
  const [settings, page, vendors, stats] = await Promise.all([getSettings(), getPage("coupons"), getVendors(), siteStats()]);
  if (!isPagePublished(page)) notFound();
  const active = vendors.filter((v) => v.coupon_active && v.code);
  const linkOnly = vendors.filter((v) => !v.coupon_active || !v.code);
  const override = pageOverride("coupons");
  const ctx = { vendors, stats };
  // Admin content and FAQs come first; the override only fills an empty Content field and adds missing questions.
  const content = page.content?.trim() || "";
  const styledGuide = !content && !!override?.guide;
  const adminFaqs = page.faqs || [];
  const known = new Set(adminFaqs.map((f) => f.q.trim().toLowerCase()));
  const faqs = [...adminFaqs, ...(override?.extraFaqs?.(ctx) || []).filter((f) => !known.has(f.q.trim().toLowerCase()))];
  const meta = override?.meta?.(ctx);
  const pageUrl = `${settings.site_url}/coupons`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${pageUrl}#webpage`,
          name: page.title,
          ...(meta ? { headline: meta.title, description: meta.description, keywords: meta.keywords.join(", ") } : {}),
          url: pageUrl,
          inLanguage: settings.lang,
          isPartOf: { "@id": `${settings.site_url}/#website` },
          publisher: { "@id": `${settings.site_url}/#organization` },
          ...(stats.updated ? { dateModified: stats.updated } : {}),
          mainEntity: {
            "@type": "ItemList",
            name: page.title,
            numberOfItems: active.length,
            itemListOrder: "https://schema.org/ItemListUnordered",
            itemListElement: active.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: `${v.name} coupon code: ${v.discount_label || `${v.discount_percent}% Off`}`, url: `${settings.site_url}/coupons/${v.slug}` })),
          },
        }}
      />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <PageHero crumbs={[{ name: page.title, href: "/coupons" }]} siteUrl={settings.site_url} title={page.title} subtitle={page.subtitle}>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cdebd6] bg-white/80 px-3.5 py-1.5 text-[13.5px] font-semibold text-[#17733a]">
          <span className="live-dot" /> {stats.codes} active codes · updated {formatDate(stats.updated)}
        </div>
      </PageHero>

      <section className="bg-bone py-12 sm:py-16">
        <div className="container-x">
          <CouponTable items={active.map(lite)} />
        </div>
      </section>

      {linkOnly.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container-x">
            <h2 className="h-display text-[28px] text-ink sm:text-[34px]">Partner stores without a public code</h2>
            <p className="mt-2 max-w-2xl text-muted">These suppliers don&apos;t have a verified public code right now. Shopping through our link supports the site at no extra cost to you.</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {linkOnly.map((v) => (
                <div key={v.slug} className="card flex items-center gap-3 p-4">
                  <VendorLogo name={v.name} src={v.logo_url} size={40} />
                  <Link href={`/coupons/${v.slug}`} className="min-w-0 flex-1 truncate font-semibold text-ink hover:text-navy">{v.name}</Link>
                  {v.affiliate_url && <a href={v.affiliate_url} target="_blank" rel="sponsored nofollow noopener" className="btn btn-ghost btn-sm">Visit <IconArrowUpRight size={14} /></a>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {styledGuide && (
        <>
          <section className="bg-bone py-12 sm:py-16">
            <div className="container-x">
              <CouponsGuide vendors={vendors} stats={stats} />
            </div>
          </section>
          {faqs.length > 0 && (
            <section className="py-12 sm:py-16">
              <div className="container-x max-w-4xl">
                <div className="eyebrow" data-reveal>FAQ</div>
                <h2 className="h-display mb-8 mt-3 text-[32px] text-ink sm:text-[40px]" data-reveal>Peptide promo code questions</h2>
                <div data-reveal><FaqList faqs={faqs} /></div>
              </div>
            </section>
          )}
        </>
      )}

      {!styledGuide && (content || faqs.length > 0) && (
        <section className="bg-bone py-12 sm:py-16">
          <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Markdown content={content} />
            {faqs.length > 0 && <div><h2 className="h-display mb-6 text-[30px] text-ink">Questions</h2><FaqList faqs={faqs} /></div>}
          </div>
        </section>
      )}
    </>
  );
}
