import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  // Vercel preview deployments: block all crawling so they never compete with the live site.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/revalidate"] }],
    sitemap: `${s.site_url}/sitemap.xml`,
    host: s.site_url,
  };
}
