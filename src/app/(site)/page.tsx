import Link from "next/link";
import type { Metadata } from "next";
import { getPage, getPosts, getSettings, getVendors, lite, siteStats, sortByDiscount } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { formatDate, monthYear } from "@/lib/format";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HeroSearch } from "@/components/HeroSearch";
import { CouponTable } from "@/components/CouponTable";
import { DealCard } from "@/components/DealCard";
import { VendorLogo } from "@/components/VendorLogo";
import { FaqList, JsonLd, Markdown, SectionHeading, faqJsonLd } from "@/components/Content";
import { IconArrowRight, IconCheck, IconChrome, IconCopy, IconFlask, IconLock, IconSearch, IconShield, IconStar, IconTag } from "@/components/Icons";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page, stats] = await Promise.all([getSettings(), getPage("home"), siteStats()]);
  return buildMetadata({
    settings, seo: page, path: "/",
    title: settings.default_meta_title,
    description: settings.default_meta_description,
    ogTitle: "Peptide Coupon & Discount Codes",
    ogSub: `${stats.codes} verified codes · up to ${stats.maxDiscount}% off · updated ${monthYear(stats.updated)}`,
  });
}

export default async function HomePage() {
  const [settings, page, vendors, stats, posts] = await Promise.all([getSettings(), getPage("home"), getVendors(), siteStats(), getPosts()]);
  const active = vendors.filter((v) => v.coupon_active && v.code);
  const featured = active.filter((v) => v.featured);
  const carousel = (featured.length ? featured : active).slice(0, 8).map(lite);
  const topDeals = (featured.length >= 4 ? featured : active).slice(0, 8).map(lite);
  const tableRows = active.map(lite);
  const words = page.title.split(" ");
  const faqs = page.faqs || [];
  const az = [...vendors].sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  const azGroups: [string, typeof az][] = [];
  for (const v of az) {
    const l = /^[a-z]/i.test(v.name) ? v.name[0].toUpperCase() : "#";
    const g = azGroups.find(([k]) => k === l);
    if (g) g[1].push(v); else azGroups.push([l, [v]]);
  }
  const marquee = vendors.filter((v) => v.logo_url).slice(0, 30);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best peptide coupon codes",
    numberOfItems: Math.min(tableRows.length, 20),
    itemListElement: tableRows.slice(0, 20).map((v, i) => ({ "@type": "ListItem", position: i + 1, name: `${v.name} coupon code: ${v.discount_label}`, url: `${settings.site_url}/coupons/${v.slug}` })),
  };

  return (
    <>
      <JsonLd data={itemList} />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}

      {/* ---------------- HERO ---------------- */}
      <section className="bg-hero relative z-20 overflow-x-clip">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_30%_20%,#000,transparent_70%)]" />
        <div className="container-x relative grid grid-cols-1 items-center gap-10 pb-12 pt-8 lg:grid-cols-[1.08fr_1fr] lg:pb-16 lg:pt-8">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#cdebd6] bg-white/80 px-3.5 py-1.5 text-[13.5px] font-semibold text-[#17733a] shadow-sm backdrop-blur">
              <span className="live-dot" /> Updated {formatDate(stats.updated)} <span className="text-[#17733a]/60">·</span> {stats.codes} verified codes
            </div>
            <h1 className="h-display mt-5 text-[42px] text-ink sm:text-[56px] lg:text-[62px]">
              {words[0]} <span className="text-grad">{words.slice(1).join(" ")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">{page.subtitle}</p>

            <HeroSearch vendors={vendors.map(lite)} />

            <ul className="mt-7 grid max-w-xl grid-cols-3 gap-4">
              {[[`${stats.vendors}+`, "Vendors tracked"], [`${stats.maxDiscount}%`, "Max discount"], [`${stats.codes}`, "Verified codes"]].map(([n, l]) => (
                <li key={l} className="stat">
                  <span className="stat-num !text-[34px] sm:!text-[44px]">{n}</span>
                  <span className="stat-label">{l}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/coupons" className="btn btn-primary h-12 px-7">Browse all codes</Link>
              <Link href="/#top-deals" className="btn btn-ghost h-12 px-6">Top deals</Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <HeroCarousel items={carousel} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- LOGO MARQUEE ---------------- */}
      <section aria-label="Suppliers we track" className="px-3 sm:px-5">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-[linear-gradient(165deg,#0b3d80_0%,#0a2b66_55%,#081e4c_100%)] py-7 shadow-[0_30px_60px_-34px_rgb(8_30_76/0.6)]">
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgb(255_255_255/0.08)_0%,transparent_40%)]" />
          {[marquee].map((row, r) => (
            <div key={r} className={`marquee overflow-hidden ${r ? "mt-3" : ""}`}>
              <div className={`marquee-track gap-3 ${r ? "marquee-reverse" : ""}`}>
                {[...row, ...row].map((v, i) => (
                  <Link
                    key={`${v.slug}-${i}`}
                    href={`/coupons/${v.slug}`}
                    tabIndex={i >= row.length ? -1 : 0}
                    className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-white/[0.07] py-2 pl-2 pr-4 text-[14.5px] font-medium text-white/85 ring-1 ring-white/10 backdrop-blur transition hover:bg-white hover:text-ink"
                  >
                    <VendorLogo name={v.name} src={v.logo_url} size={32} className="!ring-0" />
                    {v.name}
                    {v.coupon_active && v.discount_percent > 0 && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[12px] font-semibold">{v.discount_percent}%</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- PANEL ROW (navy card + stat cards) ---------------- */}
      <section className="pt-12 sm:pt-16">
        <div className="container-x grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-[1.9fr_1fr_1fr_1fr]">
          <Link href={carousel[0] ? `/coupons/${carousel[0].slug}` : "/coupons"} className="panel-navy group col-span-3 flex min-h-[200px] flex-col justify-between p-7 sm:min-h-[260px] sm:p-10 lg:col-span-1" data-reveal>
            <span className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/60">Biggest discount</span>
            <span className="relative z-10">
              <span className="block text-[88px] font-medium leading-none tracking-[-0.05em] sm:text-[110px]">{stats.maxDiscount}%</span>
              <span className="mt-4 block text-[19px] font-semibold">off at {sortByDiscount(active)[0]?.name || "top vendors"} <span className="inline-block transition group-hover:translate-x-1">→</span></span>
            </span>
          </Link>
          {[
            [`${stats.codes}`, "Active codes", "Every code checked", "Each one shows the date it was last verified."],
            [`${stats.sitewide}`, "Sitewide", "Whole-order codes", "Codes that apply to your entire cart."],
            ["FREE", "Chrome extension", "Codes while you shop", "Get the code automatically on 80+ stores."],
          ].map(([n, k, t, d], i) => (
            <div key={k} className="card flex flex-col p-4 sm:p-7" data-reveal style={{ ["--d" as string]: `${(i + 1) * 70}ms` }}>
              <span className="text-[30px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[48px]">{n}</span>
              <span className="mt-3 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">{k}</span>
              <span className="mt-auto hidden pt-8 text-[19px] font-semibold tracking-[-0.02em] text-ink sm:block">{t}</span>
              <span className="mt-1.5 hidden text-[14.5px] leading-relaxed text-muted sm:block">{d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TOP DEALS ---------------- */}
      <section id="top-deals" className="relative scroll-mt-28 py-12 sm:py-16">
        <div className="container-x relative">
          <SectionHeading eyebrow="Top deals" title="Best peptide discount codes right now" sub="The highest-value codes on the site. Copy the code, then visit the store and paste it at checkout." />
          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {topDeals.map((v, i) => <div key={v.slug} className="w-[80%] shrink-0 snap-start sm:w-auto"><DealCard v={v} highlight={i === 0} delay={i * 70} /></div>)}
          </div>
        </div>
      </section>

      {/* ---------------- COUPON TABLE ---------------- */}
      <section className="bg-bone py-12 sm:py-16">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="All codes" title={<>Every peptide promo code, <span className="text-grad">sorted by discount</span></>} sub="Search a vendor, filter by discount or offer type, and copy a code in one click." />
            <Link href="/coupons" className="btn btn-ghost shrink-0" data-reveal>See all {stats.codes} codes <IconArrowRight size={16} /></Link>
          </div>
          <div className="mt-8" data-reveal>
            <CouponTable items={tableRows} withFilters={false} limit={12} mobileLimit={6} />
          </div>
          <div className="mt-8 text-center">
            <Link href="/coupons" className="btn btn-primary">View all {stats.codes} peptide coupon codes <IconArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ---------------- BROWSE BY DISCOUNT ---------------- */}
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <SectionHeading center eyebrow="Browse" title="Shop by discount size" sub="Jump straight to the codes that fit your order." />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[50, 20, 15, 10].map((pct, i) => {
              const count = active.filter((v) => v.discount_percent >= pct).length;
              return (
                <Link key={pct} href={`/coupons?discount=${pct}&sort=discount`} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }} className="group block">
                  <div data-tilt="10" className="relative h-full overflow-hidden rounded-[22px] border border-line bg-white p-6">
                    <span className="font-display pointer-events-none absolute -bottom-8 -right-2 text-[130px] font-bold leading-none text-ink/[0.05]">%</span>
                    <IconTag className="text-navy" size={26} />
                    <div className="font-display mt-4 text-[44px] font-medium leading-none text-ink">{pct}%+</div>
                    <div className="mt-2 text-[14.5px] text-muted">{count} {count === 1 ? "code" : "codes"} available</div>
                    <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-navy">Browse <IconArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="container-x">
          <SectionHeading center eyebrow="How it works" title="Save in three simple steps" />
          <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: <IconSearch size={26} />, t: "Find your vendor", d: "Search 80+ research peptide suppliers or browse the codes sorted by discount." },
              { icon: <IconCopy size={26} />, t: "Copy the code", d: "One click copies the verified code and opens the store through our partner link." },
              { icon: <IconCheck size={26} />, t: "Paste at checkout", d: "Paste it in the coupon box, press Apply and check the discount line before you pay." },
            ].map((s, i) => (
              <li key={s.t} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="relative">
                <div data-tilt="6" className="card h-full p-7">
                  <div className="flex items-center gap-4">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b3d80] to-ink text-white shadow-[0_14px_30px_-10px_rgb(47_115_255/0.7)]">
                      {s.icon}
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[12px] font-bold text-ink ring-2 ring-white">{i + 1}</span>
                    </span>
                    <h3 className="text-[20px] font-bold text-ink">{s.t}</h3>
                  </div>
                  <p className="mt-4 text-[15.5px] leading-relaxed text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- EXTENSION ---------------- */}
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[32px] bg-white p-8 ring-1 ring-line sm:p-12">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div data-reveal>
                <span className="pill pill-sky"><IconChrome size={15} /> Free Chrome extension</span>
                <h2 className="h-display mt-4 text-[34px] text-ink sm:text-[44px]">Get the code <span className="text-grad">automatically</span> while you shop</h2>
                <p className="mt-4 text-[17px] leading-relaxed text-muted">Our extension shows a verified coupon code and the supplier&apos;s rating the moment you open a supported peptide store, then fills it in with one click.</p>
                <ul className="mt-6 grid grid-cols-1 gap-3 text-[15px] text-ink sm:grid-cols-2">
                  {["Verified codes for 80+ suppliers", "One-click copy or auto-fill", "Codes update several times a day", "No browsing history collected"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green text-white"><IconCheck size={12} strokeWidth={3} /></span>{f}</li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={settings.extension_url} target="_blank" rel="noopener" className="btn btn-primary"><IconChrome size={18} /> Add to Chrome, it&apos;s free</a>
                  <Link href="/extension" className="btn btn-ghost">How it works</Link>
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-[13.5px] text-muted"><span className="flex text-gold">{[0, 1, 2, 3, 4].map((i) => <IconStar key={i} size={15} />)}</span> 5.0 rating on the Chrome Web Store</p>
              </div>
              <div className="stage3d" data-reveal style={{ ["--d" as string]: "150ms" }}>
                <div className="mx-auto max-w-[480px] [transform-style:preserve-3d]" style={{ animation: "var(--animate-float)" }}>
                  <div className="overflow-hidden rounded-2xl bg-white shadow-[0_50px_90px_-30px_rgb(8_30_76/0.5)] ring-1 ring-line">
                    <div className="flex items-center gap-2 border-b border-line bg-bone px-4 py-3">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
                      <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[12px] text-muted ring-1 ring-line"><IconLock size={11} className="mr-1 inline" />{(carousel[0]?.name || "vendor").toLowerCase().replace(/[^a-z0-9]+/g, "")}.com/checkout</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0b3d80] to-ink text-[11px] font-bold text-white">%</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-4 p-5">
                      <div className="space-y-2.5">
                        <div className="h-3 w-3/4 rounded bg-line" /><div className="h-3 w-1/2 rounded bg-line" /><div className="h-24 rounded-xl bg-bone" /><div className="h-3 w-2/3 rounded bg-line" />
                      </div>
                      <div className="w-[190px] rounded-xl bg-white p-3.5 shadow-[0_20px_40px_-14px_rgb(8_30_76/0.45)] ring-1 ring-line [transform:translateZ(40px)]">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-navy">Code found</div>
                        <div className="font-display mt-1 text-[28px] font-bold leading-none text-deal">{carousel[0]?.discount_percent ?? 20}% off</div>
                        <div className="mt-2 rounded-lg border border-dashed border-[#9fd3ae] bg-[#effaf2] py-1.5 text-center font-mono text-[13px] font-bold text-[#17733a]">{carousel[0]?.code || "CODE"}</div>
                        <div className="mt-2 rounded-lg bg-ink py-1.5 text-center text-[12px] font-semibold text-white">Activate offer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- WHY TRUST ---------------- */}
      <section className="bg-bone py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow="Why PeptidesCodes" title="Codes you can actually use" sub="We don't scrape thousands of expired codes. We keep a short list of working codes for research peptide suppliers and tell you exactly when each one was last checked." />
            <Link href="/about" className="btn btn-ghost mt-6" data-reveal>How we verify codes <IconArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {[
              { icon: <IconShield size={24} />, t: "Hand-verified", d: "Codes are tested in a real cart where the store allows it, and every code shows its last verified date." },
              { icon: <IconTag size={24} />, t: "Partner discounts", d: "Many codes are exclusive partner codes negotiated with suppliers, so you won't find them on the store's own site." },
              { icon: <IconFlask size={24} />, t: "COA-aware", d: "Vendor pages note published certificates of analysis and testing labs where we have the data." },
              { icon: <IconLock size={24} />, t: "No sign-up", d: "Copy any code without an account. We never ask for payment details and we don't sell products." },
            ].map((f, i) => (
              <div key={f.t} data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                <div data-tilt="6" className="card h-full p-4 sm:p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone text-ink sm:h-12 sm:w-12">{f.icon}</span>
                  <h3 className="mt-3 text-[15.5px] font-bold text-ink sm:mt-4 sm:text-[18px]">{f.t}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted sm:mt-2 sm:text-[15px]">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- GUIDES ---------------- */}
      {posts.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Guides" title="Buy smarter, not just cheaper" />
              <Link href="/guides" className="btn btn-ghost shrink-0" data-reveal>All guides <IconArrowRight size={16} /></Link>
            </div>
            <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
              {posts.slice(0, 3).map((p, i) => (
                <Link key={p.slug} href={`/guides/${p.slug}`} className="group block w-[82%] shrink-0 snap-start md:w-auto" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
                  <article data-tilt="5" className="card flex h-full flex-col overflow-hidden">
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#0b3d80] via-[#0a2b66] to-ink">
                      {p.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="font-display absolute bottom-3 left-5 right-5 text-[22px] font-semibold leading-tight text-white/95">{p.title.split(" (")[0]}</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <time className="text-[13px] text-muted" dateTime={p.published_at || undefined}>{formatDate(p.published_at)}</time>
                      <h3 className="mt-2 text-[18px] font-bold leading-snug text-ink group-hover:text-navy">{p.title}</h3>
                      <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-muted">{p.excerpt}</p>
                      <span className="mt-auto pt-4 text-[14px] font-semibold text-navy">Read guide →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- VENDORS A-Z ---------------- */}
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Directory" title="Research peptide vendors A-Z" sub="Every supplier we track, with a dedicated coupon page." />
            <Link href="/vendors" className="btn btn-ghost shrink-0" data-reveal>Full directory <IconArrowRight size={16} /></Link>
          </div>
          <nav aria-label="Jump to letter" className="mt-8 flex flex-wrap gap-1.5" data-reveal>
            {azGroups.map(([l]) => (
              <a key={l} href={`/vendors#letter-${l}`} className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-line bg-white px-2 text-[14px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white">{l}</a>
            ))}
          </nav>
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-4">
            {azGroups.map(([letter, list], gi) => (
              <div key={letter} className={`mb-4 break-inside-avoid ${gi >= 3 ? "max-sm:hidden" : ""}`} data-reveal style={{ ["--d" as string]: `${(gi % 4) * 60}ms` }}>
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-line bg-stone px-5 py-3">
                    <span className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-ink">{letter}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">{list.length} {list.length === 1 ? "vendor" : "vendors"}</span>
                  </div>
                  <ul className="p-2">
                    {list.map((v) => (
                      <li key={v.slug}>
                        <Link href={`/coupons/${v.slug}`} className="group flex items-center gap-3 rounded-2xl px-2.5 py-2 transition hover:bg-stone">
                          <VendorLogo name={v.name} src={v.logo_url} size={34} />
                          <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold tracking-[-0.01em] text-ink">{v.name}</span>
                          {v.coupon_active && v.discount_percent > 0 ? (
                            <span className="pill pill-sale !px-2 !py-0.5 !text-[12px]">{v.discount_percent}%</span>
                          ) : (
                            <span className="pill bg-stone !px-2 !py-0.5 !text-[12px] text-muted">Deal</span>
                          )}
                          <IconArrowRight size={15} className="-ml-1 w-0 shrink-0 text-ink opacity-0 transition-all group-hover:ml-0 group-hover:w-[15px] group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <Link href="/vendors" className="btn btn-primary mt-2 w-full sm:hidden">See all {vendors.length} vendors A-Z <IconArrowRight size={16} /></Link>
        </div>
      </section>

      {/* ---------------- SEO CONTENT + FAQ ---------------- */}
      <section className="py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div data-reveal>
            {page.content ? <Markdown content={page.content} /> : null}
          </div>
          <div>
            <div className="eyebrow" data-reveal>FAQ</div>
            <h2 className="h-display mb-6 mt-3 text-[32px] text-ink sm:text-[40px]" data-reveal>Peptide coupon code questions</h2>
            <div data-reveal><FaqList faqs={faqs} /></div>
          </div>
        </div>
      </section>
    </>
  );
}
