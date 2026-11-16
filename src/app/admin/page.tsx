"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, DbError, revalidateSite, sb, today, useToast } from "./_lib/ui";

type Stats = { vendors: number; active: number; messages: number; unread: number; subscribers: number; clicks30: number; top: [string, number][] };

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();

  const load = async () => {
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const [v, a, m, u, sub, clicks] = await Promise.all([
      sb().from("vendors").select("id", { count: "exact", head: true }),
      sb().from("vendors").select("id", { count: "exact", head: true }).eq("coupon_active", true),
      sb().from("messages").select("id", { count: "exact", head: true }),
      sb().from("messages").select("id", { count: "exact", head: true }).eq("read", false),
      sb().from("subscribers").select("id", { count: "exact", head: true }),
      sb().from("click_events").select("vendor_slug").gte("created_at", since).limit(10000),
    ]);
    if (v.error) return setErr(v.error.message);
    const counts = new Map<string, number>();
    (clicks.data || []).forEach((c: { vendor_slug: string }) => counts.set(c.vendor_slug, (counts.get(c.vendor_slug) || 0) + 1));
    setS({
      vendors: v.count || 0, active: a.count || 0, messages: m.count || 0, unread: u.count || 0, subscribers: sub.count || 0,
      clicks30: clicks.data?.length || 0, top: Array.from(counts.entries()).sort((x, y) => y[1] - x[1]).slice(0, 10),
    });
  };
  useEffect(() => { load(); }, []);

  if (err) return <DbError error={err} />;

  const tiles: [string, number | string, string][] = s
    ? [["Vendors", s.vendors, "/admin/vendors"], ["Active codes", s.active, "/admin/vendors"], ["Unread messages", s.unread, "/admin/inbox"], ["Subscribers", s.subscribers, "/admin/inbox"]]
    : [];
  const max = s?.top[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-semibold tracking-[-0.045em] text-ink">Dashboard</h1>
          <p className="text-muted">Manage coupons, pages, SEO and site settings.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/vendors/new" className="btn btn-primary btn-sm">+ Add vendor</Link>
          <Link href="/admin/guides/new" className="btn btn-ghost btn-sm">+ New guide</Link>
          <Link href="/admin/pages/new" className="btn btn-ghost btn-sm">+ New page</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(s ? tiles : Array(4).fill(["…", "…", "#"])).map(([l, n, h]: [string, number | string, string], i: number) => (
          <Link key={i} href={h} className="rounded-[22px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a8a]">{l}</div>
            <div className="mt-2 text-[40px] font-medium leading-none tracking-[-0.045em] text-ink">{n}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Most clicked deals (last 30 days)">
          {s && s.top.length === 0 && <p className="text-[14px] text-muted">No clicks recorded yet. Clicks on Copy and Get deal buttons appear here.</p>}
          <ul className="space-y-2.5">
            {s?.top.map(([slug, n]) => (
              <li key={slug} className="text-[14px]">
                <div className="flex justify-between"><Link href={`/coupons/${slug}`} target="_blank" className="font-semibold text-ink hover:text-navy">{slug}</Link><span className="font-mono text-muted">{n}</span></div>
                <div className="mt-1 h-2 rounded-full bg-bone"><div className="h-2 rounded-full bg-gradient-to-r from-[#0b3d80] to-ink" style={{ width: `${(n / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Quick actions">
          <div className="space-y-3">
            <button
              className="btn btn-ghost w-full justify-start"
              onClick={async () => {
                if (!confirm("Set the verified date of every ACTIVE coupon to today?")) return;
                const { error } = await sb().from("vendors").update({ verified_at: today() }).eq("coupon_active", true);
                if (error) return toast(error.message, "err");
                await revalidateSite();
                toast("All active codes marked verified today");
              }}
            >✓ Mark all active codes verified today</button>
            <button className="btn btn-ghost w-full justify-start" onClick={async () => toast((await revalidateSite()) ? "Live site refreshed" : "Refresh failed", "ok")}>↻ Refresh live website cache</button>
            <Link href="/admin/settings" className="btn btn-ghost w-full justify-start">⚙ Edit publisher, author & contact info</Link>
            <a href="/sitemap.xml" target="_blank" className="btn btn-ghost w-full justify-start">🗺 View sitemap.xml</a>
          </div>
          <p className="adm-help mt-4">Saving anything in the admin refreshes the live site automatically.</p>
        </Card>
      </div>
    </div>
  );
}
