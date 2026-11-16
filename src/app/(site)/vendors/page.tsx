import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getSettings, getVendors, isPagePublished } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { shortDate } from "@/lib/format";
import { FaqList, JsonLd, Markdown, PageHero, faqJsonLd } from "@/components/Content";
import { VendorLogo } from "@/components/VendorLogo";
import { IconCheck } from "@/components/Icons";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSettings(), getPage("vendors")]);
  return buildMetadata({ settings, seo: page, path: "/vendors", title: page.meta_title || page.title, description: page.meta_description || page.subtitle || "", ogTitle: page.title });
}

export default async function VendorsPage() {
  const [settings, page, vendors] = await Promise.all([getSettings(), getPage("vendors"), getVendors()]);
  if (!isPagePublished(page)) notFound();
  const sorted = [...vendors].sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  const groups = new Map<string, typeof sorted>();
  for (const v of sorted) {
    const k = /^[a-z]/i.test(v.name) ? v.name[0].toUpperCase() : "#";
    groups.set(k, [...(groups.get(k) || []), v]);
  }
  const letters = Array.from(groups.keys());
  const faqs = page.faqs || [];

  return (
    <>
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <PageHero crumbs={[{ name: "Vendors", href: "/vendors" }]} siteUrl={settings.site_url} title={page.title} subtitle={page.subtitle}>
        <nav aria-label="Jump to letter" className="mt-8 flex flex-wrap gap-1.5">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-white px-2 text-[14px] font-bold text-ink transition hover:border-navy hover:text-navy">{l}</a>
          ))}
        </nav>
      </PageHero>
      <section className="bg-bone py-12 sm:py-16">
        <div className="container-x space-y-10">
          {letters.map((l) => (
            <div key={l} id={`letter-${l}`} className="scroll-mt-24">
              <h2 className="mb-4 text-[34px] font-semibold tracking-[-0.04em] text-ink">{l}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.get(l)!.map((v) => (
                  <Link key={v.slug} href={`/coupons/${v.slug}`} className="card card-hover group flex items-center gap-4 p-4">
                    <VendorLogo name={v.name} src={v.logo_url} size={50} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-bold text-ink group-hover:text-navy">{v.name}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[13px] text-muted">
                        {v.coupon_active && v.code ? <><span className="font-mono font-semibold text-[#17733a]">{v.code}</span><span>·</span><span className="flex items-center gap-1"><IconCheck size={12} /> {shortDate(v.verified_at)}</span></> : "Partner deal"}
                      </span>
                    </span>
                    {v.coupon_active && v.discount_percent > 0 && <span className="pill pill-sale">{v.discount_percent}% Off</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      {(page.content || faqs.length > 0) && (
        <section className="py-12 sm:py-16">
          <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Markdown content={page.content} />
            {faqs.length > 0 && <FaqList faqs={faqs} />}
          </div>
        </section>
      )}
    </>
  );
}
