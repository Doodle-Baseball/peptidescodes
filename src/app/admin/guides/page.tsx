"use client";

import Link from "next/link";
import type { Post } from "@/lib/types";
import { DbError, sb, useLoad } from "../_lib/ui";

export default function GuidesAdmin() {
  const { data, error, loading } = useLoad<Post[]>(async () => sb().from("posts").select("id,slug,title,published,published_at,meta_title").order("published_at", { ascending: false }));
  if (error) return <DbError error={error} />;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[36px] font-semibold tracking-[-0.045em] text-ink">Guides / blog</h1>
          <p className="text-muted">Articles at /guides/slug, great for ranking on informational searches.</p>
        </div>
        <Link href="/admin/guides/new" className="btn btn-primary btn-sm">+ New guide</Link>
      </div>
      <div className="overflow-x-auto rounded-[24px] border border-line bg-white">
        <table className="w-full min-w-[640px] text-[14px]">
          <thead className="bg-stone text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">
            <tr><th className="px-4 py-3">Title</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Status</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-6 text-center text-muted">Loading…</td></tr>}
            {data?.map((p) => (
              <tr key={p.id} className="border-t border-line hover:bg-bone/50">
                <td className="px-4 py-3 font-semibold text-ink"><Link href={`/admin/guides/${p.id}`} className="hover:text-navy">{p.title}</Link></td>
                <td className="px-3 py-3 text-muted">{p.published_at}</td>
                <td className="px-3 py-3">{p.published ? <span className="pill pill-green">Published</span> : <span className="pill pill-gold">Draft</span>}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><Link href={`/admin/guides/${p.id}`} className="font-semibold text-navy">Edit</Link><a href={`/guides/${p.slug}`} target="_blank" className="ml-3 text-muted">View ↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
