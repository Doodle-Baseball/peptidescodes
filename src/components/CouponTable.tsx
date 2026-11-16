"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { VendorLite } from "@/lib/types";
import { shortDate } from "@/lib/format";
import { VendorLogo } from "./VendorLogo";
import { CodeChip, GetDealButton } from "./Deal";
import { IconCheck, IconSearch } from "./Icons";
import { Dropdown } from "./Dropdown";

type Props = { items: VendorLite[]; withFilters?: boolean; limit?: number; mobileLimit?: number };

export function CouponTable({ items, withFilters = true, limit, mobileLimit }: Props) {
  const [q, setQ] = useState("");
  const [minPct, setMinPct] = useState(0);
  const [applies, setApplies] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    if (!withFilters) return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) setQ(p.get("q")!);
    if (p.get("discount")) setMinPct(Number(p.get("discount")) || 0);
    if (p.get("applies")) setApplies(p.get("applies")!);
    if (p.get("sort")) setSort(p.get("sort")!);
  }, [withFilters]);

  const appliesOptions = useMemo(() => Array.from(new Set(items.map((v) => v.applies_to || "Sitewide"))), [items]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = items.filter(
      (v) =>
        (!s || v.name.toLowerCase().includes(s) || (v.code || "").toLowerCase().includes(s)) &&
        v.discount_percent >= minPct &&
        (applies === "all" || (v.applies_to || "Sitewide") === applies),
    );
    list = [...list].sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "recent") return (b.verified_at || "").localeCompare(a.verified_at || "") || b.discount_percent - a.discount_percent;
      if (sort === "discount") return b.discount_percent - a.discount_percent || a.name.localeCompare(b.name);
      return 0; // "featured" = recommended: keep the manual order set in the admin
    });
    return limit ? list.slice(0, limit) : list;
  }, [items, q, minPct, applies, sort, limit]);

  return (
    <div>
      {withFilters && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <label htmlFor="f-q" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">Search vendor or code</label>
            <div className="relative">
              <IconSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input id="f-q" value={q} autoComplete="off" spellCheck={false} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Amino Club" className="no-focus-ring h-12 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-[15px] transition-colors focus:border-[#cfccc4]" />
            </div>
          </div>
          <Select id="f-d" label="Discount" value={String(minPct)} onChange={(v) => setMinPct(Number(v))} options={[["0", "All discounts"], ["10", "10% off or more"], ["15", "15% off or more"], ["20", "20% off or more"], ["25", "25% off or more"], ["50", "50% off or more"]]} />
          <Select id="f-a" label="Applies to" value={applies} onChange={setApplies} options={[["all", "Any offer type"], ...appliesOptions.map((a) => [a, a] as [string, string])]} />
          <Select id="f-s" label="Sort" value={sort} onChange={setSort} options={[["featured", "Recommended"], ["discount", "Biggest discount"], ["recent", "Recently verified"], ["az", "Vendor A-Z"]]} />
        </div>
      )}
      {withFilters && <p className="mb-3 mt-5 text-[14px] text-muted" aria-live="polite"><b className="text-ink">{rows.length}</b> {rows.length === 1 ? "code" : "codes"}</p>}

      <div className="card-3d" data-reveal>
        <div className="overflow-hidden rounded-[26px]">
        <table className="w-full border-collapse text-left">
          <thead className="hidden border-b border-line bg-white md:table-header-group">
            <tr className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">
              <th scope="col" className="px-5 py-4">Vendor</th>
              <th scope="col" className="px-4 py-4">Coupon code</th>
              <th scope="col" className="px-4 py-4">Discount</th>
              <th scope="col" className="hidden px-4 py-4 lg:table-cell">Applies to</th>
              <th scope="col" className="hidden px-4 py-4 lg:table-cell">Verified</th>
              <th scope="col" className="px-5 py-4"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v, ri) => (
              <tr key={v.slug} className={`${mobileLimit !== undefined && ri >= mobileLimit ? "max-md:hidden " : ""}row-lift group grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3 border-t border-line bg-white p-4 first:border-t-0 md:table-row md:p-0`}>
                <td className="col-span-2 md:px-5 md:py-4">
                  <Link href={`/coupons/${v.slug}`} className="flex items-center gap-3">
                    <VendorLogo name={v.name} src={v.logo_url} size={46} />
                    <span className="min-w-0">
                      <span className="block text-[16px] font-semibold tracking-[-0.015em] text-ink">{v.name}</span>
                      {v.featured && <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_6px_-3px_rgb(8_30_76/0.3)]"><span className="h-1.5 w-1.5 rounded-full bg-gold" />Featured</span>}
                    </span>
                    <span className="pill pill-sale ml-auto md:hidden">{v.discount_label || `${v.discount_percent}% Off`}</span>
                  </Link>
                </td>
                <td className="col-span-2 md:px-4 md:py-4"><CodeChip v={v} source="table" /></td>
                <td className="hidden md:table-cell md:px-4 md:py-4"><span className="pill pill-sale !px-3 !py-1.5 !text-[14.5px]">{v.discount_label || `${v.discount_percent}% Off`}</span></td>
                <td className="hidden text-[14.5px] text-muted lg:table-cell lg:px-4 lg:py-4">{v.applies_to}</td>
                <td className="hidden lg:table-cell lg:px-4 lg:py-4"><span className="pill pill-green"><IconCheck size={12} /> {shortDate(v.verified_at)}</span></td>
                <td className="col-span-2 md:px-5 md:py-4 md:text-right">
                  <span className="grid grid-cols-2 gap-2 md:inline-flex md:justify-end">
                    <Link href={`/coupons/${v.slug}`} className="btn btn-ghost btn-sm">Full details</Link>
                    <GetDealButton v={v} className="btn-sm" source="table" />
                  </span>
                  <span className="mt-2 flex items-center justify-between text-[12.5px] text-muted md:hidden">
                    <span>{v.applies_to}</span>
                    <span className="flex items-center gap-1 text-green"><IconCheck size={12} /> Verified {shortDate(v.verified_at)}</span>
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted">No codes match those filters. <button className="font-semibold text-navy underline" onClick={() => { setQ(""); setMinPct(0); setApplies("all"); }}>Reset filters</button></td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function Select({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <Dropdown id={id} label={label} value={value} onChange={onChange} options={options} />
  );
}
