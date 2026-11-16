import type { Metadata } from "next";
import type { SeoFields, Settings } from "./types";

export function absUrl(settings: Settings, path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${settings.site_url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(settings: Settings, title: string, sub?: string) {
  const q = new URLSearchParams({ t: title.slice(0, 90) });
  if (sub) q.set("s", sub.slice(0, 120));
  return absUrl(settings, `/api/og?${q.toString()}`);
}

type Args = {
  settings: Settings;
  seo?: Partial<SeoFields> | null;
  title: string;
  description: string;
  path: string;
  keywords?: string;
  ogTitle?: string;
  ogSub?: string;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

export function buildMetadata({ settings, seo, title, description, path, keywords, ogTitle, ogSub, type = "website", publishedTime, modifiedTime }: Args): Metadata {
  const finalTitle = seo?.meta_title?.trim() || title;
  const finalDesc = seo?.meta_description?.trim() || description;
  const canonical = seo?.canonical_url?.trim() || absUrl(settings, path);
  const kw = (seo?.keywords?.trim() || keywords || settings.default_keywords || "")
    .split(",").map((k) => k.trim()).filter(Boolean);
  const image = seo?.og_image?.trim() ? absUrl(settings, seo.og_image.trim()) : ogImageUrl(settings, ogTitle || title, ogSub);
  const noindex = !!seo?.noindex;

  return {
    title: { absolute: finalTitle },
    description: finalDesc,
    keywords: kw.length ? kw : undefined,
    alternates: { canonical, languages: { [settings.lang || "en-US"]: canonical, "x-default": canonical } },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type,
      url: canonical,
      siteName: settings.site_name,
      title: finalTitle,
      description: finalDesc,
      locale: (settings.lang || "en-US").replace("-", "_"),
      images: [{ url: image, width: 1200, height: 630, alt: finalTitle }],
      ...(type === "article" ? { publishedTime: publishedTime || undefined, modifiedTime: modifiedTime || undefined, authors: [settings.author_name] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDesc,
      images: [image],
      ...(settings.twitter ? { site: settings.twitter, creator: settings.twitter } : {}),
    },
  };
}
