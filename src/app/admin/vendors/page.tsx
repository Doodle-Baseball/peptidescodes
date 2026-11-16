"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Vendor } from "@/lib/types";
import { VendorLogo } from "@/components/VendorLogo";
import { DbError, OnOff, revalidateSite, sb, today, useLoad, useToast } from "../_lib/ui";

const STAR = "M12 2.6l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.42l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94z";

/** Glossy 3D-style star: gold when featured, soft silver when not. */
function Star3D({ on, size = 26 }: { on: boolean; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ filter: on ? "drop-shadow(0 2px 2.5px rgb(180 110 0 / 0.45))" : "drop-shadow(0 1px 1.5px rgb(8 30 76 / 0.18))" }}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          {on ? (<><stop offset="0" stopColor="#FFE58A" /><stop offset="0.55" stopColor="#FBBF24" /><stop offset="1" stopColor="#D97706" /></>)
              : (<><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#E6EAF1" /><stop offset="1" stopColor="#C3CAD6" /></>)}
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={on ? 0.85 : 0.9} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}c`}><path d={STAR} /></clipPath>
      </defs>
      <path d={STAR} fill={`url(#${id}f)`} stroke={on ? "#B45309" : "#AEB6C4"} strokeWidth="0.9" strokeLinejoin="round" />
      <g clipPath={`url(#${id}c)`}>
        <ellipse cx="10.2" cy="7.2" rx="7.2" ry="4.6" fill={`url(#${id}h)`} />
        <path d="M12 17.42 6.2 20.47l1.11-6.47L12 17.42Z" fill="#000" opacity={on ? 0.08 : 0.05} />
      </g>
    </svg>
  );
}

const Grip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="9" cy="5" r="1.7" /><circle cx="15" cy="5" r="1.7" /><circle cx="9" cy="12" r="1.7" /><circle cx="15" cy="12" r="1.7" /><circle cx="9" cy="19" r="1.7" /><circle cx="15" cy="19" r="1.7" />
  </svg>
);

export default function VendorsAdmin() {
  const toast = useToast();
  const { data, error, loading, reload, setData } = useLoad<Vendor[]>(async () => sb().from("vendors").select("*").order("sort_order").order("name"));
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const before = useRef<Vendor[] | null>(null);

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return (data || []).filter((v) =>
      (!s || v.name.toLowerCase().includes(s) || (v.code || "").toLowerCase().includes(s)) &&
      (filter === "all" || (filter === "featured" && v.featured) || (filter === "live" && v.published) || (filter === "hidden" && !v.published)),
    );
  }, [data, q, filter]);
  const canDrag = !q && filter === "all" && !saving;

  const patch = async (v: Vendor, p: Partial<Vendor>) => {
    setData((d) => (d || []).map((x) => (x.id === v.id ? { ...x, ...p } : x)));
    const { error } = await sb().from("vendors").update(p).eq("id", v.id!);
    if (error) { toast(error.message, "err"); reload(); return; }
    revalidateSite();
  };

  /** Move a vendor to another vendor's position in the list. */
  const latest = useRef<Vendor[] | null>(null);
  latest.current = data;
  const moveTo = (id: string, overId: string) => {
    const list = [...(latest.current || [])];
    const from = list.findIndex((x) => x.id === id);
    const to = list.findIndex((x) => x.id === overId);
    if (from < 0 || to < 0 || from === to) return;
    const [m] = list.splice(from, 1);
    list.splice(to, 0, m);
    latest.current = list;
    setData(list);
  };

  /** Save positions 1, 2, 3 … for every vendor whose position changed. */
  const saveOrder = async (list: Vendor[]) => {
    const changed = list.map((v, i) => ({ v, n: i + 1 })).filter(({ v, n }) => v.sort_order !== n);
    if (!changed.length) return;
    setSaving(true);
    setData(list.map((v, i) => ({ ...v, sort_order: i + 1 })));
    let failed: string | null = null;
    for (let i = 0; i < changed.length; i += 10) {
      const res = await Promise.all(changed.slice(i, i + 10).map(({ v, n }) => sb().from("vendors").update({ sort_order: n }).eq("id", v.id!)));
      failed = res.find((r) => r.error)?.error?.message || failed;
    }
    setSaving(false);
    if (failed) { toast(failed, "err"); reload(); return; }
    revalidateSite();
    toast("Vendor order saved");
  };

  // While dragging, follow the pointer on the whole window (works for mouse and touch).
  const saveRef = useRef(saveOrder);
  saveRef.current = saveOrder;
  useEffect(() => {
    if (!dragId) return;
    const move = (e: PointerEvent) => {
      if (e.clientY < 70) window.scrollBy(0, -14);
      else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
      const over = (document.elementFromPoint(e.clientX, e.clientY)?.closest("tr[data-id]") as HTMLElement | null)?.dataset.id;
      if (over && over !== dragId) moveTo(dragId, over);
    };
    const up = () => { setDragId(null); if (latest.current) saveRef.current(latest.current); };
    const cancel = () => { setDragId(null); if (before.current) setData(before.current); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      document.body.style.userSelect = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragId]);

  if (error) return <DbError error={error} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-ink sm:text-[36px]">Vendors & coupons</h1>
          <p className="text-muted">{data?.length ?? "…"} vendors · each has its own page at /coupons/slug</p>
        </div>
        <Link href="/admin/vendors/new" className="btn btn-primary btn-sm">+ Add vendor</Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <input className="adm-input max-w-xs" placeholder="Search name or code…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="adm-input max-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option><option value="featured">Featured</option><option value="live">Published (ON)</option><option value="hidden">Unpublished (OFF)</option>
        </select>
        {saving && <span className="self-center text-[13px] text-muted">Saving order…</span>}
      </div>
      <div className="overflow-x-auto rounded-[24px] border border-line bg-white">
        <table className="w-full min-w-[760px] text-[14px]">
          <thead className="bg-stone text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">
            <tr>
              <th className="w-10 py-3 pl-3"><span className="sr-only">Drag to reorder</span></th>
              <th className="px-3 py-3">Vendor</th><th className="px-3 py-3">Code</th><th className="px-3 py-3">Discount</th><th className="px-3 py-3">Verified</th>
              <th className="px-3 py-3 text-center">Featured</th><th className="px-3 py-3 text-center">Published</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-6 text-center text-muted">Loading…</td></tr>}
            {rows.map((v, i) => (
              <tr
                key={v.id}
                data-id={v.id}
                className={`border-t border-line transition-colors ${dragId === v.id ? "relative z-10 bg-sky/40 shadow-[0_10px_30px_-12px_rgb(8_30_76/0.45)]" : "hover:bg-bone/50"} ${!v.published ? "opacity-60" : ""}`}
              >
                <td className="py-2.5 pl-3">
                  <button
                    type="button"
                    aria-label={`Drag to reorder ${v.name} (or use arrow keys)`}
                    title={canDrag ? "Drag to reorder" : "Clear search and filter to reorder"}
                    disabled={!canDrag}
                    className={`flex h-8 w-8 touch-none items-center justify-center rounded-lg text-[#9aa3b5] transition ${canDrag ? "cursor-grab hover:bg-stone hover:text-ink active:cursor-grabbing" : "cursor-not-allowed opacity-40"}`}
                    onPointerDown={(e) => {
                      if (!canDrag || !v.id || e.button > 0) return;
                      e.preventDefault();
                      before.current = data;
                      setDragId(v.id);
                    }}
                    onKeyDown={(e) => {
                      if (!canDrag || !data || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
                      e.preventDefault();
                      const j = i + (e.key === "ArrowUp" ? -1 : 1);
                      if (j < 0 || j >= data.length) return;
                      const list = [...data];
                      [list[i], list[j]] = [list[j], list[i]];
                      saveOrder(list);
                    }}
                  >
                    <Grip />
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <Link href={`/admin/vendors/${v.id}`} className="flex items-center gap-2.5 font-semibold text-ink hover:text-navy">
                    <span className="w-6 shrink-0 text-right font-mono text-[11.5px] font-normal text-[#9aa3b5]">{(data?.indexOf(v) ?? i) + 1}</span>
                    <VendorLogo name={v.name} src={v.logo_url} size={32} />{v.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 font-mono text-[13px] text-[#17733a]">{v.code || "None"}</td>
                <td className="px-3 py-2.5 font-semibold text-sale">{v.discount_label}</td>
                <td className="px-3 py-2.5">
                  <button title="Mark verified today" onClick={() => patch(v, { verified_at: today() })} className="rounded-md px-1.5 py-0.5 text-[13px] hover:bg-green-50">{v.verified_at} ✓</button>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    type="button"
                    aria-pressed={!!v.featured}
                    aria-label={v.featured ? `Unfeature ${v.name}` : `Feature ${v.name}`}
                    title={v.featured ? "Featured. Click to remove" : "Click to feature"}
                    onClick={() => patch(v, { featured: !v.featured })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition hover:scale-110 hover:bg-gold-50 active:scale-95"
                  >
                    <Star3D on={!!v.featured} />
                  </button>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <OnOff
                    on={!!v.published}
                    label={`${v.name} published`}
                    onChange={(on) => { patch(v, { published: on }); toast(on ? `${v.name} is now live on the website` : `${v.name} is hidden. Its page redirects to /coupons`); }}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  <Link href={`/admin/vendors/${v.id}`} className="font-semibold text-navy hover:underline">Edit</Link>
                  <a href={`/coupons/${v.slug}`} target="_blank" className="ml-3 text-muted hover:text-ink">View ↗</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="adm-help">
        Drag the <span className="inline-block align-middle text-ink"><Grip /></span> handle to change a vendor&apos;s position (or focus it and use the ↑ ↓ keys). The website lists vendors in this order.
        Reordering is available when search and filter are cleared. Click a verified date to mark it verified today.
      </p>
    </div>
  );
}
