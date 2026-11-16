"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { BrandMark, Wordmark } from "@/components/BrandLogo";
import { SessionCtx, ToastProvider, revalidateSite, sb, useToast } from "./ui";

const I = {
  dash: <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" />,
  tag: <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="8" cy="8" r="1.5" /></>,
  page: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  pen: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  refresh: <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />,
  out: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  ext: <path d="M7 17 17 7M8 7h9v9" />,
};
const Ico = ({ d }: { d: React.ReactNode }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);

const NAV: [string, string, React.ReactNode][] = [
  ["/admin", "Dashboard", I.dash],
  ["/admin/vendors", "Vendors & coupons", I.tag],
  ["/admin/pages", "Pages & SEO", I.page],
  ["/admin/guides", "Guides / blog", I.pen],
  ["/admin/inbox", "Inbox & subscribers", I.mail],
  ["/admin/settings", "Site settings", I.gear],
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid min-h-screen grid-cols-1 bg-bone lg:grid-cols-2">
      <div className="panel-navy m-3 hidden flex-col justify-between !rounded-[32px] p-12 lg:flex">
        <Wordmark light size="lg" />
        <div className="relative z-10">
          <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/55">Admin panel</div>
          <p className="mt-4 max-w-md text-[44px] font-semibold leading-[1.05] tracking-[-0.045em]">Manage codes, pages and SEO in one place.</p>
          <ul className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {[["82+", "Vendors"], ["10", "Pages"], ["SEO", "Every page"]].map(([n, l]) => (
              <li key={l} className="border-l border-white/20 pl-4"><span className="block text-[30px] font-medium tracking-[-0.04em]">{n}</span><span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-white/55">{l}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form
          className="w-full max-w-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr("");
            const { data, error } = await sb().auth.signInWithPassword({ email: email.trim(), password });
            setBusy(false);
            if (error) return setErr(error.message);
            if (data.user?.app_metadata?.role !== "admin") {
              await sb().auth.signOut();
              setErr("This account is not an admin.");
            }
          }}
        >
          <div className="lg:hidden"><Wordmark /></div>
          <div className="mt-10 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8a8a8a] lg:mt-0">Welcome back</div>
          <h1 className="mt-2 text-[38px] font-semibold tracking-[-0.045em] text-ink">Sign in</h1>
          <label className="adm-label mt-8" htmlFor="a-email">Email</label>
          <input id="a-email" type="email" autoComplete="username" className="adm-input !h-12 !rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="adm-label mt-4" htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" autoComplete="current-password" className="adm-input !h-12 !rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {err && <p className="mt-3 rounded-xl bg-sale-50 px-3 py-2 text-[13.5px] text-sale">{err}</p>}
          <button disabled={busy} className="btn btn-primary mt-6 h-12 w-full">{busy ? "Signing in…" : "Sign in"}</button>
          <Link href="/" className="mt-5 block text-center text-[13.5px] text-muted hover:text-ink">← Back to website</Link>
        </form>
      </div>
    </div>
  );
}

function Shell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toast = useToast();
  useEffect(() => setOpen(false), [pathname]);
  const item = "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14.5px] font-medium transition";
  return (
    <div className="min-h-screen bg-bone lg:grid lg:grid-cols-[280px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] p-3 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col overflow-y-auto rounded-[28px] bg-ink text-white">
          <div className="flex items-center justify-between px-6 pb-4 pt-7">
            <Wordmark light />
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Admin</span>
          </div>
          <div className="mx-6 mb-4 h-px bg-white/10" />
          <nav className="flex-1 space-y-1 px-3">
            {NAV.map(([href, label, icon]) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`${item} ${active ? "bg-white text-ink shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)]" : "text-white/70 hover:bg-white/[0.07] hover:text-white"}`}>
                  <Ico d={icon} />{label}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-1 p-3">
            <button onClick={async () => toast((await revalidateSite()) ? "Website cache refreshed" : "Refresh failed")} className={`${item} w-full text-white/70 hover:bg-white/[0.07] hover:text-white`}><Ico d={I.refresh} />Refresh live site</button>
            <a href="/" target="_blank" className={`${item} text-white/70 hover:bg-white/[0.07] hover:text-white`}><Ico d={I.ext} />View website</a>
            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3">
              <BrandMark size={34} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">{session.user.email}</div>
                <div className="text-[11.5px] text-white/50">Administrator</div>
              </div>
              <button onClick={() => sb().auth.signOut()} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out"><Ico d={I.out} /></button>
            </div>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0">
        <div className="sticky top-0 z-30 px-3 pt-3 lg:hidden">
          <div className="glass-light flex items-center gap-3 rounded-[20px] px-4 py-3">
            <button onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white" aria-label="Menu">☰</button>
            <Wordmark />
          </div>
        </div>
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-9">{children}</div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fallback = setTimeout(() => setReady(true), 3000);
    sb().auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); clearTimeout(fallback); });
    const { data: sub } = sb().auth.onAuthStateChange((_e, s) => { setSession(s); setReady(true); });
    return () => { clearTimeout(fallback); sub.subscription.unsubscribe(); };
  }, []);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-bone text-muted">Loading…</div>;
  const isAdmin = session?.user?.app_metadata?.role === "admin";
  return (
    <ToastProvider>
      <SessionCtx.Provider value={{ session }}>
        {session && isAdmin ? <Shell session={session}>{children}</Shell> : <Login />}
      </SessionCtx.Provider>
    </ToastProvider>
  );
}
