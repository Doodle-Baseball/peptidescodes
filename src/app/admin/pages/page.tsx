"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PageContent, Post, Vendor } from "@/lib/types";
import { vendorMetaDescription, vendorMetaTitle } from "@/lib/vendor-content";
import { DbError, OnOff, SeoPanel, revalidateSite, sb, useLoad, useToast, type SeoValue } from "../_lib/ui";

const PATHS: Record<string, string> = { home: "/", coupons: "/coupons", vendors: "/vendors", guides: "/guides", extension: "/extension", contact: "/contact" };
const pagePath = (slug: string) => PATHS[slug] || `/${slug}`;

type Kind = "page" | "vendor" | "guide";
const TABLE: Record<Kind, "pages" | "vendors" | "posts"> = { page: "pages", vendor: "vendors", guide: "posts" };
const SEO_KEYS = ["meta_title", "meta_description", "keywords", "canonical_url", "og_image", "noindex"] as const;

type Row = SeoValue & {
  kind: Kind;
  key: string; // slug for pages, id for vendors/guides
  title: string;
  path: string;
  published: boolean;
  editHref: string;
  fallbackTitle: string;
  fallbackDesc: string;
};
type Loaded = { pages: PageContent[]; vendors: Vendor[]; posts: Post[] };

const pick = (x: SeoValue) => Object.fromEntries(SEO_KEYS.map((k) => [k, x[k] ?? null])) as SeoValue;

function toRows(d: Loaded): Record<Kind, Row[]> {
  return {
    page: d.pages.map((p) => ({
      ...pick(p), kind: "page" as const, key: p.slug, title: p.title, path: pagePath(p.slug), published: p.published !== false,
      editHref: `/admin/pages/${p.slug}`, fallbackTitle: p.title, fallbackDesc: p.subtitle || "",
    })).sort((a, b) => (a.key === "home" ? -1 : b.key === "home" ? 1 : a.title.localeCompare(b.title))),
    vendor: d.vendors.map((v) => ({
      ...pick(v), kind: "vendor" as const, key: v.id!, title: v.name, path: `/coupons/${v.slug}`, published: !!v.published,
      editHref: `/admin/vendors/${v.id}`, fallbackTitle: vendorMetaTitle(v), fallbackDesc: vendorMetaDescription(v),
    })),
    guide: d.posts.map((p) => ({
      ...pick(p), kind: "guide" as const, key: p.id!, title: p.title, path: `/guides/${p.slug}`, published: !!p.published,
      editHref: `/admin/guides/${p.id}`, fallbackTitle: p.title, fallbackDesc: p.excerpt || "",
    })),
  };
}

const MIGRATION_HINT = "Page status needs a one-time database update: run supabase/migration-2026-11-16.sql in the Supabase SQL Editor.";

function IndexPill({ noindex, onToggle }: { noindex: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={noindex ? "Hidden from search engines. Click to allow indexing" : "Search engines can index this page. Click to add noindex"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold ring-1 transition hover:brightness-95 ${
        noindex ? "bg-[#fdecec] text-[#c81e1e] ring-[#f5c2c2]" : "bg-[#e7f6ec] text-[#15803d] ring-[#bbe5c8]"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${noindex ? "bg-[#dc2626]" : "bg-[#16a34a]"}`} />
      {noindex ? "noindex" : "index"}
      <span aria-hidden className="text-[11px] opacity-60">⇄</span>
    </button>
  );
}

function SeoDrawer({ row, onClose, onSaved }: { row: Row; onClose: () => void; onSaved: (patch: SeoValue) => void }) {
  const [value, setValue] = useState<SeoValue>(pick(row));
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const save = async () => {
    setBusy(true);
    const patch = Object.fromEntries(SEO_KEYS.map((k) => [k, k === "noindex" ? !!value.noindex : (typeof value[k] === "string" ? (value[k] as string).trim() : value[k]) || null]));
    const q = sb().from(TABLE[row.kind]).update(patch);
    const { error } = await (row.kind === "page" ? q.eq("slug", row.key) : q.eq("id", row.key));
    setBusy(false);
    if (error) return toast(error.message, "err");
    onSaved(patch as SeoValue);
    revalidateSite();
    toast("SEO saved");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true" aria-label={`SEO for ${row.title}`}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-[620px] flex-col bg-bone shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line bg-white px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">Edit SEO</div>
            <div className="truncate text-[18px] font-semibold text-ink">{row.title}</div>
            <div className="truncate font-mono text-[12px] text-muted">{row.path}</div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-line bg-white px-3 py-1.5 text-[14px] hover:bg-stone" aria-label="Close">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <SeoPanel value={value} onChange={(p) => setValue((v) => ({ ...v, ...p }))} path={row.path} fallbackTitle={row.fallbackTitle} fallbackDesc={row.fallbackDesc} />
          <p className="adm-help mt-3">Headings, content and FAQs are edited on the <Link href={row.editHref} className="font-semibold text-navy">full editor</Link>.</p>
        </div>
        <div className="flex items-center gap-3 border-t border-line bg-white px-5 py-3 sm:px-7">
          <button disabled={busy} onClick={save} className="btn btn-primary">{busy ? "Saving…" : "Save SEO"}</button>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function PagesAdmin() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad<Loaded>(async () => {
    const [p, v, g] = await Promise.all([
      sb().from("pages").select("*").order("slug"),
      sb().from("vendors").select("*").order("sort_order").order("name"),
      sb().from("posts").select("*").order("published_at", { ascending: false }),
    ]);
    const err = p.error || v.error || g.error;
    return { data: err ? null : { pages: p.data || [], vendors: v.data || [], posts: g.data || [] }, error: err };
  });
  const [rows, setRows] = useState<Record<Kind, Row[]>>({ page: [], vendor: [], guide: [] });
  useEffect(() => { if (data) setRows(toRows(data)); }, [data]);
  const [tab, setTab] = useState<Kind>("page");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows[tab].filter((r) => !s || r.title.toLowerCase().includes(s) || r.path.toLowerCase().includes(s));
  }, [rows, tab, q]);
  const all = [...rows.page, ...rows.vendor, ...rows.guide];
  const noindexCount = all.filter((r) => r.noindex).length;

  const local = (r: Row, patch: Partial<Row>) =>
    setRows((d) => ({ ...d, [r.kind]: d[r.kind].map((x) => (x.key === r.key ? { ...x, ...patch } : x)) }));

  const update = async (r: Row, patch: Record<string, unknown>, ok: string) => {
    local(r, patch as Partial<Row>);
    const q = sb().from(TABLE[r.kind]).update(patch);
    const { error } = await (r.kind === "page" ? q.eq("slug", r.key) : q.eq("id", r.key));
    if (error) {
      toast(/published/.test(error.message) && r.kind === "page" ? MIGRATION_HINT : error.message, "err");
      local(r, Object.fromEntries(Object.keys(patch).map((k) => [k, (r as unknown as Record<string, unknown>)[k]])) as Partial<Row>);
      return;
    }
    revalidateSite();
    toast(ok);
  };

  if (error) return <DbError error={error} />;

  const tabs: [Kind, string][] = [["page", "Site pages"], ["vendor", "Vendor pages"], ["guide", "Guides"]];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-ink sm:text-[36px]">Pages & SEO</h1>
          <p className="text-muted">Switch indexing, change status and edit the SEO of any page on the website.</p>
        </div>
        <Link href="/admin/pages/new" className="btn btn-primary btn-sm">+ New page</Link>
      </div>

      <section className="rounded-[24px] border border-line bg-white p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-ink">Search engine indexing</h2>
        <p className="mt-1 text-[13.5px] text-muted">
          <span className="font-semibold text-[#15803d]">{all.length - noindexCount} index</span> · <span className="font-semibold text-[#c81e1e]">{noindexCount} noindex</span> across {all.length} pages. Click the index / noindex tag on any row to switch it.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1 sm:w-auto" role="tablist">
          {tabs.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-[14px] font-semibold transition ${tab === k ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
              {l} <span className={`ml-1 text-[12px] ${tab === k ? "text-white/60" : "text-[#9aa3b5]"}`}>{rows[k].length}</span>
            </button>
          ))}
        </div>
        <input className="adm-input sm:max-w-xs" placeholder="Search pages…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-line bg-white">
        <table className="w-full min-w-[820px] text-[14px]">
          <thead className="bg-stone text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">
            <tr><th className="px-4 py-3">Page</th><th className="px-3 py-3">URL</th><th className="px-3 py-3">Indexing</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">SEO</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-6 text-center text-muted">Loading…</td></tr>}
            {!loading && list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted">No pages found.</td></tr>}
            {list.map((r) => {
              const isHome = r.kind === "page" && r.key === "home";
              const custom = !!(r.meta_title || r.meta_description);
              return (
                <tr key={`${r.kind}-${r.key}`} className={`border-t border-line hover:bg-bone/50 ${r.published ? "" : "bg-stone/40"}`}>
                  <td className="max-w-[300px] px-4 py-3"><Link href={r.editHref} className="block truncate font-semibold text-ink hover:text-navy">{r.title}</Link></td>
                  <td className="max-w-[240px] truncate px-3 py-3 font-mono text-[12.5px] text-muted">{r.path}</td>
                  <td className="px-3 py-3"><IndexPill noindex={!!r.noindex} onToggle={() => update(r, { noindex: !r.noindex }, !r.noindex ? `${r.title}: noindex added` : `${r.title}: now indexable`)} /></td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2.5">
                      <OnOff
                        on={r.published}
                        disabled={isHome}
                        label={`${r.title} status`}
                        title={isHome ? "The homepage is always live" : r.published ? "Published. Click to set as draft (hidden)" : "Draft (hidden). Click to publish"}
                        onChange={(on) => update(r, { published: on }, on ? `${r.title} is published` : `${r.title} is now a hidden draft`)}
                      />
                      <span className={`text-[12.5px] font-semibold ${r.published ? "text-[#15803d]" : "text-muted"}`}>{r.published ? "Published" : "Draft"}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => setEditing(r)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-stone">
                      <span className={`h-2 w-2 rounded-full ${custom ? "bg-green" : "bg-gold"}`} title={custom ? "Custom meta tags" : "Automatic meta tags"} />
                      Edit SEO
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={r.editHref} className="font-semibold text-navy">Edit</Link>
                    <a href={r.path} target="_blank" className="ml-3 text-muted hover:text-ink">View ↗</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="adm-help">
        <span className="font-semibold text-[#15803d]">index</span> = search engines may show the page. <span className="font-semibold text-[#c81e1e]">noindex</span> = hidden from search results (visitors can still open it).
        Draft pages are hidden from the website. Draft vendors redirect to /coupons. SEO dot: <span className="text-green">●</span> custom meta tags, <span className="text-gold">●</span> automatic.
      </p>

      {editing && <SeoDrawer row={editing} onClose={() => setEditing(null)} onSaved={(p) => local(editing, p as Partial<Row>)} />}
    </div>
  );
}
