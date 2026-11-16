import "server-only";
import { cache } from "react";
import { serverClient } from "./supabase";
import type { PageContent, Post, Settings, Vendor, VendorLite } from "./types";
import { seedPages, seedPosts, seedSettings, seedVendors, TODAY } from "@/data/seed-data.mjs";
import logoIndex from "../../public/logos/index.json";

const hasLogo = new Set<string>(logoIndex as string[]);
const SEED_VENDORS = (seedVendors as unknown as Vendor[]).map((v) => ({
  ...v,
  logo_url: hasLogo.has(v.slug) ? v.logo_url : "",
}));
const SEED_PAGES = seedPages as unknown as PageContent[];
const SEED_POSTS = seedPosts as unknown as Post[];

async function safe<T>(fn: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await fn();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export const getSettings = cache(async (): Promise<Settings> => {
  const row = await safe<{ data: Partial<Settings> }>(() => serverClient().from("settings").select("data").eq("id", 1).maybeSingle());
  const merged = { ...(seedSettings as Settings), ...Object.fromEntries(Object.entries(row?.data || {}).filter(([, v]) => v !== null && v !== undefined)) } as Settings;
  merged.site_url = (merged.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://peptidescodes.com").replace(/\/$/, "");
  return merged;
});

export const getVendors = cache(async (): Promise<Vendor[]> => {
  const rows = await safe<Vendor[]>(() => serverClient().from("vendors").select("*").eq("published", true).order("sort_order", { ascending: true }));
  // Fall back to seed data only when the database is unreachable or not set up,
  // never because every vendor was switched off in the admin.
  return sortByOrder(rows ?? SEED_VENDORS);
});

export const getVendor = cache(async (slug: string): Promise<Vendor | null> => {
  const all = await getVendors();
  return all.find((v) => v.slug === slug) || null;
});

export const getPage = cache(async (slug: string): Promise<PageContent> => {
  const seed = SEED_PAGES.find((p) => p.slug === slug) || ({ slug, title: slug, subtitle: "", content: "", faqs: [] } as unknown as PageContent);
  const row = await safe<PageContent>(() => serverClient().from("pages").select("*").eq("slug", slug).maybeSingle());
  if (!row) return seed;
  return { ...seed, ...Object.fromEntries(Object.entries(row).filter(([, v]) => v !== null && v !== "")) } as PageContent;
});

export const getPosts = cache(async (): Promise<Post[]> => {
  const rows = await safe<Post[]>(() => serverClient().from("posts").select("*").eq("published", true).order("published_at", { ascending: false }));
  return rows && rows.length ? rows : SEED_POSTS;
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const all = await getPosts();
  return all.find((p) => p.slug === slug) || null;
});

/** A page set to Draft in the admin is hidden from the public site. */
export function isPagePublished(page: PageContent) {
  return page.published !== false;
}

/** Vendors in the manual order set by drag-and-drop in the admin. */
export function sortByOrder<T extends Pick<Vendor, "sort_order" | "name">>(vendors: T[]) {
  return [...vendors].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));
}

/** Coupons sorted by discount (desc), featured first on ties. */
export function sortByDiscount(vendors: Vendor[]) {
  return [...vendors].sort((a, b) => b.discount_percent - a.discount_percent || Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order);
}

export function lite(v: Vendor): VendorLite {
  return {
    slug: v.slug, name: v.name, logo_url: v.logo_url, code: v.code, discount_percent: v.discount_percent,
    discount_label: v.discount_label, applies_to: v.applies_to, affiliate_url: v.affiliate_url, verified_at: v.verified_at,
    featured: v.featured, coupon_active: v.coupon_active, country: v.country, coa_count: v.coa_count,
  };
}

export function latestVerified(vendors: Vendor[]) {
  return vendors.reduce((m, v) => (v.verified_at && v.verified_at > m ? v.verified_at : m), "") || TODAY;
}

export async function siteStats() {
  const vendors = await getVendors();
  const active = vendors.filter((v) => v.coupon_active && v.code);
  return {
    vendors: vendors.length,
    codes: active.length,
    maxDiscount: active.reduce((m, v) => Math.max(m, v.discount_percent), 0),
    sitewide: active.filter((v) => (v.applies_to || "").toLowerCase() === "sitewide").length,
    updated: latestVerified(vendors),
  };
}
