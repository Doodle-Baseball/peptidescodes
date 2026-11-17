import Link from "next/link";
import type { Vendor } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { VendorLogo } from "@/components/VendorLogo";
import { IconArrowRight, IconArrowUpRight, IconCalendar, IconCheck, IconCopy, IconFlask, IconGlobe, IconPuzzle, IconSearch, IconShield, IconSpark, IconTag } from "@/components/Icons";

type Stats = { vendors: number; codes: number; maxDiscount: number; sitewide: number; updated: string | null | undefined };

const isSitewide = (v: Vendor) => (v.applies_to || "sitewide").toLowerCase() === "sitewide";
const label = (v: Vendor) => v.discount_label || `${v.discount_percent}% Off`;

/** Styled explainer for /coupons: how the list works, top discounts, discount spread and buying tips. */
export function CouponsGuide({ vendors, stats }: { vendors: Vendor[]; stats: Stats }) {
  const active = vendors.filter((v) => v.coupon_active && v.code);
  const top = [...active].sort((a, b) => b.discount_percent - a.discount_percent || a.name.localeCompare(b.name)).slice(0, 5);
  const buckets = (
    [
      ["30% off or more", active.filter((v) => v.discount_percent >= 30).length],
      ["20% to 29% off", active.filter((v) => v.discount_percent >= 20 && v.discount_percent < 30).length],
      ["15% to 19% off", active.filter((v) => v.discount_percent >= 15 && v.discount_percent < 20).length],
      ["10% to 14% off", active.filter((v) => v.discount_percent >= 10 && v.discount_percent < 15).length],
      ["Under 10% off", active.filter((v) => v.discount_percent < 10).length],
    ] as [string, number][]
  ).filter(([, n]) => n > 0);
  const maxBucket = Math.max(1, ...buckets.map(([, n]) => n));
  const eligible = stats.codes - stats.sitewide;
  const link = "font-semibold text-navy underline decoration-[#b9c8e8] underline-offset-[3px] hover:decoration-navy";

  const facts = [
    { i: <IconTag size={20} />, k: "Active codes", val: String(stats.codes) },
    { i: <IconGlobe size={20} />, k: "Suppliers tracked", val: String(stats.vendors) },
    { i: <IconSpark size={20} />, k: "Biggest discount", val: `${stats.maxDiscount}% off` },
    { i: <IconCalendar size={20} />, k: "Last updated", val: formatDate(stats.updated) },
  ];
  const tools = [
    { i: <IconSearch size={18} />, t: "Search", d: "Find a vendor or a code." },
    { i: <IconPuzzle size={18} />, t: "Filter", d: "By minimum discount or offer type." },
    { i: <IconSpark size={18} />, t: "Sort", d: "By biggest discount, most recently verified or vendor A-Z." },
    { i: <IconArrowUpRight size={18} />, t: "Full details", d: "Opens the supplier's page with step-by-step instructions and answers to common questions about that code." },
  ];
  const tips = [
    {
      i: <IconSearch size={24} />,
      t: "Compare the final price, not the percentage.",
      d: <>A 10% code at a cheaper store can cost less than a 30% code at a store with higher list prices. Our guide to <Link href="/guides/compare-peptide-prices-after-discount" className={link}>comparing peptide prices after a discount</Link> shows how to work out the price per mg.</>,
    },
    { i: <IconGlobe size={24} />, t: "Check what the code covers.", d: <>A sitewide code applies to the whole order; an eligible-products code only to the items the supplier includes.</> },
    { i: <IconFlask size={24} />, t: "Check the COA.", d: <>A discount only matters if the product is what the label says. See <Link href="/guides/how-to-read-a-peptide-coa" className={link}>how to read a peptide COA</Link>.</> },
    { i: <IconCopy size={24} />, t: "Use one code per order.", d: <>Most suppliers accept a single code at checkout.</> },
  ];

  return (
    <div>
      {/* Intro */}
      <div className="max-w-3xl" data-reveal>
        <div className="eyebrow">About this list</div>
        <h2 className="h-display mt-3 text-[32px] text-ink sm:text-[44px]">How this peptide promo code list works</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          This page lists every active peptide promo code we track: <b className="text-ink">{stats.codes} codes from {stats.vendors} research peptide suppliers</b>, last updated <b className="text-ink">{formatDate(stats.updated)}</b>. Each row shows the supplier, the code, the discount, whether it is <b className="text-ink">sitewide</b> or limited to <b className="text-ink">eligible products</b>, and the date we last confirmed it.
        </p>
      </div>

      {/* Key numbers */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {facts.map((f, idx) => (
          <div key={f.k} data-reveal style={{ ["--d" as string]: `${idx * 60}ms` }} className="fact-3d flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b3d80] to-ink text-white">{f.i}</span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted">{f.k}</span>
              <span className="block truncate text-[17px] font-semibold text-ink">{f.val}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Using the table */}
      <div className="card mt-6 p-6 sm:p-8" data-reveal>
        <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">Using the table</h3>
        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <li key={t.t} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone text-ink">{t.i}</span>
              <span>
                <span className="block font-bold text-ink">{t.t}</span>
                <span className="mt-0.5 block text-[14.5px] leading-relaxed text-muted">{t.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top discounts + spread */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="card p-6 sm:p-8" data-reveal>
          <div className="eyebrow">Top deals</div>
          <h3 className="h-display mt-3 text-[26px] text-ink sm:text-[30px]">Biggest peptide discounts right now</h3>
          <ol className="mt-5 divide-y divide-line">
            {top.map((v, i) => (
              <li key={v.slug} className="flex items-center gap-3 py-3.5 sm:gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone text-[13px] font-bold text-ink">{i + 1}</span>
                <VendorLogo name={v.name} src={v.logo_url} size={40} />
                <span className="min-w-0 flex-1">
                  <Link href={`/coupons/${v.slug}`} className="block truncate font-bold text-ink hover:text-navy">{v.name}</Link>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[13.5px] text-muted">
                    {label(v)} {isSitewide(v) ? "sitewide" : "on eligible products"} with code
                    <span className="rounded-md border border-dashed border-[#9fd3ae] bg-[#effaf2] px-2 py-0.5 font-mono text-[12.5px] font-bold text-[#17733a]">{v.code}</span>
                  </span>
                </span>
                <span className="pill pill-sale shrink-0 !px-3 !py-1.5 !text-[14px]">{label(v)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-6 sm:p-8" data-reveal style={{ ["--d" as string]: "100ms" }}>
          <div className="eyebrow">By discount</div>
          <h3 className="h-display mt-3 text-[26px] text-ink sm:text-[30px]">Discounts at a glance</h3>
          <table className="mt-5 w-full text-[15px]">
            <caption className="sr-only">Number of peptide promo codes by discount range</caption>
            <thead className="sr-only">
              <tr><th scope="col">Discount</th><th scope="col">Number of codes</th></tr>
            </thead>
            <tbody>
              {buckets.map(([name, n]) => (
                <tr key={name}>
                  <td className="py-2.5 pr-4 align-top">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-ink">{name}</span>
                      <span className="text-[13.5px] text-muted"><b className="text-ink">{n}</b> {n === 1 ? "code" : "codes"}</span>
                    </span>
                    <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-stone" aria-hidden>
                      <span className="block h-full rounded-full bg-gradient-to-r from-[#2f73ff] to-[#0b3d80]" style={{ width: `${Math.max(4, (n / maxBucket) * 100)}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-green-50 px-4 py-3 text-[14.5px] leading-relaxed text-[#17733a]">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green text-white"><IconCheck size={12} strokeWidth={3} /></span>
            {eligible > 0 ? `${stats.sitewide} of the ${stats.codes} codes are sitewide, and ${eligible} apply only to eligible products.` : `All ${stats.codes} codes are sitewide, so each one applies to the whole order.`}
          </p>
        </div>
      </div>

      {/* Buying tips */}
      <div className="mt-12 sm:mt-14">
        <div className="max-w-3xl" data-reveal>
          <div className="eyebrow">Buying tips</div>
          <h3 className="h-display mt-3 text-[28px] text-ink sm:text-[36px]">How to choose the best peptide coupon code</h3>
        </div>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tips.map((t, i) => (
            <li key={t.t} data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
              <div className="card h-full p-6">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b3d80] to-ink text-white shadow-[0_14px_30px_-10px_rgb(47_115_255/0.7)]">
                  {t.i}
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[12px] font-bold text-ink ring-2 ring-white">{i + 1}</span>
                </span>
                <h4 className="mt-5 text-[17px] font-bold leading-snug text-ink">{t.t}</h4>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Next steps + disclaimer */}
      <div className="card mt-6 flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between" data-reveal>
        <p className="text-[16.5px] leading-relaxed text-ink">
          <b>New to coupon codes?</b> <span className="text-muted">Read how to use a peptide coupon code, or browse every supplier in our vendors A-Z list.</span>
        </p>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href="/guides/how-to-use-a-peptide-coupon-code" className="btn btn-primary">How to use a peptide coupon code <IconArrowRight size={16} /></Link>
          <Link href="/vendors" className="btn btn-ghost">Vendors A-Z</Link>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2.5 text-[13.5px] leading-relaxed text-muted" data-reveal>
        <IconShield size={16} className="mt-0.5 shrink-0 text-navy" />
        Products from the suppliers listed here are sold for laboratory research use only. PeptidesCodes does not sell peptides or give medical advice.
      </p>
    </div>
  );
}
