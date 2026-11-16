import type { Metadata } from "next";
import { externalRel } from "@/lib/format";
import { notFound } from "next/navigation";
import { getPage, getSettings, siteStats, isPagePublished } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs, FaqList, JsonLd, Markdown, faqJsonLd } from "@/components/Content";
import { Molecule3D } from "@/components/Molecule3D";
import { IconCheck, IconChrome, IconLock, IconShield, IconSpark, IconStar, IconTag } from "@/components/Icons";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSettings(), getPage("extension")]);
  return buildMetadata({ settings, seo: page, path: "/extension", title: page.meta_title || page.title, description: page.meta_description || page.subtitle || "", ogTitle: page.title, ogSub: "Free Chrome extension" });
}

export default async function ExtensionPage() {
  const [settings, page, stats] = await Promise.all([getSettings(), getPage("extension"), siteStats()]);
  if (!isPagePublished(page)) notFound();
  const faqs = page.faqs || [];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: settings.extension_name,
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome",
          url: settings.extension_url,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", ratingCount: "3" },
          publisher: { "@id": `${settings.site_url}/#organization` },
        }}
      />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <section className="bg-ink-glow relative overflow-hidden text-white">
        <Molecule3D className="pointer-events-none absolute -right-20 top-0 h-full w-[60%] opacity-30" />
        <div className="container-x relative grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <Breadcrumbs light siteUrl={settings.site_url} items={[{ name: "Chrome extension", href: "/extension" }]} />
            <span className="pill mt-8 bg-white/10 text-white ring-1 ring-white/20"><IconChrome size={15} /> Free for Chrome, Brave & Edge</span>
            <h1 className="h-display mt-5 text-[42px] sm:text-[60px]">{page.title}</h1>
            <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-white/75">{page.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={settings.extension_url} target="_blank" rel={externalRel(settings.extension_url)} className="btn h-14 bg-white px-7 text-[16px] text-ink hover:bg-sky"><IconChrome size={22} /> Add to Chrome, it&apos;s free</a>
              <span className="flex items-center gap-2 text-[14px] text-white/75"><span className="flex text-gold">{[0, 1, 2, 3, 4].map((i) => <IconStar key={i} size={16} />)}</span> 5.0 on the Chrome Web Store</span>
            </div>
          </div>
          <div className="stage3d">
            <div className="mx-auto max-w-[380px]" style={{ animation: "var(--animate-float)" }}>
              <div className="rounded-3xl bg-white p-5 text-ink shadow-[0_50px_100px_-30px_rgb(0_0_0/0.6)]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b3d80] to-ink font-bold text-white">%</span>
                  <div><div className="text-[14px] font-bold">Verified code found</div><div className="text-[12px] text-muted">Trustpilot rating shown where available</div></div>
                </div>
                <div className="font-display mt-5 text-[52px] font-bold leading-none text-deal">20% off</div>
                <div className="mt-3 rounded-xl border-2 border-dashed border-[#9fd3ae] bg-[#effaf2] py-3 text-center font-mono text-[20px] font-bold tracking-widest text-[#17733a]">PEPLOOKUP</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <span className="btn btn-primary btn-sm">Activate offer</span>
                  <span className="btn btn-green btn-sm">Fill code</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: <IconTag size={22} />, t: `Codes for ${stats.vendors}+ suppliers`, d: "A badge appears on the icon when we have a verified code for the store you're on." },
            { i: <IconSpark size={22} />, t: "One-click apply", d: "Copy the code or fill it into the coupon field. Auto-fill is off by default." },
            { i: <IconShield size={22} />, t: "Ratings at a glance", d: "See the supplier's Trustpilot rating and review count where we have one on file." },
            { i: <IconLock size={22} />, t: "Private by design", d: "Runs only on supported stores. No browsing history, passwords or payment details collected." },
          ].map((f, idx) => (
            <div key={f.t} data-reveal style={{ ["--d" as string]: `${idx * 70}ms` }}>
              <div data-tilt="6" className="card h-full p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone text-ink">{f.i}</span>
                <h2 className="mt-4 text-[18px] font-bold text-ink">{f.t}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-bone py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="card p-6 sm:p-10" data-reveal><Markdown content={page.content} /></div>
          <div>
            <h2 className="h-display mb-6 text-[32px] text-ink" data-reveal>Extension FAQ</h2>
            <div data-reveal><FaqList faqs={faqs} /></div>
            <a href={settings.extension_url} target="_blank" rel={externalRel(settings.extension_url)} className="btn btn-primary mt-8"><IconChrome size={18} /> Install free extension</a>
            <ul className="mt-6 space-y-2 text-[14px] text-muted">
              {["Never submits forms or places orders for you", "Never replaces another site's referral"].map((t) => (<li key={t} className="flex items-center gap-2"><IconCheck size={15} className="text-green" /> {t}</li>))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
