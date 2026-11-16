"use client";

import { useState } from "react";
import { Card, DbError, sb, useLoad, useToast } from "../_lib/ui";

type Msg = { id: string; name: string; email: string; subject: string; message: string; read: boolean; created_at: string };
type Sub = { id: string; email: string; created_at: string };

export default function Inbox() {
  const toast = useToast();
  const [tab, setTab] = useState<"messages" | "subscribers">("messages");
  const msgs = useLoad<Msg[]>(async () => sb().from("messages").select("*").order("created_at", { ascending: false }).limit(500));
  const subs = useLoad<Sub[]>(async () => sb().from("subscribers").select("*").order("created_at", { ascending: false }).limit(5000));

  if (msgs.error) return <DbError error={msgs.error} />;

  const exportCsv = () => {
    const rows = ["email,subscribed_at", ...(subs.data || []).map((s) => `${s.email},${s.created_at}`)];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-[36px] font-semibold tracking-[-0.045em] text-ink">Inbox & subscribers</h1>
      <div className="flex gap-2">
        {(["messages", "subscribers"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-ghost"}`}>
            {t === "messages" ? `Messages (${msgs.data?.filter((m) => !m.read).length ?? 0} unread)` : `Subscribers (${subs.data?.length ?? 0})`}
          </button>
        ))}
      </div>
      {tab === "messages" ? (
        <div className="space-y-3">
          {msgs.data?.length === 0 && <p className="text-muted">No messages yet.</p>}
          {msgs.data?.map((m) => (
            <Card key={m.id} className={m.read ? "opacity-75" : "!border-blue/30"}>
              <div className="flex flex-wrap items-center gap-2 text-[14px]">
                {!m.read && <span className="pill pill-sky">New</span>}
                <b className="text-ink">{m.name}</b>
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "")}`} className="text-navy">{m.email}</a>
                <span className="text-muted">· {m.subject} · {new Date(m.created_at).toLocaleString()}</span>
                <span className="ml-auto flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={async () => { await sb().from("messages").update({ read: !m.read }).eq("id", m.id); msgs.reload(); }}>{m.read ? "Mark unread" : "Mark read"}</button>
                  <button className="btn btn-ghost btn-sm !text-sale" onClick={async () => { if (!confirm("Delete message?")) return; const { error } = await sb().from("messages").delete().eq("id", m.id); if (error) toast(error.message, "err"); msgs.reload(); }}>Delete</button>
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[14.5px] text-[#2b3550]">{m.message}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card title="Newsletter subscribers" actions={<button className="btn btn-ghost btn-sm" onClick={exportCsv}>Export CSV</button>}>
          <ul className="divide-y divide-line text-[14px]">
            {subs.data?.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5">
                <span className="text-ink">{s.email}</span>
                <span className="flex items-center gap-3 text-muted">{new Date(s.created_at).toLocaleDateString()}
                  <button className="text-sale" onClick={async () => { if (!confirm(`Remove ${s.email}?`)) return; await sb().from("subscribers").delete().eq("id", s.id); subs.reload(); }}>Remove</button>
                </span>
              </li>
            ))}
            {subs.data?.length === 0 && <li className="py-3 text-muted">No subscribers yet.</li>}
          </ul>
        </Card>
      )}
    </div>
  );
}
