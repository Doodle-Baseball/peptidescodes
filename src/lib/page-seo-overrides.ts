import type { Faq, Settings, Vendor } from "./types";
import { ogImageUrl } from "./seo";
import { formatDate, monthYear } from "./format";
import { vendorMetaDescription, vendorMetaTitle } from "./vendor-content";

/* ------------------------------------------------------------------ */
/* Core pages (/coupons …)                                             */
/* ------------------------------------------------------------------ */

type Stats = { vendors: number; codes: number; maxDiscount: number; sitewide: number; updated: string | null | undefined };
type PageCtx = { vendors: Vendor[]; stats: Stats };

/**
 * forceIndex:  serve `index, follow` and list the page in the sitemap even when the page row has noindex.
 * meta:        title / description / keywords that replace the admin values for this page.
 * guide:       show the styled CouponsGuide section, only while the page's "Content" field in the admin is empty.
 * extraFaqs:   FAQs added after the admin FAQs (questions already in the admin list are skipped).
 */
type PageOverride = {
  forceIndex?: boolean;
  meta?: (ctx: PageCtx) => { title: string; description: string; keywords: string[] };
  guide?: boolean;
  extraFaqs?: (ctx: PageCtx) => Faq[];
};

const activeCodes = (vendors: Vendor[]) => vendors.filter((v) => v.coupon_active && v.code);
const topDiscounts = (vendors: Vendor[], n: number) =>
  [...activeCodes(vendors)].sort((a, b) => b.discount_percent - a.discount_percent || a.name.localeCompare(b.name)).slice(0, n);

const PAGE_OVERRIDES: Record<string, PageOverride> = {
  coupons: {
    forceIndex: true,
    meta: ({ stats }) => ({
      title: `Peptide Promo Codes & Coupons: ${stats.codes} Verified (${monthYear(stats.updated)})`,
      description: `${stats.codes} verified peptide promo codes from ${stats.vendors} research peptide suppliers, up to ${stats.maxDiscount}% off. Filter by discount and copy a code in one click. Updated ${formatDate(stats.updated)}.`,
      keywords: ["peptide promo codes", "peptide coupon codes", "peptide discount codes", "research peptide coupons", "peptide coupons list"],
    }),
    guide: true,
    extraFaqs: ({ vendors, stats }) => {
      const best = topDiscounts(vendors, 1)[0];
      return [
        ...(best
          ? [{ q: "Which peptide promo code has the biggest discount?", a: `Right now it is ${best.name}: code ${best.code} takes ${(best.discount_label || `${best.discount_percent}% off`).toLowerCase()} ${(best.applies_to || "sitewide").toLowerCase() === "sitewide" ? "sitewide" : "on eligible products"}. Sort the table by "Biggest discount" to see the rest in order.` }]
          : []),
        { q: "Are these peptide promo codes verified?", a: `Each code shows the date we last confirmed it. We apply codes in a real cart where possible and remove or flag codes that stop working. The list was last updated ${formatDate(stats.updated)}.` },
        { q: "Can I use two peptide promo codes on one order?", a: "Most suppliers accept one code per order. Unless a supplier's page says stacking is confirmed, plan on using a single code." },
        { q: "Why do some suppliers have no code?", a: "The suppliers under \"Partner stores without a public code\" don't have a verified public code at the moment. We update the list when one becomes available." },
        { q: "Does PeptidesCodes sell peptides?", a: "No. PeptidesCodes is an independent coupon directory. We don't sell products or give medical advice, and the products from listed suppliers are for laboratory research use only." },
      ];
    },
  },
};

export function pageOverride(slug: string): PageOverride | undefined {
  return PAGE_OVERRIDES[slug];
}

export function isPageForceIndexed(slug: string) {
  return !!PAGE_OVERRIDES[slug]?.forceIndex;
}

/* ------------------------------------------------------------------ */
/* Coupon pages (/coupons/[slug])                                      */
/* ------------------------------------------------------------------ */

/**
 * Per-page SEO overrides for individual coupon pages.
 * Only slugs listed here are affected; every other coupon page keeps the default template output.
 *
 * forceIndex: serve `index, follow` and list the page in the sitemap even when the vendor row
 *             has `noindex = true` in the database. While set, the admin noindex toggle is ignored for this page.
 * richSchema: output the extended JSON-LD graph (WebPage + Offer + vendor Organization + HowTo).
 * keywords:   meta keywords for the page (used instead of the default list, which includes the code).
 * about:      Markdown article shown in the content card below the offer, used only while the vendor's
 *             "About" field in the admin is empty (an admin-written About always takes priority).
 * h1:         page heading, used only while the vendor's "Headline" field in the admin is empty.
 *             Text after the first ":" is shown in the highlight colour.
 */
type Override = { forceIndex?: boolean; richSchema?: boolean; keywords?: string[]; about?: (v: Vendor) => string; h1?: (v: Vendor) => string };

const OVERRIDES: Record<string, Override> = {
  "disguised-alpha": {
    forceIndex: true,
    richSchema: true,
    keywords: ["Disguised Alpha coupon code", "Disguised Alpha discount code", "Disguised Alpha promo code"],
  },
  "licensed-peptides": {
    forceIndex: true,
    richSchema: true,
    keywords: [
      "Licensed Peptides coupon code",
      "Licensed Peptides discount code",
      "Licensed Peptides promo code",
      "Licensed Peptides coupon",
      "Licensed Peptides discount",
    ],
    about: licensedPeptidesAbout,
  },
  "american-peptides": {
    forceIndex: true,
    richSchema: true,
    keywords: [
      "American Peptides coupon code",
      "American Peptides discount code",
      "American Peptides promo code",
      "American Peptides coupon",
      "American Peptides discount",
    ],
    about: americanPeptidesAbout,
  },
  "eon-peptides": {
    forceIndex: true,
    richSchema: true,
    keywords: [
      "Eon Peptides coupon code",
      "Eon Peptides discount code",
      "Eon Peptides promo code",
      "Eon Peptides coupon",
      "Eon Peptides discount",
    ],
    about: eonPeptidesAbout,
  },
  "heez-research": {
    forceIndex: true,
    richSchema: true,
    keywords: [
      "HEEZ Research coupon code",
      "HEEZ Research discount code",
      "HEEZ Research promo code",
      "HEEZ Research coupon",
      "HEEZ Research discount",
    ],
    about: heezResearchAbout,
  },
  "nura-peptide": {
    forceIndex: true,
    richSchema: true,
    keywords: ["Nura Peptide coupon code", "Nura Peptide discount code", "Nura Peptide promo code"],
    about: nuraPeptideAbout,
    h1: (v) => (v.coupon_active && v.code ? `${v.name} coupon code: ${v.discount_label || `${v.discount_percent}% Off`}` : `${v.name} coupon code: partner deal`),
  },
  "amino-science": {
    forceIndex: true,
    richSchema: true,
    keywords: [
      "Amino Science coupon code",
      "Amino Science discount code",
      "Amino Science promo code",
      "Amino Science coupon",
      "Amino Science discount",
    ],
    about: aminoScienceAbout,
    h1: (v) => (v.coupon_active && v.code ? `${v.name} coupon code: ${v.discount_label || `${v.discount_percent}% Off`}` : `${v.name} coupon code: partner deal`),
  },
  "true-peptides": {
    forceIndex: true,
    richSchema: true,
    keywords: ["True Peptides discount code", "True Peptides coupon code", "True Peptides promo code"],
    about: truePeptidesAbout,
  },
  "amino-club": {
    forceIndex: true,
    richSchema: true,
    keywords: ["Amino Club promo code", "Amino Club discount code", "Amino Club coupon code"],
    about: aminoClubAbout,
  },
  "kalyx-labs": {
    forceIndex: true,
    richSchema: true,
    keywords: ["Kalyx Labs coupon code", "Kalyx Labs discount code", "Kalyx Labs promo code"],
    about: kalyxLabsAbout,
  },
};

function kalyxLabsAbout(v: Vendor) {
  const pct = v.discount_percent || 25;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "adamdan";
  const verified = formatDate(v.verified_at);
  const compounds = v.compounds || 23;
  return `## Kalyx Labs coupon code: what you get

The Kalyx Labs coupon code **${code}** gives **${pct}% off sitewide**, so it applies to your whole order. We last confirmed it at checkout on **${verified}**. Kalyx Labs is a U.S.-based research peptide supplier launched in ${v.founded || 2026}, with **${compounds} compounds** listed. At our last price check it was **below the market median on 12 of the 22 compounds** we compared, and the ${pct}% Kalyx Labs discount code comes off those prices.

### How much the ${pct}% Kalyx Labs promo code saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Before you order from Kalyx Labs

- **Check the discount line** covers every item after you press Apply. Use one code per order.
- **Compare the final total**, including shipping, with other suppliers on our [peptide coupon code list](/coupons). Kalyx Labs was cheaper than the median on about half the compounds we checked, so prices vary by product. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how to check.
- **Find the COA** (certificate of analysis) for the batch you buy, and note which lab ran the test.

If ${code} stops working, tell us through the contact page and we will re-check the Kalyx Labs coupon code.`;
}

function aminoClubAbout(v: Vendor) {
  const pct = v.discount_percent || 20;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "PRODUCTS";
  const verified = formatDate(v.verified_at);
  return `## Amino Club promo code: what you get

The Amino Club promo code **${code}** gives **${pct}% off sitewide**, so it applies to your whole order. We last confirmed it at checkout on **${verified}**. Amino Club is a U.S.-based research peptide supplier selling since ${v.founded || 2019}. At our last price check it was **below the market median price on all 28 compounds** we compared, so the Amino Club discount code comes off prices that are already lower than most of the market.

### How much the ${pct}% Amino Club coupon code saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Before you order from Amino Club

- **Check the discount line** covers every item after you press Apply. Use one code per order.
- **Compare the final total**, including shipping, with other suppliers on our [peptide coupon code list](/coupons). Below-median prices mean Amino Club was cheaper than most stores we checked, not always the cheapest. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how to check.
- **Find the COA** (certificate of analysis) for the batch you buy, and note which lab ran the test.

If ${code} stops working, tell us through the contact page and we will re-check the Amino Club promo code.`;
}

function truePeptidesAbout(v: Vendor) {
  const pct = v.discount_percent || 10;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "PEPLOOKUP";
  const verified = formatDate(v.verified_at);
  return `## True Peptides discount code: what you get

The True Peptides discount code **${code}** gives **${pct}% off sitewide**, so it applies to your whole order. We last confirmed it at checkout on **${verified}**. True Peptides is a U.S.-based research peptide supplier selling since ${v.founded || 2025}. Its list prices sit above the market median on most compounds we compared, so using the True Peptides coupon code on every order helps narrow that gap.

### How much the ${pct}% True Peptides coupon code saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Before you order from True Peptides

- **Check the discount line** covers every item after you press Apply. Use one code per order.
- **Compare the final total**, including shipping, with other suppliers on our [peptide coupon code list](/coupons). Because True Peptides starts from higher prices, ${pct}% off may not always be the lowest total. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how to check.
- **Find the COA** (certificate of analysis) for the batch you buy, and note which lab ran the test.

If ${code} stops working, tell us through the contact page and we will re-check the True Peptides discount code.`;
}

function aminoScienceAbout(v: Vendor) {
  const pct = v.discount_percent || 20;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "PRODUCTS";
  const verified = formatDate(v.verified_at);
  const coas = v.coa_count || 24;
  return `## Amino Science coupon code: what you get

The Amino Science coupon code **${code}** gives **${pct}% off sitewide**, so it applies to your whole order. We last confirmed it at checkout on **${verified}**. Amino Science is a U.S.-based research peptide supplier that links **${coas} COA reports** (lab test results). Its list prices sit above the market median, so applying the ${pct}% Amino Science discount code on every order helps close that gap.

### How much the ${pct}% Amino Science discount saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Before you order from Amino Science

- **Check the discount line** covers every item after you press Apply. Use one code per order.
- **Compare the final total**, including shipping, with other suppliers on our [peptide coupon code list](/coupons). Because Amino Science starts from higher prices, our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how to check you're getting a good deal.
- **Find the COA** for the batch you buy among the ${coas} published reports, and note which lab ran the test.

If ${code} stops working, tell us through the contact page and we will re-check the Amino Science promo code.`;
}

function nuraPeptideAbout(v: Vendor) {
  const pct = v.discount_percent || 20;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "PEPLOOKUP";
  const verified = formatDate(v.verified_at);
  return `## Nura Peptide coupon code: what you get

The Nura Peptide coupon code **${code}** gives **${pct}% off sitewide**, so it covers your whole order of vials, capsules or nasal sprays. We last confirmed it at checkout on **${verified}**. Nura Peptide is a U.S.-based research peptide supplier, and its products are for laboratory use only.

### How much the ${pct}% Nura Peptide discount saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Before you order from Nura Peptide

- **Check the discount line** covers every item after you press Apply. Use one code per order.
- **Compare the final total**, including shipping, with other suppliers on our [peptide coupon code list](/coupons). Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how.
- **Find the COA** (certificate of analysis) for the batch you buy, and note which lab ran the test.

If ${code} stops working, tell us through the contact page and we will re-check the Nura Peptide promo code.`;
}

function heezResearchAbout(v: Vendor) {
  const pct = v.discount_percent || 15;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "peplookup";
  const verified = formatDate(v.verified_at);
  const coas = v.coa_count || 10;
  return `## HEEZ Research coupon code: what you get

The HEEZ Research coupon code **${code}** gives **${pct}% off sitewide**, so the discount applies to your whole order, not just selected products. We last confirmed the code at checkout on **${verified}**. Copy it with the button on this page and paste it into the discount field, so a stray space or typo doesn't stop it from applying.

HEEZ Research is a research peptide supplier based in the United States, launched in ${v.founded || 2026}. Two things stood out at our last check:

- **${coas} COA reports linked.** The store publishes ${coas} certificates of analysis (lab reports), so you can check test results before you buy.
- **Prices above the market median.** Its list prices sit above the median price across the suppliers we track. That makes the ${pct}% HEEZ Research discount code worth applying on every order, because it narrows that gap.

### How much the ${pct}% HEEZ Research discount saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Is HEEZ Research cheaper with the code?

Not always. Because HEEZ Research starts from higher list prices, ${pct}% off can still leave some compounds more expensive than at a lower-priced store. Before you order, compare the **final checkout total** for the exact compounds and quantities you need, including shipping. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how to work out the real price per mg, and the [peptide coupon code list](/coupons) has the current verified code for every supplier.

### Before you order from HEEZ Research

- **Find the COA for your product.** Check that one of the ${coas} published reports covers the compound and batch you are buying, and note which lab ran the test. Our guide on [how to read a peptide COA](/guides/how-to-read-a-peptide-coa) explains what to look for.
- **Read the shipping and returns policies** on the HEEZ Research website, as they can change.
- **Use one code per order.** We have not confirmed whether ${code} stacks with sales or other codes.
- **Research use only.** Products are sold for laboratory research, not for human consumption.

If ${code} stops working, [tell us](/contact) and we will re-check the HEEZ Research promo code and update this page.`;
}

function eonPeptidesAbout(v: Vendor) {
  const pct = v.discount_percent || 10;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "PEPLOOKUP";
  const verified = formatDate(v.verified_at);
  return `## Eon Peptides coupon code: what you get

The Eon Peptides coupon code **${code}** gives **${pct}% off sitewide**, so it applies to everything in your cart, not just selected products. We last confirmed the code at checkout on **${verified}**. Copy it with the button on this page and paste it into the discount field, so a stray space or typo doesn't stop it from applying.

Eon Peptides is a research peptide supplier based in the United States, launched in ${v.founded || 2026}. At our last price check it was **below the market median price on all 25 compounds** we compared across suppliers. The ${pct}% Eon Peptides discount code comes off those already lower prices, so the saving adds to a store that is cheaper than most of the market on the compounds we checked.

### How much the ${pct}% Eon Peptides discount saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Is Eon Peptides the cheapest option with the code?

Not always. Being below the median price means Eon Peptides was cheaper than most suppliers on those compounds, not necessarily the cheapest. Our comparison also covered 25 compounds, so a product outside that list may be priced differently, and shipping can change the final total. Compare the **final checkout total** for the exact compounds and quantities you need. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how to work out the real price per mg, and the [peptide coupon code list](/coupons) has the current verified code for every supplier.

### Before you order from Eon Peptides

- **Check the certificate of analysis (COA)** for each compound and batch you buy, and note which lab ran the test. Our guide on [how to read a peptide COA](/guides/how-to-read-a-peptide-coa) explains what to look for.
- **Read the shipping and returns policies** on the Eon Peptides website, as they can change.
- **Use one code per order.** We have not confirmed whether ${code} stacks with sales or other codes.
- **Research use only.** Products are sold for laboratory research, not for human consumption.

If ${code} stops working, [tell us](/contact) and we will re-check the Eon Peptides promo code and update this page.`;
}

function americanPeptidesAbout(v: Vendor) {
  const pct = v.discount_percent || 10;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "peplookup";
  const verified = formatDate(v.verified_at);
  return `## American Peptides coupon code: what you get

The American Peptides coupon code **${code}** gives **${pct}% off sitewide**, so the discount applies to your whole order, not just selected products. We last confirmed the code at checkout on **${verified}**. Use the Copy button on this page and paste it into the discount field, so a stray space or typo doesn't stop it from applying.

American Peptides is a new research peptide supplier based in the United States, launched in ${v.founded || 2026}. Two things stood out at our last check:

- **Lab reports on most products.** The store links a lab report (certificate of analysis) on **47 of its 53 products**.
- **Prices above the market median.** Its list prices usually sit above the median price across the suppliers we track. That makes the ${pct}% American Peptides discount code worth using on every order, because it narrows that gap.

### How much the ${pct}% American Peptides discount saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Is American Peptides cheaper with the code?

Not always. Because American Peptides starts from higher list prices, ${pct}% off can still leave some compounds more expensive than at a lower-priced store. Before you order, compare the **final checkout total** for the exact compounds and quantities you need, including shipping. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows how to work out the real price per mg, and the [peptide coupon code list](/coupons) has the current verified code for every supplier.

### Before you order from American Peptides

- **Open the lab report for your product.** 6 of the 53 products had no linked report at our last check, so confirm there is one for the compound and batch you buy. Our guide on [how to read a peptide COA](/guides/how-to-read-a-peptide-coa) explains what to look for.
- **Read the shipping and returns policies** on the American Peptides website, as they can change.
- **Use one code per order.** We have not confirmed whether ${code} stacks with sales or other codes.
- **Research use only.** Products are sold for laboratory research, not for human consumption.

If ${code} stops working, [tell us](/contact) and we will re-check the American Peptides promo code and update this page.`;
}

function licensedPeptidesAbout(v: Vendor) {
  const pct = v.discount_percent || 5;
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const save = (total: number) => money((total * pct) / 100);
  const pay = (total: number) => money(total - (total * pct) / 100);
  const code = v.code || "peplookup";
  const verified = formatDate(v.verified_at);
  return `## Licensed Peptides coupon code: what you get

The Licensed Peptides coupon code **${code}** takes **${pct}% off sitewide**, so it applies to every product in your cart rather than a single item. We last checked that the code works at checkout on **${verified}**. Use the Copy button on this page and paste it into the coupon field at checkout, so no stray spaces or typos stop it from applying.

Licensed Peptides is a research peptide supplier based in the United States that has been selling since ${v.founded || 2025}. At our last price check it was **below the market median price on 23 of the 29 compounds** we compared across suppliers. In other words, the store is already priced lower than most of the market, and the discount code comes off those prices.

### How much the ${pct}% Licensed Peptides discount saves

| Order subtotal | Saving with ${code} | You pay (before shipping) |
| --- | --- | --- |
| $100 | ${save(100)} | ${pay(100)} |
| $250 | ${save(250)} | ${pay(250)} |
| $500 | ${save(500)} | ${pay(500)} |

### Is ${pct}% off a good deal?

A higher percentage is not always the lower final price. A ${pct}% Licensed Peptides discount on a store that already sits below the median price can cost you less than a 20% or 30% code at a supplier with higher list prices. Before you order, compare the **final checkout total** for the exact compounds and quantities you need, including shipping. Our [peptide coupon code list](/coupons) shows the current verified code for every supplier, so you can compare in a few minutes.

### Before you order from Licensed Peptides

- **Check the certificate of analysis (COA)** for each compound and batch you are buying, and note which lab ran the test.
- **Read the shipping and returns policies** on the Licensed Peptides website, as they can change.
- **Use one code per order.** We have not confirmed whether ${code} stacks with sales or other codes.
- **Research use only.** Products are sold for laboratory research, not for human consumption.

If ${code} stops working, [let us know](/contact) and we will re-check the Licensed Peptides promo code and update this page.`;
}

export function couponOverride(slug: string): Override | undefined {
  return OVERRIDES[slug];
}

export function isForceIndexed(slug: string) {
  return !!OVERRIDES[slug]?.forceIndex;
}

/** Extended structured data for a coupon page. Every value mirrors content visible on the page. */
export function richCouponSchema(v: Vendor, settings: Settings, howToSteps: string[], faqs: Faq[], keywords?: string[]) {
  const site = settings.site_url;
  const pageUrl = `${site}/coupons/${v.slug}`;
  const has = v.coupon_active && !!v.code;
  const vendorId = `${pageUrl}#vendor`;
  const offerId = `${pageUrl}#offer`;
  const logo = v.logo_url ? (v.logo_url.startsWith("/") ? `${site}${v.logo_url}` : v.logo_url) : undefined;
  const image = ogImageUrl(settings, `${v.name} coupon code`, has ? `${v.discount_label} with code ${v.code} · verified ${formatDate(v.verified_at)}` : "Partner deal");
  const title = vendorMetaTitle(v);
  const description = vendorMetaDescription(v);

  const vendor = {
    "@type": "Organization",
    "@id": vendorId,
    name: v.name,
    url: v.website_url || undefined,
    logo: logo ? { "@type": "ImageObject", url: logo } : undefined,
    description: v.short_description || undefined,
    foundingDate: v.founded ? String(v.founded) : undefined,
    address: v.country ? { "@type": "PostalAddress", addressCountry: v.country === "United States" ? "US" : v.country } : undefined,
    sameAs: v.website_url ? [v.website_url] : undefined,
  };

  const offer = has
    ? {
        "@type": "Offer",
        "@id": offerId,
        name: `${v.name} coupon code ${v.code}`,
        description: `${v.discount_label} ${(v.applies_to || "sitewide").toLowerCase()} with code ${v.code}`,
        category: "Coupon code",
        url: pageUrl,
        availability: "https://schema.org/InStock",
        validFrom: v.verified_at,
        seller: { "@id": vendorId },
        offeredBy: { "@id": vendorId },
      }
    : null;

  const webPage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    headline: title,
    description,
    inLanguage: settings.lang,
    isPartOf: { "@id": `${site}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: image, width: 1200, height: 630 },
    image,
    dateModified: v.updated_at || v.verified_at,
    lastReviewed: v.verified_at,
    reviewedBy: { "@id": `${site}/#organization` },
    author: { "@type": "Organization", name: settings.author_name, url: settings.author_url },
    publisher: { "@id": `${site}/#organization` },
    about: { "@id": vendorId },
    keywords: (keywords?.length ? keywords : [`${v.name} coupon code`, `${v.name} discount code`, `${v.name} promo code`]).join(", "),
    ...(offer ? { mainEntity: { "@id": offerId } } : {}),
    ...(faqs.length ? { hasPart: { "@id": `${pageUrl}#faq` } } : {}),
  };

  const howTo = {
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    name: `How to use the ${v.name} coupon`,
    description: `Apply the ${v.name} ${has ? `code ${v.code} ` : ""}at checkout in four steps.`,
    totalTime: "PT2M",
    step: howToSteps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, name: `Step ${i + 1}`, text })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [webPage, vendor, ...(offer ? [offer] : []), howTo],
  };
}
