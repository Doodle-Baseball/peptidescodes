"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { Card, DbError, FaqEditor, Field, ImageInput, Input, SaveBar, SeoPanel, TextArea, Toggle, revalidateSite, sb, slugify, today, useToast } from "../../_lib/ui";

export default function GuideEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState<Post | null>(isNew ? { slug: "", title: "", excerpt: "", content: "", cover_image: "", author: "", published: true, published_at: today(), faqs: [], meta_title: "", meta_description: "", keywords: "", canonical_url: "", og_image: "", noindex: false } : null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [autoSlug, setAutoSlug] = useState(isNew);

  useEffect(() => {
    if (isNew) return;
    sb().from("posts").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) setErr(error.message);
      else if (!data) setErr("Guide not found");
      else setP(data as Post);
    });
  }, [id, isNew]);

  if (err) return <DbError error={err} />;
  if (!p) return <p className="text-muted">Loading…</p>;
  const set = (x: Partial<Post>) => { setP((o) => ({ ...o!, ...x })); setDirty(true); };

  const save = async () => {
    if (!p.title.trim()) return toast("Title is required", "err");
    const slug = slugify(p.slug || p.title);
    setBusy(true);
    const { id: _i, updated_at: _u, ...rest } = p as Post & { created_at?: string };
    delete (rest as { created_at?: string }).created_at;
    const payload = { ...rest, slug };
    const res = isNew ? await sb().from("posts").insert(payload).select("id").single() : await sb().from("posts").update(payload).eq("id", id).select("id").single();
    setBusy(false);
    if (res.error) return toast(res.error.message.includes("duplicate") ? "That slug is already used" : res.error.message, "err");
    setDirty(false);
    await revalidateSite();
    toast("Saved, live site updated");
    if (isNew) router.replace(`/admin/guides/${res.data.id}`);
  };

  const remove = async () => {
    if (!confirm(`Delete “${p.title}”?`)) return;
    const { error } = await sb().from("posts").delete().eq("id", id);
    if (error) return toast(error.message, "err");
    await revalidateSite();
    router.replace("/admin/guides");
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/admin/guides" className="text-[14px] text-muted hover:text-ink">← Guides</Link>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-ink">{isNew ? "New guide" : p.title}</h1>
        {!isNew && <a href={`/guides/${p.slug}`} target="_blank" className="ml-auto text-[14px] font-semibold text-navy">View ↗</a>}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card title="Article">
            <div className="grid gap-4">
              <Field label="Title (H1) *"><Input value={p.title} onChange={(title) => set({ title, ...(autoSlug ? { slug: slugify(title) } : {}) })} /></Field>
              <Field label="Excerpt" help="Shown on cards and under the title."><TextArea rows={3} value={p.excerpt} onChange={(excerpt) => set({ excerpt })} /></Field>
              <Field label="Body (Markdown)" help="Use ## for section headings, **bold**, lists and [internal links](/coupons/amino-club).">
                <TextArea rows={22} value={p.content} onChange={(content) => set({ content })} className="font-mono text-[13px]" />
              </Field>
            </div>
          </Card>
          <Card title="Publishing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Publish date"><Input type="date" value={p.published_at} onChange={(published_at) => set({ published_at })} /></Field>
              <Field label="Author" help="Empty = default author from Settings"><Input value={p.author} onChange={(author) => set({ author })} /></Field>
              <Field label="Cover image" className="sm:col-span-2"><ImageInput value={p.cover_image} onChange={(cover_image) => set({ cover_image })} folder="guides" /></Field>
            </div>
            <div className="mt-4"><Toggle checked={p.published} onChange={(published) => set({ published })} label="Published (off = draft)" /></div>
          </Card>
        </div>
        <div className="space-y-5">
          <SeoPanel value={p} onChange={(x) => set(x as Partial<Post>)} slug={p.slug} onSlug={(slug) => { setAutoSlug(false); set({ slug }); }} path={`/guides/${p.slug || "…"}`} fallbackTitle={p.title} fallbackDesc={p.excerpt || ""} />
          <FaqEditor value={p.faqs} onChange={(faqs) => set({ faqs })} />
        </div>
      </div>
      <SaveBar busy={busy} dirty={dirty} onSave={save} onDelete={isNew ? undefined : remove} />
    </div>
  );
}
