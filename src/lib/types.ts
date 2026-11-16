export type Faq = { q: string; a: string };

export type SeoFields = {
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  canonical_url: string | null;
  og_image: string | null;
  noindex: boolean | null;
};

export type Vendor = SeoFields & {
  id?: string;
  slug: string;
  name: string;
  headline?: string | null;
  logo_url: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  code: string | null;
  discount_percent: number;
  discount_label: string | null;
  applies_to: string | null;
  coupon_active: boolean;
  featured: boolean;
  sort_order: number;
  verified_at: string | null;
  short_description: string | null;
  about: string | null;
  country: string | null;
  founded: number | null;
  compounds: number | null;
  coa_count: number | null;
  testing_lab: string | null;
  shipping_info: string | null;
  payment_methods: string | null;
  open_to?: string | null;
  combinable?: string | null;
  min_order?: string | null;
  expiry?: string | null;
  faqs: Faq[] | null;
  published: boolean;
  updated_at?: string | null;
};

export type PageContent = SeoFields & {
  slug: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  faqs: Faq[] | null;
  /** false = draft (hidden from the public site). Missing column is treated as published. */
  published?: boolean | null;
  updated_at?: string | null;
};

export type Post = SeoFields & {
  id?: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author: string | null;
  published: boolean;
  published_at: string | null;
  faqs: Faq[] | null;
  updated_at?: string | null;
};

export type Settings = {
  site_name: string;
  tagline: string;
  site_url: string;
  lang: string;
  publisher_name: string;
  publisher_logo: string;
  author_name: string;
  author_url: string;
  author_bio: string;
  contact_email: string;
  contact_phone: string;
  extension_url: string;
  extension_name: string;
  twitter: string;
  default_meta_title: string;
  default_meta_description: string;
  default_keywords: string;
  default_og_image: string;
  google_site_verification: string;
  bing_site_verification: string;
  ga_measurement_id: string;
  /** Google Tag Manager container ID, e.g. GTM-XXXXXXX (public pages only). */
  gtm_id: string;
  announcement: string;
};

/** Slim vendor shape sent to client components (header search, carousel). */
export type VendorLite = Pick<
  Vendor,
  "slug" | "name" | "logo_url" | "code" | "discount_percent" | "discount_label" | "applies_to" | "affiliate_url" | "verified_at" | "featured" | "coupon_active" | "country" | "coa_count"
>;
