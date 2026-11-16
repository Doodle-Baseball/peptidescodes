import Link from "next/link";
import type { VendorLite } from "@/lib/types";
import { VendorLogo } from "./VendorLogo";
import { CodeChip } from "./Deal";
import { IconArrowUpRight } from "./Icons";
import { shortDate } from "@/lib/format";

export function DealCard({ v, highlight = false, delay = 0 }: { v: VendorLite; highlight?: boolean; delay?: number }) {
  const href = v.affiliate_url || `/coupons/${v.slug}`;
  if (highlight) {
    return (
      <article data-reveal style={{ ["--d" as string]: `${delay}ms` }}>
        <div data-tilt="6" className="panel-navy relative flex h-full flex-col p-6">
          <div className="flex items-center gap-3">
            <VendorLogo name={v.name} src={v.logo_url} size={44} />
            <div className="min-w-0">
              <h3 className="truncate text-[19px] font-semibold tracking-[-0.02em]"><Link href={`/coupons/${v.slug}`} className="hover:underline">{v.name}</Link></h3>
              <p className="text-[13px] text-white/60">{v.applies_to} · verified {shortDate(v.verified_at)}</p>
            </div>
          </div>
          <div className="relative z-10 mt-5 flex items-end gap-2">
            <span className="text-[64px] font-medium leading-[0.85] tracking-[-0.05em]">{v.discount_percent}%</span>
            <span className="pb-1 text-[22px] font-semibold">OFF</span>
          </div>
          <div className="relative z-10 mt-5"><CodeChip v={v} source="top-deals" /></div>
          <a href={href} target="_blank" rel="sponsored nofollow noopener" className="btn btn-white btn-pill relative z-10 mt-4 w-full">
            Visit website <IconArrowUpRight size={15} />
          </a>
        </div>
      </article>
    );
  }
  return (
    <article data-reveal style={{ ["--d" as string]: `${delay}ms` }}>
      <div data-tilt="6" className="card relative flex h-full flex-col p-6">
        <div className="flex items-center gap-3">
          <VendorLogo name={v.name} src={v.logo_url} size={44} />
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-ink"><Link href={`/coupons/${v.slug}`} className="hover:underline">{v.name}</Link></h3>
            <p className="text-[13px] text-muted">{v.applies_to} · verified {shortDate(v.verified_at)}</p>
          </div>
        </div>
        <div className="mt-5 flex items-end gap-2">
          <span className="text-[52px] font-medium leading-[0.85] tracking-[-0.05em] text-ink">{v.discount_percent}%</span>
          <span className="pb-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">Off</span>
        </div>
        <div className="mt-5"><CodeChip v={v} source="top-deals" /></div>
        <div className="mt-auto pt-4">
          <a href={href} target="_blank" rel="sponsored nofollow noopener" className="btn btn-ghost btn-sm w-full">
            Visit website <IconArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
