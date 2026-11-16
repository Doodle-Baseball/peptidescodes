"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Counts up to the value whenever the card becomes active. */
function CountUp({ value, run }: { value: number; run: boolean }) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(value); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);
  return <>{n}</>;
}
import Link from "next/link";
import type { VendorLite } from "@/lib/types";
import { shortDate } from "@/lib/format";
import { VendorLogo } from "./VendorLogo";
import { useDeal } from "./Deal";
import { IconChevronLeft, IconChevronRight, IconCopy } from "./Icons";

/** 3D stacked deck of featured coupon cards in the navy "panel" style. */
export function HeroCarousel({ items }: { items: VendorLite[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const { open } = useDeal();
  const n = items.length;
  const go = useCallback((d: number) => { setDir(d >= 0 ? 1 : -1); setI((x) => (x + d + n) % n); }, [n]);
  const jump = (idx: number) => { setDir(idx >= i ? 1 : -1); setI(idx); };

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), 5200);
    return () => clearInterval(t);
  }, [paused, go, n]);

  if (!n) return null;

  return (
    <div
      ref={stage}
      className="stage3d relative mx-auto w-full max-w-[440px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="deck relative h-[430px]" aria-roledescription="carousel" aria-label="Featured peptide coupon codes">
        {items.map((v, idx) => {
          const off = (idx - i + n) % n; // 0 = front
          const active = off === 0;
          // The card that just left exits on one side; all waiting cards sit on the other side.
          const leaving = dir > 0 ? off === n - 1 : off === 1;
          const side = (dir > 0) === leaving ? -1 : 1; // -1 = left, 1 = right
          const transform = active
            ? "translate3d(0,0,0) rotateY(0deg) scale(1)"
            : `translate3d(${side * 80}px,0,-140px) rotateY(${side * -22}deg) scale(0.92)`;
          return (
            <article
              key={v.slug}
              className={`deck-card hc-card ${active ? "is-active" : ""}`}
              style={{ transform, opacity: active ? 1 : 0, filter: active ? "blur(0)" : "blur(6px)", zIndex: active ? 20 : leaving ? 10 : 5, pointerEvents: active ? "auto" : "none" }}
              aria-hidden={off !== 0}
              aria-roledescription="slide"
            >
              <div
                className={`panel-navy flex h-full flex-col !rounded-[28px] p-6 ${off === 0 ? "shadow-[0_2px_0_rgb(255_255_255/0.08)_inset,0_50px_90px_-30px_rgb(8_30_76/0.65),0_18px_30px_-18px_rgb(8_30_76/0.5)]" : "shadow-[0_30px_60px_-30px_rgb(8_30_76/0.6)] ring-1 ring-white/10"}`}
              >
                {/* glossy sheen + one-time light sweep when the card becomes active */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[30px] bg-[linear-gradient(125deg,rgb(255_255_255/0.14)_0%,rgb(255_255_255/0)_38%)]" />
                <span aria-hidden className="hc-sweep pointer-events-none absolute inset-y-0 -left-1/2 z-20 w-1/2 bg-[linear-gradient(100deg,transparent,rgb(255_255_255/0.22),transparent)]" />

                <h3 style={{ ["--i" as string]: 0 }} className="hc-st relative z-10 text-[23px] font-semibold leading-tight tracking-[-0.03em]">{v.name}</h3>
                <p style={{ ["--i" as string]: 1 }} className="hc-st relative z-10 mt-1.5 text-[15px] text-white/60">
                  {v.applies_to || "Sitewide"} · verified {shortDate(v.verified_at)}{v.country ? ` · ${v.country === "United States" ? "USA" : v.country}` : ""}
                </p>

                <div style={{ ["--i" as string]: 2 }} className="hc-st relative z-10 mt-3 flex items-end gap-3">
                  <span className="text-[80px] font-medium leading-[0.86] tracking-[-0.06em] tabular-nums"><CountUp value={v.discount_percent} run={active} />%</span>
                  <span className="pb-1.5 text-[30px] font-semibold tracking-[-0.03em]">OFF</span>
                </div>

                {/* "photo" area: soft cloud background with the logo */}
                <div style={{ ["--i" as string]: 3 }} className="hc-st relative z-10 mt-4 flex flex-1 items-center gap-3 sm:gap-4 overflow-hidden rounded-[22px] bg-[radial-gradient(130%_100%_at_15%_0%,#ffffff_0%,#f8efe3_34%,#e6edf9_70%,#cfdaf3_100%)] px-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.85),inset_0_-14px_30px_-20px_rgb(8_30_76/0.25)] sm:px-5">
                  {/* soft clouds */}
                  <span aria-hidden className="absolute -left-8 bottom-[-34px] h-28 w-44 rounded-full bg-white/80 blur-2xl" />
                  <span aria-hidden className="absolute -right-10 top-[-26px] h-24 w-44 rounded-full bg-white/70 blur-2xl" />
                  <span aria-hidden className="absolute left-1/2 top-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />

                  {/* logo tile with verified tick */}
                  <span className="relative shrink-0">
                    <span aria-hidden className="absolute inset-x-2 -bottom-3 h-6 rounded-full bg-ink/25 blur-lg" />
                    <span className="relative hidden sm:block"><VendorLogo name={v.name} src={v.logo_url} size={80} className="!ring-0 shadow-[0_1px_0_#fff_inset,0_18px_34px_-16px_rgb(8_30_76/0.55)]" /></span>
                    <span className="relative block sm:hidden"><VendorLogo name={v.name} src={v.logo_url} size={58} className="!ring-0 shadow-[0_1px_0_#fff_inset,0_14px_26px_-14px_rgb(8_30_76/0.55)]" /></span>
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-green text-white ring-[3px] ring-white shadow-md" title="Verified">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                  </span>

                  {/* coupon ticket */}
                  {v.code ? (
                    <button
                      type="button"
                      onClick={() => open(v, { source: "hero" })}
                      className="group/tk relative flex min-w-0 flex-1 items-stretch overflow-visible rounded-2xl bg-white text-left shadow-[0_1px_0_#fff_inset,0_16px_30px_-18px_rgb(8_30_76/0.55)] transition hover:-translate-y-0.5"
                      aria-label={`Copy ${v.name} code ${v.code}`}
                    >
                      <span className="min-w-0 flex-1 px-3 py-3 sm:px-4">
                        <span className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a8a8a] sm:text-[10.5px]">Your code</span>
                        <span className="mt-1 block truncate font-mono text-[15px] font-bold tracking-[0.04em] text-ink sm:text-[18px] sm:tracking-[0.06em]">{v.code}</span>
                      </span>
                      {/* dashed tear line + notches */}
                      <span aria-hidden className="relative w-0 border-l-2 border-dashed border-[#d9d6cf]">
                        <span className="absolute -left-[9px] -top-[9px] h-4 w-4 rounded-full bg-[#eef1f8]" />
                        <span className="absolute -bottom-[9px] -left-[9px] h-4 w-4 rounded-full bg-[#e3e9f6]" />
                      </span>
                      <span className="flex flex-col items-center justify-center gap-1 px-2.5 sm:px-3.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green text-white transition group-hover/tk:scale-105">
                          <IconCopy size={16} />
                        </span>
                        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-green">Copy</span>
                      </span>
                    </button>
                  ) : (
                    <span className="relative rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-ink shadow-[0_16px_30px_-18px_rgb(8_30_76/0.55)]">Partner deal, no code needed</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => open(v, { go: true, source: "hero" })}
                  style={{ ["--i" as string]: 4 }}
                  className="hc-st btn btn-white btn-pill relative z-10 mt-4 h-[50px] w-full text-[16px] shadow-[0_14px_28px_-16px_rgb(0_0_0/0.6)]"
                >
                  Get the code <span aria-hidden>→</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button onClick={() => go(-1)} aria-label="Previous deal" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white shadow-sm transition hover:-translate-x-0.5 hover:shadow-md"><IconChevronLeft /></button>
        <div className="flex items-center gap-1.5">
          {items.map((v, idx) => (
            <button key={v.slug} onClick={() => jump(idx)} aria-label={`Show ${v.name}`} className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 ${idx === i ? "w-9 bg-[#cfccc4]" : "w-2 bg-[#cfccc4] hover:bg-[#8a8a8a]"}`}>
              {idx === i && <span key={i} className="hc-progress absolute inset-y-0 left-0 rounded-full bg-ink" style={{ animationPlayState: paused ? "paused" : "running" }} />}
            </button>
          ))}
        </div>
        <button onClick={() => go(1)} aria-label="Next deal" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white shadow-sm transition hover:translate-x-0.5 hover:shadow-md"><IconChevronRight /></button>
      </div>
      <p className="sr-only">
        Featured: {items.map((v) => `${v.name} ${v.discount_label}`).join(", ")}. <Link href="/coupons">See all coupons</Link>
      </p>
    </div>
  );
}
