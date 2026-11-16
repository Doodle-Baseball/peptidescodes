"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { PageContent } from "@/lib/types";
import { Card, DbError, FaqEditor, Field, Input, SaveBar, SeoPanel, TextArea, revalidateSite, sb, slugify, useToast } from "../../_lib/ui";

const BUILT_IN = new Set(["home", "coupons", "vendors", "guides", "extension", "contact", "about", "affiliate-disclosure", "privacy-policy", "terms"]);
const PATHS: Record<string, string> = { home: "/", coupons: "/coupons", vendors: "/vendors", guides: "/guides", extension: "/extension", contact: "/contact" };
const RESERVED = new Set(["admin", "api", "coupons", "vendors", "guides", "extension", "contact", "home", "sitemap.xml", "robots.txt"]);

export default function PageEdit() {
  const { slug } = useParams<{ slug: string }>();
  const isNew = slug === "new";
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState<PageContent | null>(isNew ? { slug: "", title: "", subtitle: "", content: "", faqs: [], meta_title: "", meta_description: "", keywords: "", canonical_url: "", og_image: "", noindex: false } : null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isNew) return;
    sb().from("pages").select("*").eq("slug", slug).maybeSingle().then(({ data, error }) => {
      if (error) setErr(error.message);
      else if (!data) setErr("Page not found");
      else setP(data as PageContent);
    });
  }, [slug, isNew]);

  if (err) return <DbError error={err} />;
  if (!p) return <p className="text-muted">Loading…</p>;
  const set = (x: Partial<PageContent>) => { setP((o) => ({ ...o!, ...x })); setDirty(true); };
  const path = PATHS[p.slug] || `/${p.slug || "…"}`;

  const save = async () => {
    if (!p.title.trim()) return toast("Title is required", "err");
    const s = slugify(p.slug || p.title);
    if (isNew && RESERVED.has(s)) return toast("That URL is reserved, choose another slug", "err");
    setBusy(true);
    const { updated_at: _u, ...rest } = p as PageContent & { created_at?: string };
    delete (rest as { created_at?: string }).created_at;
    const res = isNew ? await sb().from("pages").insert({ ...rest, slug: s }) : await sb().from("pages").update(rest).eq("slug", slug);
    setBusy(false);
    if (res.error) return toast(res.error.message.includes("duplicate") ? "A page with that slug already exists" : res.error.message, "err");
    setDirty(false);
    await revalidateSite();
    toast("Saved, live site updated");
    if (isNew) router.replace(`/admin/pages/${s}`);
  };

  const remove = async () => {
    if (!confirm(`Delete page “${p.title}”?`)) return;
    const { error } = await sb().from("pages").delete().eq("slug", slug);
    if (error) return toast(error.message, "err");
    await revalidateSite();
    router.replace("/admin/pages");
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/admin/pages" className="text-[14px] text-muted hover:text-ink">← Pages</Link>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-ink">{isNew ? "New page" : p.title}</h1>
        {!isNew && <a href={path} target="_blank" className="ml-auto text-[14px] font-semibold text-navy">View page ↗</a>}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card title="Content">
            <div className="grid gap-4">
              <Field label="H1 title *"><Input value={p.title} onChange={(title) => set({ title, ...(isNew ? { slug: slugify(title) } : {}) })} /></Field>
              <Field label="Subtitle / intro"><TextArea rows={3} value={p.subtitle} onChange={(subtitle) => set({ subtitle })} /></Field>
              <Field label="Body (Markdown)" help="Supports ## headings, **bold**, - lists, 1. numbered lists, [links](/coupons) and > quotes.">
                <TextArea rows={18} value={p.content} onChange={(content) => set({ content })} className="font-mono text-[13px]" />
              </Field>
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <SeoPanel
            value={p}
            onChange={(x) => set(x as Partial<PageContent>)}
            path={path}
            slug={p.slug}
            onSlug={isNew ? (s) => set({ slug: s }) : undefined}
            fallbackTitle={p.title}
            fallbackDesc={p.subtitle || ""}
          />
          <FaqEditor value={p.faqs} onChange={(faqs) => set({ faqs })} hint="FAQs show on the page and are added as FAQPage structured data." />
        </div>
      </div>
      <SaveBar busy={busy} dirty={dirty} onSave={save} onDelete={isNew || BUILT_IN.has(slug) ? undefined : remove} />
    </div>
  );
}
