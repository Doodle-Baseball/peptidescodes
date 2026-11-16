import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getSettings, getVendors, lite, siteStats, isPagePublished } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { CouponTable } from "@/components/CouponTable";
import { FaqList, JsonLd, Markdown, PageHero, faqJsonLd } from "@/components/Content";
import { VendorLogo } from "@/components/VendorLogo";
import { IconArrowUpRight } from "@/components/Icons";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page, stats] = await Promise.all([getSettings(), getPage("coupons"), siteStats()]);
  return buildMetadata({ settings, seo: page, path: "/coupons", title: page.meta_title || page.title, description: page.meta_description || page.subtitle || "", ogTitle: page.title, ogSub: `${stats.codes} verified codes · up to ${stats.maxDiscount}% off` });
}

export default async function CouponsPage() {
  const [settings, page, vendors, stats] = await Promise.all([getSettings(), getPage("coupons"), getVendors(), siteStats()]);
  if (!isPagePublished(page)) notFound();
  const active = vendors.filter((v) => v.coupon_active && v.code);
  const linkOnly = vendors.filter((v) => !v.coupon_active || !v.code);
  const faqs = page.faqs || [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: page.title,
          url: `${settings.site_url}/coupons`,
          inLanguage: settings.lang,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: active.length,
            itemListElement: active.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: `${v.name} | ${v.discount_label}`, url: `${settings.site_url}/coupons/${v.slug}` })),
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

      {(page.content || faqs.length > 0) && (
        <section className="bg-bone py-12 sm:py-16">
          <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Markdown content={page.content} />
            {faqs.length > 0 && <div><h2 className="h-display mb-6 text-[30px] text-ink">Questions</h2><FaqList faqs={faqs} /></div>}
          </div>
        </section>
      )}
    </>
  );
}
