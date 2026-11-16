"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import type { VendorLite } from "@/lib/types";
import { browserClient } from "@/lib/supabase";
import { VendorLogo } from "./VendorLogo";
import { IconArrowUpRight, IconCheck, IconCopy, IconX } from "./Icons";

type Ctx = { open: (v: VendorLite, opts?: { go?: boolean; source?: string }) => void };
const DealCtx = createContext<Ctx>({ open: () => {} });
export const useDeal = () => useContext(DealCtx);

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function track(v: VendorLite, kind: string, source?: string) {
  try {
    void browserClient().from("click_events").insert({ vendor_slug: v.slug, kind, source: source || location.pathname });
  } catch {
    /* tracking is best-effort */
  }
}

export function DealProvider({ children }: { children: React.ReactNode }) {
  const [deal, setDeal] = useState<VendorLite | null>(null);
  const [copied, setCopied] = useState(false);

  const open = useCallback((v: VendorLite, opts?: { go?: boolean; source?: string }) => {
    if (v.code) copyText(v.code).then(setCopied);
    else setCopied(false);
    if (opts?.go && v.affiliate_url) {
      window.open(v.affiliate_url, "_blank", "noopener");
      track(v, "deal", opts.source);
    } else {
      track(v, "copy", opts?.source);
    }
    setDeal(v);
  }, []);

  useEffect(() => {
    if (!deal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDeal(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [deal]);

  return (
    <DealCtx.Provider value={{ open }}>
      {children}
      {deal && (
        <div className="animate-fade fixed inset-0 z-[100] flex items-end justify-center bg-ink/55 p-3 backdrop-blur-sm sm:items-center" onClick={() => setDeal(null)} role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="deal-title" className="animate-pop relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-top relative px-6 pb-7 pt-6 text-white">
              <button onClick={() => setDeal(null)} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 hover:bg-white/25">
                <IconX size={18} />
              </button>
              <div className="flex items-center gap-3">
                <VendorLogo name={deal.name} src={deal.logo_url} size={44} />
                <div>
                  <div className="text-[13px] font-semibold uppercase tracking-wider text-white/75">{deal.name}</div>
                  <div id="deal-title" className="font-display text-[34px] font-semibold leading-none">
                    {deal.discount_label || `${deal.discount_percent}% Off`}
                  </div>
                </div>
              </div>
            </div>
            <div className="ticket-cut" style={{ ["--notch" as string]: "rgb(8 30 76 / 0.55)" }} />
            <div className="px-6 pb-6 pt-6">
              {deal.code ? (
                <>
                  <p className="text-center text-[14px] font-semibold text-green">{copied ? "✓ Code copied to your clipboard" : "Copy this code"}</p>
                  <button
                    onClick={() => copyText(deal.code!).then(setCopied)}
                    className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[#9fd3ae] bg-[#effaf2] px-5 py-4 text-left"
                  >
                    <span className="font-mono text-[22px] font-bold tracking-[0.12em] text-[#17733a] break-all">{deal.code}</span>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-green px-3 py-2 text-[14px] font-semibold text-white">
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />} {copied ? "Copied" : "Copy"}
                    </span>
                  </button>
                </>
              ) : (
                <p className="text-center text-[15px] text-muted">No code needed, the partner offer is applied through our link.</p>
              )}
              <ol className="mt-5 space-y-2 text-[14px] text-muted">
                <li><b className="text-ink">1.</b> Open {deal.name} and add items to your cart.</li>
                <li><b className="text-ink">2.</b> Paste the code in the coupon / promo box at checkout.</li>
                <li><b className="text-ink">3.</b> Check the discount line appears before you pay.</li>
              </ol>
              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {deal.affiliate_url ? (
                  <a href={deal.affiliate_url} target="_blank" rel="sponsored nofollow noopener" className="btn btn-blue w-full" onClick={() => track(deal, "deal", "modal")}>
                    Go to store <IconArrowUpRight size={16} />
                  </a>
                ) : (
                  <span className="btn btn-ghost w-full opacity-60">Store link coming soon</span>
                )}
                <Link href={`/coupons/${deal.slug}`} className="btn btn-ghost w-full" onClick={() => setDeal(null)}>
                  Code details
                </Link>
              </div>
              <p className="mt-4 text-center text-[12px] text-muted">We may earn a commission at no extra cost to you. For research use only.</p>
            </div>
          </div>
        </div>
      )}
    </DealCtx.Provider>
  );
}

/** Dashed code + green Copy button. Copies the code and shows the deal modal. */
export function CodeChip({ v, size = "md", source }: { v: VendorLite; size?: "sm" | "md" | "lg"; source?: string }) {
  const { open } = useDeal();
  if (!v.code) return <span className="pill pill-sky">No code needed</span>;
  const pad = size === "lg" ? "text-[16px] !py-3 !px-5" : size === "sm" ? "!text-[12.5px] !py-1.5 !px-2.5" : "";
  return (
    <span className="code-chip">
      <span className={`code ${pad}`}>{v.code}</span>
      <button type="button" onClick={() => open(v, { source })} aria-label={`Copy ${v.name} coupon code ${v.code}`}>
        <IconCopy size={15} /> Copy
      </button>
    </span>
  );
}

export function GetDealButton({ v, className = "", label = "Get deal", source }: { v: VendorLite; className?: string; label?: string; source?: string }) {
  const { open } = useDeal();
  return (
    <button type="button" onClick={() => open(v, { go: true, source })} className={`btn btn-blue ${className}`} aria-label={`${label} at ${v.name}`}>
      {label} <IconArrowUpRight size={16} />
    </button>
  );
}
