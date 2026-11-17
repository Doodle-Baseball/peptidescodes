import type { MetadataRoute } from "next";
import { getPage, getPosts, getSettings, getVendors } from "@/lib/data";
import { serverClient } from "@/lib/supabase";
import { seedPages } from "@/data/seed-data.mjs";
import { isForceIndexed, isPageForceIndexed } from "@/lib/page-seo-overrides";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [s, vendors, posts] = await Promise.all([getSettings(), getVendors(), getPosts()]);
  const latest = vendors.reduce((m, v) => ((v.updated_at || v.verified_at || "") > m ? v.updated_at || v.verified_at || "" : m), "");
  // Built-in pages, keyed by their slug in the pages table.
  const coreDefs: [string, MetadataRoute.Sitemap[number]][] = [
    ["home", { url: `${s.site_url}/`, lastModified: latest || undefined, changeFrequency: "daily", priority: 1 }],
    ["coupons", { url: `${s.site_url}/coupons`, lastModified: latest || undefined, changeFrequency: "daily", priority: 0.9 }],
    ["vendors", { url: `${s.site_url}/vendors`, lastModified: latest || undefined, changeFrequency: "weekly", priority: 0.8 }],
    ["guides", { url: `${s.site_url}/guides`, changeFrequency: "weekly", priority: 0.6 }],
    ["extension", { url: `${s.site_url}/extension`, changeFrequency: "monthly", priority: 0.7 }],
    ["contact", { url: `${s.site_url}/contact`, changeFrequency: "yearly", priority: 0.3 }],
  ];
  const indexable = (p: { noindex?: boolean | null; published?: boolean | null }) => !p.noindex && p.published !== false;
  const corePages = await Promise.all(coreDefs.map(([slug]) => getPage(slug)));
  const core = coreDefs
    .filter(([slug], i) => indexable(corePages[i]) || (isPageForceIndexed(slug) && corePages[i].published !== false))
    .map(([, entry]) => entry);

  const slugs = new Set<string>((seedPages as { slug: string }[]).map((p) => p.slug));
  try {
    const { data } = await serverClient().from("pages").select("slug");
    data?.forEach((p: { slug: string }) => slugs.add(p.slug));
  } catch { /* ignore */ }
  const reserved = new Set(coreDefs.map(([slug]) => slug));
  const cms: MetadataRoute.Sitemap = [];
  for (const slug of slugs) {
    if (reserved.has(slug)) continue;
    const p = await getPage(slug);
    if (!indexable(p)) continue;
    cms.push({ url: `${s.site_url}/${slug}`, lastModified: p.updated_at || undefined, changeFrequency: "yearly", priority: 0.3 });
  }
  return [
    ...core,
    ...vendors.filter((v) => !v.noindex || isForceIndexed(v.slug)).map((v) => ({ url: `${s.site_url}/coupons/${v.slug}`, lastModified: v.updated_at || v.verified_at || undefined, changeFrequency: "weekly" as const, priority: v.coupon_active ? 0.8 : 0.5 })),
    ...posts.filter((p) => !p.noindex).map((p) => ({ url: `${s.site_url}/guides/${p.slug}`, lastModified: p.updated_at || p.published_at || undefined, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...cms,
  ];
}
