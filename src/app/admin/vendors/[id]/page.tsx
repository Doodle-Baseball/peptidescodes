"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Vendor } from "@/lib/types";
import { Card, DbError, FaqEditor, Field, ImageInput, Input, SaveBar, SeoPanel, TextArea, Toggle, revalidateSite, sb, slugify, today, useToast } from "../../_lib/ui";

const EMPTY: Vendor = {
  slug: "", name: "", headline: "", logo_url: "", website_url: "", affiliate_url: "", code: "", discount_percent: 10, discount_label: "10% Off",
  applies_to: "Sitewide", coupon_active: true, featured: false, sort_order: 100, verified_at: today(), short_description: "", about: "",
  country: "United States", founded: null, compounds: null, coa_count: null, testing_lab: "", shipping_info: "", payment_methods: "",
  open_to: "", combinable: "", min_order: "", expiry: "", faqs: [], meta_title: "", meta_description: "", keywords: "", canonical_url: "",
  og_image: "", noindex: false, published: true,
};

export default function VendorEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState<Vendor | null>(isNew ? EMPTY : null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [autoSlug, setAutoSlug] = useState(isNew);

  useEffect(() => {
    if (isNew) return;
    sb().from("vendors").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) setErr(error.message);
      else if (!data) setErr("Vendor not found");
      else setV(data as Vendor);
    });
  }, [id, isNew]);

  if (err) return <DbError error={err} />;
  if (!v) return <p className="text-muted">Loading…</p>;

  const set = (p: Partial<Vendor>) => { setV((x) => ({ ...x!, ...p })); setDirty(true); };
  const num = (s: string) => (s.trim() === "" ? null : Number(s));

  const save = async () => {
    if (!v.name.trim()) return toast("Name is required", "err");
    const slug = slugify(v.slug || v.name);
    if (!slug) return toast("Slug is required", "err");
    setBusy(true);
    const { id: _id, updated_at: _u, ...rest } = v as Vendor & { created_at?: string };
    delete (rest as { created_at?: string }).created_at;
    const payload = { ...rest, slug, discount_label: v.discount_label?.trim() || `${v.discount_percent}% Off` };
    const res = isNew
      ? await sb().from("vendors").insert(payload).select("id").single()
      : await sb().from("vendors").update(payload).eq("id", id).select("id").single();
    setBusy(false);
    if (res.error) return toast(res.error.message.includes("duplicate") ? "That slug is already used by another vendor" : res.error.message, "err");
    setDirty(false);
    await revalidateSite();
    toast("Saved, live site updated");
    if (isNew) router.replace(`/admin/vendors/${res.data.id}`);
  };

  const remove = async () => {
    if (!confirm(`Delete ${v.name}? This removes its coupon page.`)) return;
    const { error } = await sb().from("vendors").delete().eq("id", id);
    if (error) return toast(error.message, "err");
    await revalidateSite();
    toast("Vendor deleted");
    router.replace("/admin/vendors");
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/admin/vendors" className="text-[14px] text-muted hover:text-ink">← Vendors</Link>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-ink">{isNew ? "Add vendor" : v.name}</h1>
        {!isNew && <a href={`/coupons/${v.slug}`} target="_blank" className="ml-auto text-[14px] font-semibold text-navy">View page ↗</a>}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card title="Vendor">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name *"><Input value={v.name} onChange={(name) => set({ name, ...(autoSlug ? { slug: slugify(name) } : {}) })} /></Field>
              <Field label="Logo" className="sm:col-span-2"><ImageInput value={v.logo_url} onChange={(logo_url) => set({ logo_url })} folder="logos" /></Field>
              <Field label="Affiliate link (Get deal / Visit buttons)" className="sm:col-span-2"><Input value={v.affiliate_url} onChange={(affiliate_url) => set({ affiliate_url })} placeholder="https://store.com/?ref=…" /></Field>
              <Field label="Website (plain URL)"><Input value={v.website_url} onChange={(website_url) => set({ website_url })} placeholder="https://store.com" /></Field>
              <Field label="Custom H1 headline" help="Optional. Default: “Name discount code: 20% Off”"><Input value={v.headline} onChange={(headline) => set({ headline })} /></Field>
            </div>
          </Card>

          <Card title="Coupon">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Coupon code"><Input value={v.code} onChange={(code) => set({ code: code.trim() })} className="font-mono" /></Field>
              <Field label="Discount %"><Input type="number" min={0} max={100} value={v.discount_percent} onChange={(s) => { const n = Number(s) || 0; set({ discount_percent: n, discount_label: `${n}% Off` }); }} /></Field>
              <Field label="Discount label" help="Shown on the site, e.g. “20% Off” or “$25 Off”"><Input value={v.discount_label} onChange={(discount_label) => set({ discount_label })} /></Field>
              <Field label="Applies to">
                <select className="adm-input" value={v.applies_to || "Sitewide"} onChange={(e) => set({ applies_to: e.target.value })}>
                  <option>Sitewide</option><option>Eligible products</option><option>First order</option><option>Selected products</option>
                </select>
              </Field>
              <Field label="Last verified"><div className="flex gap-2"><Input type="date" value={v.verified_at} onChange={(verified_at) => set({ verified_at })} /><button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={() => set({ verified_at: today() })}>Today</button></div></Field>
              <Field label="Display order" help="Lower = earlier"><Input type="number" value={v.sort_order} onChange={(s) => set({ sort_order: Number(s) || 0 })} /></Field>
              <Field label="Open to" help="e.g. New and returning customers"><Input value={v.open_to} onChange={(open_to) => set({ open_to })} placeholder="Not confirmed" /></Field>
              <Field label="Combinable" help="e.g. Not with sale items"><Input value={v.combinable} onChange={(combinable) => set({ combinable })} placeholder="Not confirmed" /></Field>
              <Field label="Minimum order"><Input value={v.min_order} onChange={(min_order) => set({ min_order })} placeholder="Not published" /></Field>
              <Field label="Expiry"><Input value={v.expiry} onChange={(expiry) => set({ expiry })} placeholder="None published" /></Field>
            </div>
            <div className="mt-5 flex flex-wrap gap-6">
              <Toggle checked={v.coupon_active} onChange={(coupon_active) => set({ coupon_active })} label="Code is active" />
              <Toggle checked={v.featured} onChange={(featured) => set({ featured })} label="Featured (hero + top deals)" />
              <Toggle checked={v.published} onChange={(published) => set({ published })} label="Published" />
            </div>
          </Card>

          <Card title="Content">
            <div className="grid gap-4">
              <Field label="Short description" help="1-2 sentences. Used in the About box, FAQs and listings."><TextArea rows={3} value={v.short_description} onChange={(short_description) => set({ short_description })} /></Field>
              <Field label="Long content (Markdown)" help="Optional extra SEO content shown on the vendor page. Supports ## headings, **bold**, lists and [links](/coupons)."><TextArea rows={10} value={v.about} onChange={(about) => set({ about })} className="font-mono text-[13px]" /></Field>
            </div>
          </Card>

          <Card title="Vendor facts">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Based in (country)"><Input value={v.country} onChange={(country) => set({ country })} /></Field>
              <Field label="Selling since (year)"><Input type="number" value={v.founded} onChange={(s) => set({ founded: num(s) })} /></Field>
              <Field label="Compounds listed"><Input type="number" value={v.compounds} onChange={(s) => set({ compounds: num(s) })} /></Field>
              <Field label="COA reports"><Input type="number" value={v.coa_count} onChange={(s) => set({ coa_count: num(s) })} /></Field>
              <Field label="Testing lab"><Input value={v.testing_lab} onChange={(testing_lab) => set({ testing_lab })} /></Field>
              <Field label="Payment options"><Input value={v.payment_methods} onChange={(payment_methods) => set({ payment_methods })} placeholder="Card, Cash App, Venmo" /></Field>
              <Field label="Shipping" className="sm:col-span-2"><Input value={v.shipping_info} onChange={(shipping_info) => set({ shipping_info })} placeholder="Ships from US, 2-3 day delivery" /></Field>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <SeoPanel
            value={v}
            onChange={(p) => set(p as Partial<Vendor>)}
            slug={v.slug}
            onSlug={(slug) => { setAutoSlug(false); set({ slug }); }}
            path={`/coupons/${v.slug || "…"}`}
            fallbackTitle={`${v.name || "Vendor"} Coupon Code: ${v.discount_percent}% Off | Verified`}
            fallbackDesc={`Use ${v.name || "Vendor"} coupon code ${v.code || "CODE"} for ${v.discount_percent}% off. Verified. Copy the promo code in one click.`}
          />
          <FaqEditor value={v.faqs} onChange={(faqs) => set({ faqs })} hint="Leave empty to use 6 automatic FAQs (promo code, first order, not working, legit, savings, legality)." />
        </div>
      </div>
      <SaveBar busy={busy} dirty={dirty} onSave={save} onDelete={isNew ? undefined : remove} />
    </div>
  );
}
