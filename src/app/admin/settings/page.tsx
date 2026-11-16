"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/types";
import { seedSettings } from "@/data/seed-data.mjs";
import { Card, DbError, Field, ImageInput, Input, SaveBar, TextArea, revalidateSite, sb, useToast } from "../_lib/ui";

export default function SettingsAdmin() {
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    sb().from("settings").select("data").eq("id", 1).maybeSingle().then(({ data, error }) => {
      if (error) return setErr(error.message);
      setS({ ...(seedSettings as Settings), ...((data?.data as Partial<Settings>) || {}) });
    });
  }, []);

  if (err) return <DbError error={err} />;
  if (!s) return <p className="text-muted">Loading…</p>;
  const set = (p: Partial<Settings>) => { setS((o) => ({ ...o!, ...p })); setDirty(true); };
  const F = (k: keyof Settings, label: string, help?: string, ph?: string) => (
    <Field label={label} help={help}><Input value={s[k]} onChange={(v) => set({ [k]: v } as Partial<Settings>)} placeholder={ph} /></Field>
  );

  const save = async () => {
    setBusy(true);
    const { error } = await sb().from("settings").upsert({ id: 1, data: s });
    setBusy(false);
    if (error) return toast(error.message, "err");
    setDirty(false);
    await revalidateSite();
    toast("Settings saved, live site updated");
  };

  return (
    <div>
      <h1 className="mb-1 text-[36px] font-semibold tracking-[-0.045em] text-ink">Site settings</h1>
      <p className="mb-6 text-muted">Global SEO defaults, language, publisher, author and contact details.</p>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Website">
          <div className="grid gap-4">
            {F("site_name", "Site name")}
            {F("tagline", "Tagline")}
            {F("site_url", "Site URL", "Used for canonical URLs, sitemap and structured data. No trailing slash.", "https://peptidescodes.com")}
            {F("lang", "Language (lang)", "BCP-47 code set on <html lang> and hreflang, e.g. en-US.", "en-US")}
            {F("announcement", "Top announcement bar", "Leave empty to hide the bar.")}
          </div>
        </Card>
        <Card title="Default SEO">
          <div className="grid gap-4">
            {F("default_meta_title", "Default meta title")}
            <Field label="Default meta description"><TextArea rows={3} value={s.default_meta_description} onChange={(v) => set({ default_meta_description: v })} /></Field>
            {F("default_keywords", "Default keywords", "Comma separated")}
            <Field label="Default social image"><ImageInput value={s.default_og_image} onChange={(v) => set({ default_og_image: v })} folder="og" /></Field>
          </div>
        </Card>
        <Card title="Publisher & author (structured data)">
          <div className="grid gap-4">
            {F("publisher_name", "Publisher name")}
            <Field label="Publisher logo" help="Square PNG, at least 112×112. Default: /logo.png"><ImageInput value={s.publisher_logo} onChange={(v) => set({ publisher_logo: v })} folder="brand" /></Field>
            {F("author_name", "Default author name")}
            {F("author_url", "Author URL")}
            <Field label="Author bio"><TextArea rows={3} value={s.author_bio} onChange={(v) => set({ author_bio: v })} /></Field>
          </div>
        </Card>
        <Card title="Contact & links">
          <div className="grid gap-4">
            {F("contact_email", "Contact email")}
            {F("contact_phone", "Contact phone")}
            {F("extension_url", "Chrome extension URL")}
            {F("extension_name", "Extension name")}
            {F("twitter", "X / Twitter handle", "", "@peptidescodes")}
          </div>
        </Card>
        <Card title="Verification & analytics">
          <div className="grid gap-4">
            {F("google_site_verification", "Google Search Console verification code", "Only the content value of the meta tag.")}
            {F("bing_site_verification", "Bing Webmaster verification code")}
            {F("ga_measurement_id", "Google Analytics 4 ID", "", "G-XXXXXXXXXX")}
          </div>
        </Card>
      </div>
      <SaveBar busy={busy} dirty={dirty} onSave={save} />
    </div>
  );
}
