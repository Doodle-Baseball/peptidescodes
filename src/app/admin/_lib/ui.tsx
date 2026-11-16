"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { browserClient } from "@/lib/supabase";
import type { Faq } from "@/lib/types";

export const sb = () => browserClient();

/** Purge the public site's cache so edits appear immediately. */
export async function revalidateSite() {
  const { data } = await sb().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return false;
  const r = await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  return r.ok;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "-and-").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------------- Session ---------------- */
type Ctx = { session: Session | null };
export const SessionCtx = createContext<Ctx>({ session: null });
export const useSession = () => useContext(SessionCtx).session;

/* ---------------- Toasts ---------------- */
type Toast = { id: number; text: string; kind: "ok" | "err" };
const ToastCtx = createContext<(text: string, kind?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`animate-pop rounded-xl px-4 py-3 text-[14px] font-semibold text-white shadow-lg ${t.kind === "ok" ? "bg-green" : "bg-sale"}`}>{t.text}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- Form primitives ---------------- */
export function Field({ label, help, children, className = "" }: { label: string; help?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="adm-label">{label}</label>
      {children}
      {help && <p className="adm-help">{help}</p>}
    </div>
  );
}

export function Input({ value, onChange, ...rest }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & { value: string | number | null | undefined; onChange: (v: string) => void }) {
  return <input {...rest} className={`adm-input ${rest.className || ""}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

export function TextArea({ value, onChange, rows = 4, ...rest }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & { value: string | null | undefined; onChange: (v: string) => void }) {
  return <textarea {...rest} rows={rows} className={`adm-input font-[inherit] ${rest.className || ""}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5 text-[14px] font-medium text-ink">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-green" : "bg-[#cfd5e2]"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
      {label}
    </label>
  );
}

/** ON/OFF pill switch. */
export function OnOff({ on, onChange, label, title, disabled, onText = "ON", offText = "OFF" }: { on: boolean; onChange: (v: boolean) => void; label: string; title?: string; disabled?: boolean; onText?: string; offText?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={title ?? (on ? "Live on the website. Click to turn OFF" : "Hidden from the website. Click to turn ON")}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-7 w-[62px] shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${on ? "bg-green" : "bg-[#cfd5e2]"}`}
    >
      <span className={`absolute text-[10.5px] font-bold tracking-[0.08em] ${on ? "left-2.5 text-white" : "right-2 text-[#5b6478]"}`}>{on ? onText : offText}</span>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[38px]" : "left-1"}`} />
    </button>
  );
}

export function Card({ title, children, actions, className = "" }: { title?: string; children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[24px] border border-line bg-white p-5 sm:p-7 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`ml-2 font-mono text-[11px] ${n > max ? "text-sale" : n > max * 0.85 ? "text-gold" : "text-muted"}`}>{n}/{max}</span>;
}

export type SeoValue = { meta_title?: string | null; meta_description?: string | null; keywords?: string | null; canonical_url?: string | null; og_image?: string | null; noindex?: boolean | null };

export function SeoPanel({ value, onChange, fallbackTitle, fallbackDesc, path, siteUrl = "https://peptidescodes.com", slug, onSlug }: {
  value: SeoValue; onChange: (patch: SeoValue) => void; fallbackTitle: string; fallbackDesc: string; path: string; siteUrl?: string; slug?: string; onSlug?: (s: string) => void;
}) {
  const title = value.meta_title || fallbackTitle;
  const desc = value.meta_description || fallbackDesc;
  return (
    <Card title="SEO">
      <div className="mb-5 rounded-2xl border border-line bg-stone p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted">Google preview</div>
        <div className="mt-2 truncate text-[13px] text-[#4d5156]">{(value.canonical_url || `${siteUrl}${path}`).replace(/^https?:\/\//, "")}</div>
        <div className="truncate text-[19px] leading-snug text-[#1a0dab]">{title}</div>
        <div className="line-clamp-2 text-[13.5px] text-[#4d5156]">{desc}</div>
      </div>
      <div className="grid gap-4">
        {onSlug !== undefined && (
          <Field label="Slug (URL)" help={<>Page URL: <code>{path.replace(/[^/]+$/, "")}{slug || "…"}</code>. Changing it changes the URL, old links will 404.</>}>
            <Input value={slug} onChange={(v) => onSlug(slugify(v))} />
          </Field>
        )}
        <Field label="Meta title" help={<>Leave empty to use the automatic title.<Counter n={(value.meta_title || "").length} max={60} /></>}>
          <Input value={value.meta_title} onChange={(v) => onChange({ meta_title: v })} placeholder={fallbackTitle} />
        </Field>
        <Field label="Meta description" help={<>Leave empty to use the automatic description.<Counter n={(value.meta_description || "").length} max={160} /></>}>
          <TextArea rows={3} value={value.meta_description} onChange={(v) => onChange({ meta_description: v })} placeholder={fallbackDesc} />
        </Field>
        <Field label="Keywords" help="Comma separated, e.g. peptide coupon code, peptide discount">
          <Input value={value.keywords} onChange={(v) => onChange({ keywords: v })} />
        </Field>
        <Field label="Canonical URL" help="Leave empty to use this page's own URL (recommended).">
          <Input value={value.canonical_url} onChange={(v) => onChange({ canonical_url: v })} placeholder={`${siteUrl}${path}`} />
        </Field>
        <Field label="Social share image (Open Graph)" help="Leave empty to auto-generate a branded image.">
          <ImageInput value={value.og_image} onChange={(v) => onChange({ og_image: v })} folder="og" />
        </Field>
        <Toggle checked={!!value.noindex} onChange={(v) => onChange({ noindex: v })} label="Hide from search engines (noindex)" />
      </div>
    </Card>
  );
}

export function ImageInput({ value, onChange, folder = "uploads" }: { value: string | null | undefined; onChange: (v: string) => void; folder?: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-line bg-white object-contain" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-[11px] text-muted">none</span>
      )}
      <Input value={value} onChange={onChange} placeholder="https://… or upload" />
      <label className="btn btn-ghost btn-sm shrink-0 cursor-pointer">
        {busy ? "Uploading…" : "Upload"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            const ext = (f.name.split(".").pop() || "png").toLowerCase();
            const key = `${folder}/${Date.now()}-${slugify(f.name.replace(/\.[^.]+$/, "")) || "image"}.${ext}`;
            const { error } = await sb().storage.from("media").upload(key, f, { cacheControl: "31536000", upsert: false });
            setBusy(false);
            if (error) return toast(`Upload failed: ${error.message}`, "err");
            onChange(sb().storage.from("media").getPublicUrl(key).data.publicUrl);
            toast("Image uploaded");
          }}
        />
      </label>
    </div>
  );
}

export function FaqEditor({ value, onChange, hint }: { value: Faq[] | null | undefined; onChange: (v: Faq[]) => void; hint?: string }) {
  const faqs = value || [];
  const set = (i: number, patch: Partial<Faq>) => onChange(faqs.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= faqs.length) return;
    const next = [...faqs];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <Card title={`FAQs (${faqs.length})`} actions={<button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...faqs, { q: "", a: "" }])}>+ Add FAQ</button>}>
      {hint && <p className="adm-help -mt-2 mb-4">{hint}</p>}
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-2xl border border-line bg-stone p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-bold text-muted">Question {i + 1}</span>
              <span className="flex gap-1">
                <button type="button" className="rounded px-2 py-1 text-[12px] hover:bg-white" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button type="button" className="rounded px-2 py-1 text-[12px] hover:bg-white" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                <button type="button" className="rounded px-2 py-1 text-[12px] text-sale hover:bg-white" onClick={() => onChange(faqs.filter((_, j) => j !== i))}>Delete</button>
              </span>
            </div>
            <Input value={f.q} onChange={(v) => set(i, { q: v })} placeholder="Question" />
            <TextArea className="mt-2" rows={3} value={f.a} onChange={(v) => set(i, { a: v })} placeholder="Answer" />
          </div>
        ))}
        {faqs.length === 0 && <p className="text-[14px] text-muted">No FAQs yet.</p>}
      </div>
    </Card>
  );
}

/** Small hook: load once, with error string when the DB isn't set up. */
export function useLoad<T>(fn: () => PromiseLike<{ data: unknown; error: { message: string } | null }>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    const r = await fn();
    setData(r.data as T | null);
    setError(r.error?.message || null);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload, setData };
}

export function DbError({ error }: { error: string }) {
  const missing = /relation|does not exist|schema cache|Could not find/i.test(error);
  return (
    <div className="rounded-2xl border border-gold/50 bg-gold-50 p-5 text-[14.5px] text-[#6b4d00]">
      {missing ? (
        <>
          <b>Database not set up yet.</b> Open your Supabase project → <b>SQL Editor</b>, paste the contents of <code>supabase/setup.sql</code> from the project folder and press <b>Run</b>. Then reload this page.
        </>
      ) : (
        <><b>Database error:</b> {error}</>
      )}
    </div>
  );
}

export function SaveBar({ busy, onSave, onDelete, dirty, extra }: { busy: boolean; onSave: () => void; onDelete?: () => void; dirty?: boolean; extra?: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center gap-3 rounded-t-[22px] border border-line glass-light px-4 py-3 sm:-mx-8 sm:px-8">
      <button type="button" disabled={busy} onClick={onSave} className="btn btn-primary">{busy ? "Saving…" : "Save & publish"}</button>
      {extra}
      {dirty && <span className="text-[13px] text-gold">Unsaved changes</span>}
      {onDelete && <button type="button" onClick={onDelete} className="btn btn-ghost ml-auto !text-sale">Delete</button>}
    </div>
  );
}
