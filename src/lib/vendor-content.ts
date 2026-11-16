import type { Faq, Vendor } from "./types";
import { formatDate, monthYear } from "./format";

export function vendorTitle(v: Vendor) {
  if (!v.coupon_active || !v.code) return `${v.name} Discount & Partner Deal`;
  return `${v.name} Coupon Code: ${v.discount_label || `${v.discount_percent}% Off`}`;
}

export function vendorH1(v: Vendor) {
  if (v.headline?.trim()) return v.headline.trim();
  if (!v.coupon_active || !v.code) return `${v.name} discount: partner deal`;
  return `${v.name} discount code: ${v.discount_label || `${v.discount_percent}% Off`}`;
}

export function vendorMetaTitle(v: Vendor) {
  if (!v.coupon_active || !v.code) return `${v.name} Discount Code & Deals (${monthYear(v.verified_at)})`;
  return `${v.name} Coupon Code: ${v.discount_percent}% Off (${monthYear(v.verified_at)}) | Verified`;
}

export function vendorMetaDescription(v: Vendor) {
  if (!v.coupon_active || !v.code) return `${v.name} partner deal and discount information, plus verified codes from other research peptide suppliers. Updated ${formatDate(v.verified_at)}.`;
  const scope = (v.applies_to || "sitewide").toLowerCase();
  return `Use ${v.name} coupon code ${v.code} for ${v.discount_percent}% off ${scope === "sitewide" ? "sitewide" : scope}. Verified ${formatDate(v.verified_at)}. Copy the promo code in one click and see how to apply it.`;
}

export function vendorSummary(v: Vendor) {
  if (!v.coupon_active || !v.code)
    return `${v.name} has no public coupon code right now. Use our partner link to shop, and check back, we update this page when a verified code is available. Last checked ${formatDate(v.verified_at)}.`;
  const scope = (v.applies_to || "Sitewide").toLowerCase() === "sitewide" ? "on your whole order" : "on eligible products";
  return `The ${v.name} discount code is **${v.code}**, which takes **${v.discount_label || `${v.discount_percent}% off`}** ${scope}. Copy it, paste it into the coupon box at checkout and check that the saving shows as its own line. Last verified ${formatDate(v.verified_at)}.`;
}

export function vendorFaqs(v: Vendor): Faq[] {
  if (v.faqs && v.faqs.length) return v.faqs;
  const has = v.coupon_active && !!v.code;
  const pct = v.discount_label || `${v.discount_percent}% off`;
  const list: Faq[] = [
    {
      q: `Does ${v.name} have a promo code?`,
      a: has
        ? `Yes. The ${v.name} promo code is ${v.code}, which takes ${pct.toLowerCase()} ${(v.applies_to || "sitewide").toLowerCase() === "sitewide" ? "sitewide" : "on eligible products"}. We last verified it on ${formatDate(v.verified_at)}.`
        : `Not right now. ${v.name} doesn't have a public verified code at the moment, but our partner link may include an offer. We re-check regularly.`,
    },
    {
      q: `Is there a ${v.name} discount code for first orders?`,
      a: has
        ? `You can use ${v.code} on your first order. ${v.open_to?.trim() ? `Eligibility: ${v.open_to}.` : "We could not confirm whether it is limited to new customers, so returning customers should try it too."}`
        : `We haven't found a first-order code for ${v.name}. Check our full coupon list for alternatives.`,
    },
    {
      q: `Why isn't my ${v.name} coupon code working?`,
      a: `Make sure there are no extra spaces, that no other code is already applied, and that the items in your cart are eligible. Some codes also need a minimum order. If it still fails, contact us and we will re-check the code.`,
    },
    {
      q: `Is ${v.name} legit?`,
      a: `${v.short_description || `${v.name} is a research peptide supplier.`} As with any supplier, review the published certificates of analysis (COAs) and shipping and returns policies before ordering.`,
    },
    {
      q: `How much can I save at ${v.name}?`,
      a: has
        ? `With code ${v.code} you save ${pct.toLowerCase()}. On a $200 order that is roughly $${Math.round(200 * (v.discount_percent / 100))} off before shipping.`
        : `Savings depend on the current partner offer. Compare with other suppliers on our coupon list.`,
    },
    {
      q: "Are research peptide coupon codes legal?",
      a: "Coupon codes are ordinary retail discounts offered by the supplier. Research peptides are sold for laboratory research use only and are not for human consumption; check the rules that apply where you live.",
    },
  ];
  return list;
}
