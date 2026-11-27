import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSettings, getVendor, getVendors, lite } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { couponOverride, richCouponSchema } from "@/lib/page-seo-overrides";
import { formatDate } from "@/lib/format";
import { vendorFaqs, vendorH1, vendorMetaDescription, vendorMetaTitle, vendorSummary } from "@/lib/vendor-content";
import { Breadcrumbs, FaqList, JsonLd, Markdown, faqJsonLd } from "@/components/Content";
import { VendorLogo } from "@/components/VendorLogo";
import { CodeChip, GetDealButton } from "@/components/Deal";
import { TicketActions } from "./TicketActions";
import { IconArrowRight, IconCalendar, IconCheck, IconGlobe, IconShield, IconTag } from "@/components/Icons";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const vendors = await getVendors();
  return vendors.map((v) => ({ slug: v.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, v] = await Promise.all([getSettings(), getVendor(slug)]);
  if (!v) return { title: "Not found", robots: { index: false } };
  const override = couponOverride(v.slug);
  const meta = override?.meta?.(v);
  return buildMetadata({
    settings,
    seo: override ? { ...v, ...(override.forceIndex ? { noindex: false } : {}), ...(override.keywords ? { keywords: override.keywords.join(", ") } : {}) } : v,
    path: `/coupons/${v.slug}`,
    title: meta?.title || vendorMetaTitle(v),
    description: meta?.description || vendorMetaDescription(v),
    keywords: `${v.name} coupon code, ${v.name} discount code, ${v.name} promo code, ${v.code || ""}`,
    ogTitle: `${v.name} coupon code`,
    ogSub: v.coupon_active && v.code ? `${v.discount_label} with code ${v.code} · verified ${formatDate(v.verified_at)}` : "Partner deal",
  });
}

export default async function VendorPage({ params }: Props) {
  const { slug } = await params;
  const [settings, v, all] = await Promise.all([getSettings(), getVendor(slug), getVendors()]);
  // Vendors switched OFF in the admin (or removed) send visitors to the main coupons page.
  if (!v) redirect("/coupons");

  const L = lite(v);
  const has = v.coupon_active && !!v.code;
  const override = couponOverride(v.slug);
  // Pages with extra FAQs also drop blank admin FAQ rows (empty question), which would be invalid FAQ schema.
  const baseFaqs = override?.extraFaqs ? vendorFaqs(v).filter((f) => f.q?.trim()) : vendorFaqs(v);
  const allFaqs = [...baseFaqs, ...(override?.extraFaqs?.(v) ?? []).filter((f) => !baseFaqs.some((b) => b.q === f.q))];
  const faqs = override?.selectFaqs ? override.selectFaqs(allFaqs, v) : allFaqs;
  const summary = vendorSummary(v);
  const related = all
    .filter((x) => x.slug !== v.slug && x.coupon_active && x.code)
    .sort((a, b) => Math.abs(a.discount_percent - v.discount_percent) - Math.abs(b.discount_percent - v.discount_percent) || b.discount_percent - a.discount_percent)
    .slice(0, 6);
  const pageUrl = `${settings.site_url}/coupons/${v.slug}`;

  const details: [string, string][] = [
    ["Code", has ? v.code! : "No code needed"],
    ["You save", v.discount_label || `${v.discount_percent}% Off`],
    ["Covers", v.applies_to || "Sitewide"],
    ["Last verified", formatDate(v.verified_at)],
  ];
  const facts: [string, string | number | null | undefined][] = [
    ["Based in", v.country],
    ["Selling since", v.founded],
    ["Compounds listed", v.compounds],
    ["COA reports", v.coa_count],
    ["Testing lab", v.testing_lab],
    ["Payment options", v.payment_methods],
    ["Shipping", v.shipping_info],
  ];

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: vendorMetaTitle(v),
    description: vendorMetaDescription(v),
    inLanguage: settings.lang,
    isPartOf: { "@id": `${settings.site_url}/#website` },
    dateModified: v.updated_at || v.verified_at,
    author: { "@type": "Organization", name: settings.author_name, url: settings.author_url },
    publisher: { "@id": `${settings.site_url}/#organization` },
    about: { "@type": "Organization", name: v.name, url: v.website_url || undefined, logo: v.logo_url ? `${settings.site_url}${v.logo_url.startsWith("/") ? v.logo_url : ""}` : undefined },
    ...(has
      ? { mainEntity: { "@type": "Offer", name: `${v.name} coupon code ${v.code}`, description: `${v.discount_label} ${(v.applies_to || "").toLowerCase()} with code ${v.code}`, url: pageUrl, availability: "https://schema.org/InStock", validFrom: v.verified_at, seller: { "@type": "Organization", name: v.name } } }
      : {}),
  };

  const howToSteps = [
    `Copy the code ${has ? v.code : ""} with the Copy button on this page.`,
    `Open the ${v.name} store and add the research items you need to your cart.`,
    `Paste the code in the coupon or promo-code field at checkout and press Apply.`,
    "Confirm the discount line, shipping and final total before completing payment.",
  ];
  // Admin "Headline" always wins; a per-page override only fills in when it's empty.
  const h1 = !v.headline?.trim() && override?.h1 ? override.h1(v) : vendorH1(v);

  return (
    <>
      {override?.richSchema ? (
        <>
          <JsonLd data={richCouponSchema(v, settings, howToSteps, faqs, override.keywords)} />
          <JsonLd data={{ ...faqJsonLd(faqs), "@id": `${pageUrl}#faq`, url: pageUrl }} />
        </>
      ) : (
        <>
          <JsonLd data={webPage} />
          <JsonLd data={faqJsonLd(faqs)} />
        </>
      )}

      {/* HERO */}
      <section className="bg-hero relative overflow-hidden border-b border-line">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(180deg,#000,transparent)]" />
        <div className="container-x relative grid grid-cols-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_1fr] lg:py-16">
          <div>
            <Breadcrumbs siteUrl={settings.site_url} items={[{ name: "Peptide Coupon Codes", href: "/coupons" }, { name: v.name, href: `/coupons/${v.slug}` }]} />
            <div className="mt-8 flex items-center gap-4">
              <VendorLogo name={v.name} src={v.logo_url} size={72} />
              <div>
                <p className="text-[22px] font-bold tracking-tight text-ink">{v.name}</p>
                <span className="pill pill-green mt-1.5"><IconCheck size={13} /> Verified {formatDate(v.verified_at)}</span>
              </div>
            </div>
            <h1 className="h-display mt-6 text-[40px] text-ink sm:text-[56px]">
              {h1.split(":")[0]}
              {h1.includes(":") && <>: <span className="text-deal">{h1.split(":").slice(1).join(":").trim()}</span></>}
            </h1>
            <div className="mt-6 rounded-2xl border border-line border-l-[5px] border-l-green bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
              <Markdown content={summary} className="!text-[16.5px]" />
            </div>
          </div>

          {/* Coupon ticket */}
          <div className="stage3d">
            <div className="ticket mx-auto max-w-[480px]" style={{ ["--notch" as string]: "#fbfaf7" }}>
              <div className="ticket-top px-7 pb-8 pt-7 text-white">
                <div className="flex items-center gap-3">
                  <VendorLogo name={v.name} src={v.logo_url} size={40} />
                  <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/85">{v.name} coupon</span>
                </div>
                <div className="mt-5 flex items-end gap-3">
                  <span className="font-display relative z-10 text-[84px] font-medium leading-[0.85] sm:text-[104px]">{has ? `${v.discount_percent}%` : "Deal"}</span>
                  {has && <span className="pb-2 text-[26px] font-bold text-white/85">OFF</span>}
                </div>
                <p className="mt-2 text-[14px] text-white/75">{v.applies_to || "Sitewide"} · ships from {v.country || "the supplier"}</p>
              </div>
              <div className="ticket-cut" />
              <div className="ticket-bottom px-7 pb-7 pt-7">
                <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/55">{has ? "Your code" : "Partner offer"}</div>
                <TicketActions v={L} />
                <p className="mt-4 text-center text-[13px] text-white/55">Paste the code at checkout and check the discount line before you pay.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="border-b border-line py-10 sm:py-12">
        <div className="container-x grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { i: <IconTag size={20} />, k: "Code", val: has ? v.code : "None" },
            { i: <IconShield size={20} />, k: "Discount", val: v.discount_label },
            { i: <IconGlobe size={20} />, k: "Applies to", val: v.applies_to },
            { i: <IconCalendar size={20} />, k: "Verified", val: formatDate(v.verified_at) },
          ].map((f, idx) => (
            <div key={f.k} data-reveal style={{ ["--d" as string]: `${idx * 60}ms` }} className="fact-3d flex items-center gap-3 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b3d80] to-ink text-white">{f.i}</span>
              <span className="min-w-0">
                <span className="block text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted">{f.k}</span>
                <span className="block truncate font-semibold text-ink">{f.val}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* THE OFFER + ABOUT */}
      <section className="bg-bone py-10 sm:py-12">
        <div className="container-x">
          <div className="eyebrow" data-reveal>The offer</div>
          <h2 className="h-display mt-3 text-[32px] text-ink sm:text-[40px]" data-reveal>{v.name} coupon details</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
            <div className="card p-6 sm:p-8" data-reveal>
              <p className="text-[16.5px] leading-relaxed text-[#2b3550]">
                {has ? (
                  <>
                    <b className="text-ink">{v.discount_label}</b> is on offer at {v.name} through the code <b className="text-ink">{v.code}</b>.{" "}
                    {(v.applies_to || "Sitewide").toLowerCase() === "sitewide" ? "It is a sitewide code: it applies to your whole order." : "It is a code for eligible products: it applies only to the items the vendor includes."}{" "}
                    {v.combinable?.trim() ? `Stacking: ${v.combinable}.` : "Combining it with other codes or sales is not confirmed, so plan on one code per order."}
                  </>
                ) : (
                  <>{v.name} doesn&apos;t have a public code at the moment. Shopping through our partner link supports this site at no extra cost to you.</>
                )}
              </p>
              <dl className="mt-6 divide-y divide-line">
                {details.map(([k, val]) => (
                  <div key={k} className="grid grid-cols-[1fr_1.2fr] gap-4 py-3.5 text-[15.5px]">
                    <dt className="text-muted">{k}</dt>
                    <dd className={`font-semibold text-ink ${k === "Code" ? "font-mono tracking-wider" : ""}`}>{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <aside className="card p-6 sm:p-8" data-reveal style={{ ["--d" as string]: "100ms" }}>
              <h2 className="text-[20px] font-bold text-ink">About {v.name}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-[#2b3550]">{v.short_description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                {facts.filter(([, val]) => val !== null && val !== undefined && val !== "").map(([k, val]) => (
                  <div key={k} className="rounded-xl bg-bone px-4 py-3">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">{k}</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{val}</dd>
                  </div>
                ))}
              </dl>
              {v.affiliate_url && (
                <a href={v.affiliate_url} target="_blank" rel="sponsored nofollow noopener" className="btn btn-ghost mt-6 w-full">Visit {v.name} <IconArrowRight size={16} /></a>
              )}
            </aside>
          </div>
          {v.about?.trim() ? (
            <div className="card mt-6 p-6 sm:p-10" data-reveal>
              <Markdown content={v.about} />
            </div>
          ) : override?.about ? (
            <div className="card mt-6 p-6 sm:p-10" data-reveal>
              <Markdown content={override.about(v)} className="[&>:first-child]:!mt-0" />
            </div>
          ) : null}
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="py-10 sm:py-12">
        <div className="container-x grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-6 sm:p-8" data-reveal>
            <div className="eyebrow">Step by step</div>
            <h2 className="h-display mt-3 text-[28px] text-ink sm:text-[34px]">How to use the {v.name} coupon</h2>
            <ol className="mt-6 space-y-5">
              {howToSteps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3d80] to-ink font-bold text-white shadow-[0_8px_20px_-8px_rgb(47_115_255/0.8)]">{i + 1}</span>
                  <span className="pt-2 text-[16px] leading-relaxed text-[#2b3550]">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-6 sm:p-8" data-reveal style={{ ["--d" as string]: "100ms" }}>
            <div className="eyebrow">Troubleshooting</div>
            <h2 className="h-display mt-3 text-[28px] text-ink sm:text-[34px]">Code not working?</h2>
            <ul className="mt-6 space-y-3.5 text-[15.5px] leading-relaxed text-[#2b3550]">
              {["Remove extra spaces, use the Copy button rather than typing.", "Remove any other code already applied; most stores allow one per order.", "Check your items are eligible, sale items and bundles are often excluded.", "Check for a minimum order value at checkout.", "Still failing? Tell us and we'll re-check the code."].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green"><IconCheck size={12} strokeWidth={3} /></span>{t}</li>
              ))}
            </ul>
            <Link href="/contact" className="btn btn-ghost mt-6">Report a code</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bone pb-6 pt-10 sm:pb-8 sm:pt-12">
        <div className="container-x max-w-4xl">
          <div className="eyebrow" data-reveal>FAQ</div>
          <h2 className="h-display mb-8 mt-3 text-[32px] text-ink sm:text-[40px]" data-reveal>{v.name} coupon code FAQ</h2>
          <div data-reveal><FaqList faqs={faqs} /></div>
        </div>
      </section>

      {/* RELATED */}
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <div className="eyebrow" data-reveal>Related</div>
          <h2 className="h-display mt-3 text-[32px] text-ink sm:text-[40px]" data-reveal>Vendors with a similar discount</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <div key={r.slug} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                <div data-tilt="6" className="card relative flex h-full flex-col gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <VendorLogo name={r.name} src={r.logo_url} size={46} />
                    <div className="min-w-0">
                      <h3 className="truncate text-[16.5px] font-bold text-ink"><Link href={`/coupons/${r.slug}`} className="hover:text-navy">{r.name} discount code</Link></h3>
                      <p className="text-[13.5px] text-muted">{r.discount_label} · {r.applies_to}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <CodeChip v={lite(r)} size="sm" source="related" />
                    <GetDealButton v={lite(r)} className="btn-sm !h-9 ml-auto" source="related" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
