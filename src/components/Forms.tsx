"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase";
import { Dropdown } from "./Dropdown";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  return (
    <form
      className="w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!EMAIL_RE.test(email)) { setState("err"); setMsg("Please enter a valid email address."); return; }
        setState("busy");
        const { error } = await browserClient().from("subscribers").insert({ email: email.trim().toLowerCase() });
        if (error && !/duplicate|unique/i.test(error.message)) { setState("err"); setMsg("Something went wrong. Please try again."); return; }
        setState("ok"); setMsg("You're subscribed. Watch your inbox for new codes."); setEmail("");
      }}
    >
      <div className={`flex flex-col gap-2 rounded-2xl p-1.5 sm:flex-row ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-line shadow-[var(--shadow-card)]"}`}>
        <label htmlFor={dark ? "nl-email-d" : "nl-email"} className="sr-only">Email address</label>
        <input
          id={dark ? "nl-email-d" : "nl-email"}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`h-12 flex-1 rounded-xl bg-transparent px-4 text-[15px] focus:outline-none ${dark ? "text-white placeholder:text-white/45" : "text-ink placeholder:text-[#8a93a8]"}`}
        />
        <button disabled={state === "busy"} className={`btn h-12 ${dark ? "bg-white text-ink hover:bg-sky" : "btn-primary"}`}>
          {state === "busy" ? "Subscribing…" : "Get code alerts"}
        </button>
      </div>
      {msg && <p role="status" className={`mt-2 text-[13.5px] ${state === "err" ? "text-[#ffb4ab]" : dark ? "text-[#9be3b0]" : "text-green"}`}>{msg}</p>}
    </form>
  );
}

/** Emails the message via Web3Forms. Delivery goes to the inbox tied to the access key. */
async function emailMessage(_to: string, f: { name: string; email: string; subject: string; message: string }) {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) return false;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `PeptidesCodes contact: ${f.subject} from ${f.name}`,
        from_name: "PeptidesCodes website",
        replyto: f.email,
        name: f.name,
        email: f.email,
        topic: f.subject,
        message: f.message,
        page: typeof window !== "undefined" ? window.location.href : "",
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && data.success === true;
  } catch {
    return false;
  }
}

export function ContactForm({ to }: { to: string }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "Report a code", message: "", website: "" });
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err" | "fail">("idle");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (state === "ok")
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green">✓</div>
        <h2 className="mt-4 text-[22px] font-bold text-ink">Message sent</h2>
        <p className="mt-2 text-muted">Thanks, we usually reply within one business day.</p>
      </div>
    );

  return (
    <form
      className="card space-y-4 p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (form.website) return; // honeypot
        if (!form.name.trim() || !EMAIL_RE.test(form.email) || form.message.trim().length < 5) { setState("err"); return; }
        setState("busy");
        const payload = { name: form.name.trim(), email: form.email.trim(), subject: form.subject, message: form.message.trim() };
        const [mailed, saved] = await Promise.all([
          emailMessage(to, payload),
          browserClient().from("messages").insert(payload).then(({ error }) => !error, () => false),
        ]);
        setState(mailed || saved ? "ok" : "fail");
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="adm-label" htmlFor="c-name">Your name</label>
          <input id="c-name" className="adm-input !py-3" value={form.name} onChange={set("name")} required maxLength={120} />
        </div>
        <div>
          <label className="adm-label" htmlFor="c-email">Email</label>
          <input id="c-email" type="email" className="adm-input !py-3" value={form.email} onChange={set("email")} required maxLength={200} />
        </div>
      </div>
      <div>
        <label className="adm-label" htmlFor="c-subject">Subject</label>
        <Dropdown
          id="c-subject"
          value={form.subject}
          onChange={(subject) => setForm((f) => ({ ...f, subject }))}
          options={[["Report a code", "Report a code"], ["List my store", "List my store"], ["Partnership", "Partnership"], ["Other", "Other"]]}
        />
      </div>
      <div>
        <label className="adm-label" htmlFor="c-msg">Message</label>
        <textarea id="c-msg" rows={6} className="adm-input !py-3" value={form.message} onChange={set("message")} required maxLength={5000} />
      </div>
      <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
      {state === "err" && <p className="text-[14px] text-sale">Please fill in every field with a valid email, then try again.</p>}
      {state === "fail" && <p className="text-[14px] text-sale">We couldn&apos;t send your message. Please email us directly at <a href={`mailto:${to}`} className="underline">{to}</a>.</p>}
      <button disabled={state === "busy"} className="btn btn-primary w-full sm:w-auto">{state === "busy" ? "Sending…" : "Send message"}</button>
    </form>
  );
}
