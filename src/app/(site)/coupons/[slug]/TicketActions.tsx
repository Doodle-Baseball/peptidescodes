"use client";

import type { VendorLite } from "@/lib/types";
import { useCopyCode, useDeal } from "@/components/Deal";
import { IconArrowUpRight, IconCheck, IconCopy } from "@/components/Icons";

export function TicketActions({ v }: { v: VendorLite }) {
  const { open } = useDeal();
  const codeBox = useCopyCode();
  const copyBtn = useCopyCode();
  return (
    <>
      {v.code ? (
        <button
          onClick={() => codeBox.copyCode(v, "ticket")}
          className="mt-3 flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-[#8b93e8]/70 bg-[#13306f] px-4 py-4 font-mono text-[22px] font-bold tracking-[0.18em] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition hover:border-[#aab0f0] hover:bg-[#173a82] sm:text-[26px]"
          aria-label={`Copy code ${v.code}`}
        >
          <span className="break-all">{codeBox.copiedSlug ? "Copied!" : v.code}</span>
        </button>
      ) : (
        <div className="mt-3 rounded-2xl border-2 border-dashed border-white/20 px-4 py-4 text-center text-white/80">No code needed</div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => copyBtn.copyCode(v, "ticket")} className="btn btn-green h-12 w-full" disabled={!v.code}>
          {copyBtn.copiedSlug ? <IconCheck size={17} /> : <IconCopy size={17} />} {copyBtn.copiedSlug ? "Copied!" : "Copy coupon"}
        </button>
        <button onClick={() => open(v, { go: true, source: "ticket" })} className="btn h-12 w-full bg-white text-ink hover:bg-sky" disabled={!v.affiliate_url}>
          Visit website <IconArrowUpRight size={16} />
        </button>
      </div>
    </>
  );
}
