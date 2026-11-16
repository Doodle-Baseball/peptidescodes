"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { VendorLite } from "@/lib/types";
import { VendorLogo } from "./VendorLogo";
import { IconArrowRight, IconSearch } from "./Icons";

/** Hero search with a suggestions panel (popular codes on focus, matching vendors while typing). */
export function HeroSearch({ vendors }: { vendors: VendorLite[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s
      ? vendors.filter((v) => v.name.toLowerCase().includes(s) || (v.code || "").toLowerCase().includes(s))
      : vendors.filter((v) => v.coupon_active);
    return list.slice(0, 5);
  }, [q, vendors]);

  useEffect(() => {
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (hi >= 0 && results[hi]) router.push(`/coupons/${results[hi].slug}`);
    else if (q.trim() && results.length === 1) router.push(`/coupons/${results[0].slug}`);
    else router.push(`/coupons${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <div ref={box} className="relative mt-6 max-w-xl">
      <form
        action="/coupons"
        method="get"
        role="search"
        onSubmit={submit}
        className={`flex items-center gap-2 rounded-2xl border bg-white p-2 shadow-[var(--shadow-lift)] transition-colors ${open ? "border-[#d9d6cf]" : "border-line"}`}
      >
        <IconSearch className="ml-3 shrink-0 text-muted" />
        <label htmlFor="hero-q" className="sr-only">Search a vendor</label>
        <span className="relative flex min-w-0 flex-1 items-center">
        {/* Responsive placeholder: short on phones, full on larger screens. */}
        {!q && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 right-1 flex items-center overflow-hidden text-[15px] text-[#8a93a8] sm:text-[16px]">
            <span className="truncate sm:hidden">Search a vendor…</span>
            <span className="hidden truncate sm:inline">Search a vendor, e.g. Ascension Peptides</span>
          </span>
        )}
        <input
          id="hero-q"
          name="q"
          value={q}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(-1); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, -1)); }
            if (e.key === "Escape") setOpen(false);
          }}
          className="no-focus-ring relative h-12 w-full min-w-0 bg-transparent text-[16px] text-ink"
          role="combobox"
          aria-expanded={open}
          aria-controls="hero-search-list"
          aria-autocomplete="list"
        />
        </span>
        <button className="btn btn-primary h-12 shrink-0">Find code</button>
      </form>

      {open && (
        <div className="animate-pop absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_30px_60px_-28px_rgb(8_30_76/0.35)]">
          <div className="flex items-center justify-between px-5 pb-1 pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8a8a]">{q.trim() ? "Matching vendors" : "Popular codes"}</span>
            {!q.trim() && <span className="text-[12px] text-muted">Type to search {vendors.length} vendors</span>}
          </div>
          <ul id="hero-search-list" role="listbox" className="p-2">
            {results.length === 0 && <li className="px-3 py-5 text-[14.5px] text-muted">No vendor found for “{q}”. Press Find code to search all coupons.</li>}
            {results.map((v, idx) => (
              <li key={v.slug} role="option" aria-selected={idx === hi}>
                <Link
                  href={`/coupons/${v.slug}`}
                  onMouseEnter={() => setHi(idx)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${idx === hi ? "bg-stone" : "hover:bg-stone"}`}
                >
                  <VendorLogo name={v.name} src={v.logo_url} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{v.name}</span>
                    <span className="block text-[12.5px] text-muted">{v.applies_to || "Sitewide"}{v.featured ? " · Featured" : ""}</span>
                  </span>
                  {v.coupon_active && v.discount_percent > 0 ? (
                    <span className="pill pill-sale shrink-0">{v.discount_percent}% off</span>
                  ) : (
                    <span className="pill bg-stone shrink-0 text-muted">Deal</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/coupons${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`} onClick={() => setOpen(false)} className="flex items-center justify-center gap-1.5 border-t border-line bg-stone/60 py-3 text-[14px] font-semibold text-ink hover:bg-stone">
            See all {vendors.filter((v) => v.coupon_active).length} coupon codes <IconArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
