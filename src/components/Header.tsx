"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { VendorLite } from "@/lib/types";
import { BrandLogo } from "./BrandLogo";
import { VendorLogo } from "./VendorLogo";
import { IconArrowRight, IconChevronDown, IconChrome, IconMenu, IconSearch, IconX } from "./Icons";

type Props = { siteName: string; announcement?: string; extensionUrl: string; vendors: VendorLite[] };

function SearchBox({ vendors, onDone, autoFocus = false, glass = false }: { vendors: VendorLite[]; onDone?: () => void; autoFocus?: boolean; glass?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s
      ? vendors.filter((v) => v.name.toLowerCase().includes(s) || (v.code || "").toLowerCase().includes(s))
      : vendors.filter((v) => v.coupon_active);
    return list.slice(0, 7);
  }, [q, vendors]);

  useEffect(() => {
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    onDone?.();
    router.push(href);
  };

  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[hi] && q) go(`/coupons/${results[hi].slug}`);
          else go(`/coupons${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        }}
      >
        <label className="sr-only" htmlFor={autoFocus ? "m-search" : "h-search"}>Search vendors</label>
        <IconSearch size={18} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${glass ? "text-white/80" : "text-muted"}`} />
        <input
          id={autoFocus ? "m-search" : "h-search"}
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search vendors or codes…"
          className={`no-focus-ring h-11 w-full rounded-xl border pl-10 pr-3 text-[15px] transition focus:border-[#cfccc4] focus:bg-white focus:text-ink focus:placeholder:text-[#8a8a8a] focus:outline-none ${glass ? "border-white/25 bg-white/15 text-white placeholder:text-white/75" : "border-line bg-white/80 text-ink placeholder:text-[#8a8a8a]"}`}
          role="combobox"
          aria-expanded={open}
          aria-controls="search-list"
        />
      </form>
      {open && (
        <div className="animate-pop absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-lift)]">
          <div className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{q ? "Matching vendors" : "Popular codes"}</div>
          <ul id="search-list" role="listbox" className="max-h-[60vh] overflow-auto p-1.5">
            {results.length === 0 && <li className="px-3 py-4 text-[14px] text-muted">No vendor found. Press Enter to search all coupons.</li>}
            {results.map((v, idx) => (
              <li key={v.slug} role="option" aria-selected={idx === hi}>
                <Link
                  href={`/coupons/${v.slug}`}
                  onMouseEnter={() => setHi(idx)}
                  onClick={() => { setOpen(false); setQ(""); onDone?.(); }}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition ${idx === hi ? "bg-stone" : "hover:bg-stone"}`}
                >
                  <VendorLogo name={v.name} src={v.logo_url} size={36} />
                  <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">{v.name}</span>
                  {v.coupon_active && v.discount_percent > 0 ? (
                    <span className="pill pill-sale shrink-0">{v.discount_percent}% off</span>
                  ) : (
                    <span className="pill pill-sky shrink-0">Deal</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/coupons" onClick={() => { setOpen(false); onDone?.(); }} className="flex items-center justify-center gap-1.5 border-t border-line py-3 text-[14px] font-semibold text-navy hover:bg-bone">
            See all {vendors.filter((v) => v.coupon_active).length} coupon codes <IconArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}

export function Header({ siteName, announcement, extensionUrl, vendors }: Props) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setMenu(false); setMega(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = menu ? "hidden" : ""; }, [menu]);

  const topVendors = useMemo(() => [...vendors].filter((v) => v.coupon_active).sort((a, b) => b.discount_percent - a.discount_percent).slice(0, 18), [vendors]);
  const tone = scrolled ? "text-white hover:bg-white/10" : "text-ink hover:bg-black/[0.04]";
  const navLink = (href: string, label: string) => (
    <Link href={href} className={`rounded-lg px-3 py-2 text-[15px] font-semibold tracking-[-0.01em] transition ${tone} ${pathname === href ? "underline underline-offset-8" : ""}`}>{label}</Link>
  );
  const openMega = () => { if (megaTimer.current) clearTimeout(megaTimer.current); setMega(true); };
  const closeMega = () => { megaTimer.current = setTimeout(() => setMega(false), 140); };

  return (
    <>
      {announcement && (
        <div className="bg-ink text-white">
          <div className="container-x flex h-9 items-center justify-center gap-2 text-[13px]">
            <IconChrome size={15} />
            <a href={extensionUrl} target="_blank" rel="noopener" className="truncate font-medium hover:underline">{announcement}</a>
            <span className="hidden text-peri sm:inline">→</span>
          </div>
        </div>
      )}
      <header className="sticky top-3 z-40 mt-3 px-3 sm:px-5">
        <div className={`mx-auto flex h-[74px] max-w-[1400px] items-center gap-4 rounded-[22px] px-4 transition-[background-color,box-shadow] duration-300 sm:px-6 ${scrolled ? "glass-grey" : "glass-light"}`}>
          <BrandLogo name={siteName} light={scrolled} />
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
            {navLink("/#top-deals", "Top deals")}
            <div className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                onClick={() => setMega((m) => !m)}
                aria-expanded={mega}
                aria-haspopup="true"
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-semibold tracking-[-0.01em] transition ${tone}`}
              >
                Vendors <IconChevronDown size={16} className={`transition ${mega ? "rotate-180" : ""}`} />
              </button>
              {mega && topVendors[0] && (
                <div className="animate-pop absolute left-1/2 top-full z-50 w-[min(880px,calc(100vw-2rem))] -translate-x-1/2 pt-4">
                  <div className="rounded-[26px] border border-line bg-white p-3 shadow-[0_40px_80px_-32px_rgb(8_30_76/0.35)]">
                    <div className="grid grid-cols-[240px_1fr] gap-3">
                      {/* Featured top deal */}
                      <Link href={`/coupons/${topVendors[0].slug}`} className="panel-navy group flex flex-col justify-between rounded-[20px] p-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Top deal</span>
                        <span className="relative z-10 mt-6 block">
                          <span className="block text-[68px] font-medium leading-none tracking-[-0.05em]">{topVendors[0].discount_percent}%</span>
                          <span className="mt-2 block text-[15px] text-white/75">off at</span>
                          <span className="block text-[18px] font-semibold tracking-[-0.02em]">{topVendors[0].name}</span>
                        </span>
                        <span className="btn btn-white btn-pill btn-sm relative z-10 mt-6 w-full">Get the code <span className="transition group-hover:translate-x-0.5">→</span></span>
                      </Link>
                      {/* Vendor list */}
                      <div className="px-2 py-2">
                        <div className="mb-2 flex items-center justify-between px-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a8a8a]">Top vendors by discount</span>
                          <Link href="/vendors" className="text-[13.5px] font-semibold text-ink hover:underline">All vendors A-Z →</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-x-1">
                          {topVendors.slice(1, 13).map((v) => (
                            <Link key={v.slug} href={`/coupons/${v.slug}`} onClick={() => setMega(false)} className="flex cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2.5 transition hover:bg-stone">
                              <VendorLogo name={v.name} src={v.logo_url} size={36} />
                              <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold tracking-[-0.01em] text-ink">{v.name}</span>
                              <span className="pill pill-sale shrink-0 !px-2 !py-0.5 !text-[12px]">{v.discount_percent}% off</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-[18px] bg-stone px-5 py-3.5">
                      <span className="text-[13.5px] text-muted"><b className="font-semibold text-ink">{vendors.length}</b> vendors · <b className="font-semibold text-ink">{vendors.filter((v) => v.coupon_active).length}</b> verified codes</span>
                      <Link href="/coupons" className="btn btn-primary btn-sm">Browse all coupons</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {navLink("/guides", "Guides")}
            <Link href="/extension" className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-semibold tracking-[-0.01em] transition ${tone}`}>
              Extension <span className="rounded-full bg-green px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
            </Link>
          </nav>
          <div className="ml-auto hidden w-full max-w-[300px] md:block lg:ml-4">
            <SearchBox vendors={vendors} glass={scrolled} />
          </div>
          <Link href="/coupons" className={`btn ml-auto hidden !h-12 sm:inline-flex md:ml-0 ${scrolled ? "btn-white" : "btn-primary"}`}>All coupons</Link>
          <button onClick={() => setMenu(true)} className={`ml-auto flex h-11 w-11 items-center justify-center rounded-xl border lg:hidden sm:ml-0 ${scrolled ? "border-white/30 text-white" : "border-line text-ink"}`} aria-label="Open menu">
            <IconMenu />
          </button>
        </div>
      </header>

      {menu && (
        <div className="animate-fade fixed inset-0 z-[90] bg-ink/50 backdrop-blur-sm lg:hidden" onClick={() => setMenu(false)}>
          <div className="animate-pop ml-auto flex h-full w-[min(92vw,400px)] flex-col overflow-y-auto bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <BrandLogo name={siteName} />
              <button onClick={() => setMenu(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line" aria-label="Close menu"><IconX /></button>
            </div>
            <div className="mt-5"><SearchBox vendors={vendors} onDone={() => setMenu(false)} /></div>
            <nav className="mt-4 flex flex-col text-[17px] font-semibold" aria-label="Mobile">
              {[["/", "Home"], ["/#top-deals", "Top deals"], ["/coupons", "All coupon codes"], ["/vendors", "Vendors A-Z"], ["/guides", "Guides"], ["/extension", "Chrome extension"], ["/about", "About"], ["/contact", "Contact"]].map(([h, l]) => (
                <Link key={h} href={h} onClick={() => setMenu(false)} className="border-b border-line py-3.5 text-ink hover:text-navy">{l}</Link>
              ))}
            </nav>
            <a href={extensionUrl} target="_blank" rel="noopener" className="btn btn-blue mt-6 w-full"><IconChrome size={18} /> Add to Chrome for free</a>
          </div>
        </div>
      )}
    </>
  );
}
