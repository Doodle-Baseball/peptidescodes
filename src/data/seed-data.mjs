// Seed data for PeptidesCodes. Used (1) as a fallback when Supabase tables are
// empty or not yet created, and (2) to generate supabase/seed.sql.
// Edit live data in /admin — this file only matters for first setup.

export const TODAY = "2026-11-13";

// [name, discount %, code, affiliate url, short description, featured]
const RAW = [
  ["Ascension Peptides", 50, "products", "https://ascensionpeptides.com/ref/products/", "Ascension Peptides is a U.S. research peptide supplier selling since 2023. Its prices sit above the market median on most compounds we compared.", true],
  ["Vortex Research", 30, "adamadam", "https://vortexresearch.net/?ref=adamadam", "Vortex Research is a U.S. research peptide supplier launched in 2026, with 21 products, 10 linked COA reports and a 30% discount code.", true],
  ["Kalyx Labs", 25, "adamdan", "https://kalyx-labs.com/?ref=peplookup", "Kalyx Labs is a U.S. research peptide supplier launched in 2026. It lists 23 compounds and was below the market median on 12 of the 22 we compared.", true],
  ["Nura Peptide", 20, "PEPLOOKUP", "https://nurapeptide.com/?ref=153", "Nura Peptide is a U.S.-based supplier of research peptides, selling vials, capsules and nasal sprays for laboratory use only.", true],
  ["Amino Club", 20, "PRODUCTS", "https://aminoclub.com?utm_source=affiliate_marketing&code=PRODUCTS", "Amino Club is a U.S. research peptide supplier selling since 2019. At our last check it was below the market median price on all 28 compounds we compared.", true],
  ["MsAmino", 20, "W9QVLNLY", "https://msamino.com?ref=W9QVLNLY", "MsAmino is a U.S. research peptide supplier launched in 2026. It links 32 COA reports, but its prices sit above the market median.", true],
  ["Amino Science", 20, "PRODUCTS", "https://aminoscience.io?ref=PRODUCTS", "Amino Science is a U.S. research peptide supplier. It links 24 COA reports, but its prices sit above the market median.", true],
  ["Pepvida Labs", 20, "PEPLOOKUP", "https://pepvidalabs.com/aff/27/", "Pepvida Labs is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 18 of the 23 compounds we compared.", true],
  ["Cielo Crew", 20, "PEPTOOKUP", "", "Cielo Crew is a U.S. research peptide supplier launched in 2026. It lists 20 compounds and was below the market median on 10 of the 20 we compared.", false],
  ["Pure Amino", 20, "PRODUCTS", "https://www.pureamino.com/?ref=PRODUCTS", "Pure Amino is a U.S. research peptide supplier selling since 2015. It lists 11 compounds and was below the market median on 6 of the 11 we compared.", false],
  ["Peptides Canada", 15, "PEPLOOKUP", "https://peptidescanada.store/?ref=PEPLOOKUP", "Peptides Canada is a Canadian research peptide supplier launched in 2026. At our last check it was below the market median price on 24 of the 27 compounds we compared.", false],
  ["Sparta Labs", 15, "PEPLOOKUP", "https://spartalabs.net/us/store?aff=PEPLOOKUP", "Sparta Labs is a U.S. research peptide supplier launched in 2026. It lists 26 compounds and was below the market median on 8 of the 26 we compared.", false],
  ["Apex Peptides Lab", 15, "peplookup", "https://apexpeptideslab.com/?coupon=peplookup", "Apex Peptides Lab is a U.S. research peptide supplier launched in 2026. It links 19 COA reports, but its prices sit above the market median.", false],
  ["Rejuven8 Peptides", 15, "adam15", "https://rejuven8peptides.com/?aff=peplookup", "Rejuven8 Peptides is a U.S. research peptide supplier selling since 2025. It lists 28 compounds and was below the market median on 12 of the 28 we compared.", false],
  ["RIVN Research", 15, "adamdan668815", "https://rivnresearch.com/?sld=3866", "RIVN Research is a U.S. research peptide supplier launched in 2026. It lists 26 compounds and was below the market median on 9 of the 24 we compared.", false],
  ["Ares Research Lab", 15, "PRODUCTS", "https://aresresearchlab.com?ref=PRODUCTS", "Ares Research Lab is a U.S. research peptide supplier launched in 2026. It lists 10 compounds and was below the market median on 4 of the 10 we compared.", false],
  ["99 Purity Peptides", 15, "adam-dan", "https://99puritypeptides.com/ref/PEPLOOKUP", "99 Purity Peptides is a U.S. research peptide supplier selling since 2025. It lists 12 compounds and was below the market median on 4 of the 12 we compared.", false],
  ["BioPeptide Technologies", 15, "peplookup", "https://biopeptitech.com/peplookup", "BioPeptide Technologies is a U.S. research peptide supplier selling since 2023. It lists 21 compounds and was below the market median on 8 of the 21 we compared.", false],
  ["HEEZ Research", 15, "peplookup", "https://heezresearch.com/?ref=peplookup", "HEEZ Research is a U.S. research peptide supplier launched in 2026. It links 10 COA reports, but its prices sit above the market median.", false],
  ["Pivot Labs", 15, "adamdan", "https://pivotlabsglobal.com/?ref=peplookup", "Pivot Labs is a U.S. research peptide supplier selling since 2024. Its prices sit above the market median on most compounds we compared.", false],
  ["AminoVault", 15, "PEPLOOKUP", "https://aminovault.com/crew/112/", "AminoVault is a U.S. research peptide supplier selling since 2025. It links 4 COA reports, but its prices sit above the market median.", false],
  ["Dynotides", 15, "PEPLOOKUP", "https://dynotides.shop/?aff=31", "Dynotides is a U.S. research peptide supplier launched in 2026. It links 14 COA reports, but its prices sit above the market median.", false],
  ["Peptixa Labs", 15, "ADAMD", "https://peptixalabs.com/?ic=ADAMD", "Peptixa Labs is a small U.S. research peptide supplier launched in 2026. It sells 9 products, links a COA for every compound, and offers 15% off with code ADAMD.", false],
  ["Disguised Alpha", 10, "PEPLOOKUP", "https://disguisedalpha.com/?coupon=peplookup", "Disguised Alpha is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 26 of the 31 compounds we compared.", false],
  ["Biologix Labs", 10, "PEPLOOKUP", "https://www.biologixlabsresearch.com/r/PEPLOOKUP", "Biologix Labs is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 22 of the 24 compounds we compared.", false],
  ["Peptide Labs Inc", 10, "PEPLOOKUP", "https://peptidelabsinc.com/?aff=PEPLOOKUP", "Peptide Labs Inc is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on all 29 compounds we compared.", false],
  ["Royal Peptides", 10, "PEPLOOKUP", "https://royal-peptides.com/?ref=peplookup", "Royal Peptides is a research peptide supplier selling since 2024. It lists 24 compounds and was below the market median on 15 of the 24 we compared.", false],
  ["Peptide Giants", 10, "adamdan", "https://peptidegiants.com/?ref=peplookup", "Peptide Giants is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 27 of the 30 compounds we compared.", false],
  ["Axon Chems", 10, "Dlj7pbr", "https://axonchems.com/aff/Dlj7pbr", "Axon Chems is a U.S. research peptide supplier launched in 2026. It lists 27 compounds and was below the market median on 11 of the 27 we compared.", false],
  ["American Peptides", 10, "peplookup", "https://www.americanpeptides.us/discount/PEPLOOKUP?ref=uzmxt6yada", "American Peptides is a new U.S. supplier, launched in 2026. It links a lab report on 47 of its 53 products, but its prices usually sit above the market median.", false],
  ["Peptide Titans", 10, "products", "https://peptidetitans.com/ref/PEPLOOKUP", "Peptide Titans is a U.S. research peptide supplier launched in 2026. It lists 27 compounds and was below the market median on 14 of the 27 we compared.", false],
  ["ZC Labs", 10, "PEPLOOKUP", "https://zclabs.shop/?ea_ref=PEPLOOKUP", "ZC Labs is a U.S. research peptide supplier launched in 2026. At our last check it had the lowest price per mg on 8 of the 19 compounds we could compare.", false],
  ["Eon Peptides", 10, "PEPLOOKUP", "https://eonpeptides.com/?utm_source=affiliate_marketing&code=PEPLOOKUP", "Eon Peptides is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on all 25 compounds we compared.", false],
  ["Elite Edge Biotech", 10, "10ADAMDAN668", "https://eliteedgebiotech.com/ref/74/", "Elite Edge Biotech is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 24 of the 28 compounds we compared.", false],
  ["Renova Peptides", 10, "peplookup", "https://renovapeptides.net/?ref=peplookup", "Renova Peptides is a research peptide supplier selling since 2025. At our last check it was below the market median price on all 13 compounds we compared.", false],
  ["NeuroLabs Research", 10, "PEPLOOKUP", "https://neurolabsresearch.com/?ref=PEPLOOKUP", "NeuroLabs Research is a U.S. research peptide supplier selling since 2025. It lists 27 compounds and was below the market median on 8 of the 25 we compared.", false],
  ["Prpeps", 10, "peplookup", "https://prpeps.com?ref=66", "Prpeps is a U.S. research peptide supplier selling since 2025. It lists 29 compounds and was below the market median on 10 of the 29 we compared.", false],
  ["Peppy&Me", 10, "peplookup", "https://peppyandme.com/?ref=peplookup", "Peppy&Me is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 22 of the 24 compounds we compared.", false],
  ["Void Research", 10, "PEPLOOKUP", "https://voidresearch.shop/?ref=PEPLOOKUP", "Void Research is a research peptide supplier launched in 2026. It lists 27 compounds and was below the market median on 13 of the 22 we compared.", false],
  ["HLX Labs", 10, "products", "https://hlxlabs.shop/?ref=peplookup", "HLX Labs is a U.S. research peptide supplier launched in 2026. It lists 23 compounds and was below the market median on 12 of the 22 we compared.", false],
  ["Elite Research Lab", 10, "adamdan", "https://www.eliteresearchlab.com/?ref=peplookup", "Elite Research Lab is a U.S. research peptide supplier selling since 2025. It lists 25 compounds and was below the market median on 13 of the 25 we compared.", false],
  ["Vertex Labs", 10, "products", "https://vertexpeptideslab.org/?coupon=products", "Vertex Labs (Vertex Peptides Lab) is a U.S. research peptide supplier launched in 2026. We link 23 of its COA reports, and all 39 listings we track were in stock.", false],
  ["Alpha Peptides", 10, "peplookup", "https://alpha-peptides.com/aff/peplookup/", "Alpha Peptides is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 20 of the 23 compounds we compared.", false],
  ["Crownwell Research", 10, "peplookup", "https://crownwellresearch.com/afref/ax9/?campaign=tes&sub_id=peplookup", "Crownwell Research is a U.S. research peptide supplier launched in 2026. It lists 18 compounds and was below the market median on 12 of the 18 we compared.", false],
  ["NextGen Peps", 10, "PEPLOOKUP", "https://nextgenpeps.com?ref=PEPLOOKUP", "NextGen Peps is a research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.", false],
  ["PuraTek Peptides", 10, "PEPLOOKUP", "https://puratekpeptides.com/ref/370/", "PuraTek Peptides is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 25 of the 26 compounds we compared.", false],
  ["Synthesis Peptides", 10, "PEPLOOKUP", "https://synthesispeptides.co/?synthaff=PEPLOOKUP", "Synthesis Peptides is a U.S. research peptide supplier launched in 2026. It links 23 COA reports, but its prices sit above the market median.", false],
  ["Qureshi Labs", 10, "PEPLOOKUP", "https://qureshilabs.com/?utm_source=partner&code=PEPLOOKUP", "Qureshi Labs is a U.S. research peptide supplier launched in 2026. It lists 21 compounds and was below the market median on 6 of the 21 we compared.", false],
  ["Blank Peptides", 10, "peplookup", "https://blankpeptides.com/r/peplookup", "Blank Peptides is a U.S. research peptide supplier launched in 2026. It links 27 COA reports and offers overnight shipping, but its prices sit above the market median.", false],
  ["Bioinfinity", 10, "adamdaFAKR", "https://bioinfinity.co?ref=peplookup", "Bioinfinity is a U.S. research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.", false],
  ["Prime Peptide Solutions", 10, "PEPLOOKUP", "https://primepepsolutions.com/?ref=PEPLOOKUP", "Prime Peptide Solutions is a U.S. research peptide supplier launched in 2026. It lists 25 compounds and was below the market median on 9 of the 25 we compared.", false],
  ["Simms Research", 10, "PEPLOOKUP", "https://simmsresearch.com/?sr_ref=PEPLOOKUP", "Simms Research is a U.S. research peptide supplier launched in 2026. Its prices sit above the market median on most compounds we compared.", false],
  ["GenPeptide", 10, "adamdan", "https://www.genpeptide.com/?ref=peplookup", "GenPeptide is a research peptide supplier selling since 2025. It lists 22 compounds and was below the market median on 15 of the 22 we compared.", false],
  ["Axis Peptide Labs", 10, "peplookup", "https://axispeptidelabs.com/ref/peplookup/", "Axis Peptide Labs is a U.S. research peptide supplier launched in 2026. Its COAs come from Janoshik and we link 15 of them, but its prices sit above the market median.", false],
  ["RAMP Peptides", 10, "products", "https://ramppeptides.com/?coupon=products", "RAMP Peptides is a U.S. research peptide supplier launched in 2026. It lists 23 compounds and was below the market median on 17 of the 23 we compared.", false],
  ["Palmetto Peptides", 10, "PRODUCTS", "https://palmettopeptides.com/?ref=PRODUCTS", "Palmetto Peptides is a U.S. research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.", false],
  ["Vantage Aminos", 10, "peplookup", "https://vantageaminos.co/ref/peplookup/", "Vantage Aminos is a U.S. research peptide supplier launched in 2026. It links 6 COA reports, but its prices sit above the market median.", false],
  ["Aminexa", 10, "products", "https://aminexa.net/r/products", "Aminexa is a U.S. research peptide supplier launched in 2026. Its prices sit above the market median on most compounds we compared.", false],
  ["Blue Ridge Peptides", 10, "products", "https://blueridgepeptides.com/?coupon=products", "Blue Ridge Peptides is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 22 of the 23 compounds we compared.", false],
  ["Ameano Peptides", 10, "PEPLOOKUP", "https://ameanopeptides.com/?ref=PEPLOOKUP", "Ameano Peptides is a U.S. research peptide supplier selling since 2025. It lists 21 compounds and was below the market median on 9 of the 21 we compared.", false],
  ["Arizen BioLabs", 10, "PEPLOOKUP", "https://arizenbiolabs.com/ref/PEPLOOKUP", "Arizen BioLabs is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 13 of the 17 compounds we compared.", false],
  ["True Peptides", 10, "PEPLOOKUP", "https://true-peptides.com/?ref=products", "True Peptides is a U.S. research peptide supplier selling since 2025. Its prices sit above the market median on most compounds we compared.", false],
  ["Ventra Sciences", 10, "PRODUCTS", "https://ventrasciences.com/go/PRODUCTS/", "Ventra Sciences is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 13 of the 17 compounds we compared.", false],
  ["Ech3lon Labs", 10, "PRODUCTS", "https://ech3lonlabs.com/?ref=PRODUCTS", "Ech3lon Labs is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on all 15 compounds we compared.", false],
  ["Elevate Research Co", 10, "PRODUCTS", "https://elevateresearchco.com/?ref=PRODUCTS", "Elevate Research Co is a U.S. research peptide supplier launched in 2026. It lists 16 compounds and was below the market median on 8 of the 16 we compared.", false],
  ["Trusted Peps", 10, "products", "https://trustedpeps.us/?aff=13", "Trusted Peps is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 14 of the 15 compounds we compared.", false],
  ["LA Peptides", 10, "ADAMDAN", "https://lapeptides.net/?ref=peplookup", "LA Peptides is a U.S. research peptide supplier selling since 2025. It lists 11 compounds and was below the market median on 3 of the 11 we compared.", false],
  ["Bionova Peptides", 10, "peplookup", "", "Bionova Peptides is a U.S. research peptide supplier launched in 2026. It lists 16 compounds and was below the market median on 6 of the 16 we compared.", false],
  ["IDUN Peptides", 10, "PEPLOOKUP", "https://idunpeptides.com/?ref=PEPLOOKUP", "IDUN Peptides is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on 14 of the 15 compounds we compared.", false],
  ["Elytra Labs", 10, "PRODUCTS", "https://elytralabs.shop/?aff=PRODUCTS", "Elytra Labs is a U.S. research peptide supplier launched in 2026. At our last check it was below the market median price on all 13 compounds we compared.", false],
  ["GenX", 10, "peplookup", "https://genx.bio/ref/31/", "GenX is a U.S. research peptide supplier selling since 2017. Its prices sit above the market median on most compounds we compared.", false],
  ["Pepvida", 10, "ADAM", "https://pepvida.com/?ref=peplookup", "Pepvida is a Canadian research peptide supplier selling since 2025. It links 8 COA reports, but its prices sit above the market median.", false],
  ["Peptix USA", 10, "peplookup", "https://peptixusa.com?ref=peplookup", "Peptix USA is a small U.S. research peptide supplier launched in 2026. It lists 5 products, and its BPC-157 was below the market median price at our last check.", false],
  ["Licensed Peptides", 5, "peplookup", "https://licensedpeptides.com/ref/peplookup/", "Licensed Peptides is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on 23 of the 29 compounds we compared.", false],
  ["Reta One Labs", 5, "peplookup", "https://retaonelabs.com/ref/owc70/", "Reta One Labs is a U.S. research peptide supplier selling since 2025. At our last check it was below the market median price on all 15 compounds we compared.", false],
];

// Partner stores with an affiliate link but no public code yet.
const LINK_ONLY = [
  ["The Peptide Labs", "https://thepeptidelabs.ca/ref/165/", "The Peptide Labs is a Canadian research peptide supplier. We have a partner link but no verified public code yet."],
  ["Peak Lab Peptides", "https://peaklabpeptides.com?afref=a1n9", "Peak Lab Peptides is a research peptide supplier. We have a partner link but no verified public code yet."],
  ["Aero Peptides", "https://aeropeptides.com/?ref=peplookup", "Aero Peptides is a research peptide supplier. We have a partner link but no verified public code yet."],
  ["Pristine Aminos", "https://pristineaminos.com/aff/18/", "Pristine Aminos is a research peptide supplier. We have a partner link but no verified public code yet."],
  ["Kylo Peptides", "https://kylopeptides.com/?wpam_id=163", "Kylo Peptides is a research peptide supplier. We have a partner link but no verified public code yet."],
  ["Pure Peptides", "https://purepeptides.com?ref=ADAMDAN9789", "Pure Peptides is a research peptide supplier. We have a partner link but no verified public code yet."],
  ["PS Peptides", "https://pspeptides.com/?ref=peplookup-com", "PS Peptides is a research peptide supplier. We have a partner link but no verified public code yet."],
];

export function slugify(s) {
  return s.toLowerCase().replace(/&/g, "-and-").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function parseFacts(desc) {
  const founded = (desc.match(/(?:since|launched in)\s+(\d{4})/) || [])[1];
  const compounds = (desc.match(/lists (\d+) (?:compounds|products)|sells (\d+) products/) || []).slice(1).find(Boolean);
  const coa = (desc.match(/links (\d+) COA|link (\d+) of (?:its|them)|link (\d+) of its COA/) || []).slice(1).find(Boolean);
  const country = /Canadian/.test(desc) ? "Canada" : /U\.S\./.test(desc) ? "United States" : "";
  return {
    founded: founded ? Number(founded) : null,
    compounds: compounds ? Number(compounds) : null,
    coa_count: coa ? Number(coa) : null,
    country,
  };
}

const LOGO_EXT = {}; // populated by scripts/fetch-logos.mjs via public/logos/index.json at runtime

export const seedVendors = [
  ...RAW.map(([name, pct, code, url, desc, featured], i) => {
    const slug = slugify(name);
    const host = hostOf(url);
    return {
      slug,
      name,
      logo_url: `/logos/${slug}.png`,
      website_url: host ? `https://${host}` : "",
      affiliate_url: url,
      code,
      discount_percent: pct,
      discount_label: `${pct}% Off`,
      applies_to: "Sitewide",
      coupon_active: true,
      featured: !!featured,
      sort_order: i + 1,
      verified_at: TODAY,
      short_description: desc,
      about: "",
      ...parseFacts(desc),
      shipping_info: "",
      payment_methods: "",
      testing_lab: /Janoshik/.test(desc) ? "Janoshik Analytical" : "",
      faqs: [],
      meta_title: "",
      meta_description: "",
      keywords: "",
      canonical_url: "",
      og_image: "",
      noindex: false,
      published: true,
    };
  }),
  ...LINK_ONLY.map(([name, url, desc], i) => {
    const slug = slugify(name);
    const host = hostOf(url);
    return {
      slug, name, logo_url: `/logos/${slug}.png`, website_url: host ? `https://${host}` : "", affiliate_url: url,
      code: "", discount_percent: 0, discount_label: "Partner deal", applies_to: "Sitewide", coupon_active: false,
      featured: false, sort_order: 200 + i, verified_at: TODAY, short_description: desc, about: "",
      ...parseFacts(desc), shipping_info: "", payment_methods: "", testing_lab: "", faqs: [], meta_title: "",
      meta_description: "", keywords: "", canonical_url: "", og_image: "", noindex: false, published: true,
    };
  }),
];
void LOGO_EXT;

export const seedSettings = {
  site_name: "PeptidesCodes",
  tagline: "Verified peptide coupon codes",
  site_url: "https://peptidescodes.com",
  lang: "en-US",
  publisher_name: "PeptidesCodes",
  publisher_logo: "/logo.png",
  author_name: "PeptidesCodes Editorial Team",
  author_url: "https://peptidescodes.com/about",
  author_bio: "The PeptidesCodes team checks research peptide coupon codes by hand, records the date of every check and lists the result.",
  contact_email: "info@peptidescodes.com",
  contact_phone: "+1 (260) 218-1154",
  extension_url: "https://chromewebstore.google.com/detail/pogbkndeefgihpmgpgidimjapbocfckd?utm_source=item-share-cb",
  extension_name: "Verified Peptides Promo Code & Coupons | PepLookup",
  twitter: "",
  default_meta_title: "Peptide Coupon Codes & Discount Codes (Verified) | PeptidesCodes",
  default_meta_description: "Verified research peptide coupon codes and discount codes from 80+ suppliers, up to 50% off. Every code is checked and dated.",
  default_keywords: "peptide coupon code, peptide discount code, peptide promo code, research peptides coupon, peptides codes",
  default_og_image: "",
  google_site_verification: "",
  bing_site_verification: "",
  ga_measurement_id: "",
  announcement: "New: get verified peptide codes automatically with our free Chrome extension",
};

export const seedPages = [
  {
    slug: "home",
    title: "Peptide Coupon & Discount Codes",
    subtitle: "Copy a verified peptide coupon code from 80+ research peptide suppliers, up to 50% off. Every promo code is checked by hand and dated.",
    content: "## Peptide coupon codes, checked and dated\n\nPeptidesCodes lists working **peptide coupon codes**, **peptide discount codes** and **peptide promo codes** for research peptide suppliers in the United States, Canada and beyond. Instead of a long list of expired codes, every entry shows the discount, whether it is sitewide or limited to eligible products, and the date we last confirmed it.\n\n### How to pick the best peptide discount code\n\n- **Compare the final price, not just the percentage.** A 10% code at a cheaper store can beat a 30% code elsewhere. Our guide on [comparing peptide prices after a discount](/guides/compare-peptide-prices-after-discount) shows the maths.\n- **Check the COA.** A discount only matters if the product is what the label says. Learn [how to read a peptide COA](/guides/how-to-read-a-peptide-coa).\n- **Use one code per order.** Most vendors don't allow stacking.\n\n### Research use only\n\nProducts sold by the suppliers listed here are for laboratory research use only. PeptidesCodes does not sell peptides or give medical advice.",
    faqs: [
      { q: "What is a peptide coupon code?", a: "A peptide coupon code is a short text code a research peptide supplier accepts at checkout for a discount, usually a percentage off eligible products or the whole order. Copy the code here, paste it into the store's coupon box and check that the saving appears before you pay." },
      { q: "Are the codes on PeptidesCodes verified?", a: "Yes. Each code shows the date we last checked it. We apply codes in a real cart where possible and remove or flag codes that stop working." },
      { q: "Which peptide supplier has the biggest discount right now?", a: "The table on this page is sorted by discount. The highest current code is listed first, and the top deals section shows our featured offers." },
      { q: "Can I combine two peptide coupon codes?", a: "Most suppliers accept one code per order. Unless a vendor page says stacking is confirmed, plan on using a single code." },
      { q: "Does PeptidesCodes sell peptides?", a: "No. PeptidesCodes is an independent coupon directory. We don't sell products or give medical advice. Products from listed suppliers are for laboratory research use only." },
      { q: "How do you make money?", a: "Some links on this site are affiliate links. If you buy after clicking one, the supplier may pay us a commission at no extra cost to you. It does not change the discount you get." },
    ],
    meta_title: "Peptide Coupon Codes & Discount Codes | Up to 50% Off | PeptidesCodes",
    meta_description: "Verified peptide coupon codes and promo codes from 80+ research peptide vendors, up to 50% off. Copy a code in one click, every code is checked and dated.",
    keywords: "peptide coupon code, peptide discount code, peptide promo code, research peptide coupon, peptides codes",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "coupons",
    title: "All Peptide Promo Codes & Coupons",
    subtitle: "Every peptide promo code we track, from 5% to 50% off. Search by vendor, filter by discount or offer type, and copy a code in one click.",
    content: "",
    faqs: [
      { q: "How often are these peptide promo codes updated?", a: "We re-check codes on a rolling basis and show the last verified date beside every code." },
      { q: "What does 'Sitewide' mean?", a: "A sitewide code applies to the whole order. 'Eligible products' means the vendor limits the code to certain items." },
    ],
    meta_title: "All Peptide Promo Codes & Coupons (Verified List) | PeptidesCodes",
    meta_description: "The full list of verified peptide promo codes and coupons, sorted by discount. Filter by vendor, discount or offer type and copy a code in one click.",
    keywords: "peptide promo codes, peptide coupons list, research peptide discount codes",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "vendors",
    title: "Research Peptide Vendors A-Z",
    subtitle: "Every research peptide supplier we track, with its current coupon code, discount and verification date.",
    content: "",
    faqs: [],
    meta_title: "Research Peptide Vendors A-Z With Coupon Codes | PeptidesCodes",
    meta_description: "Browse every research peptide vendor we track, A to Z, with current coupon codes, discounts, COA counts and verification dates.",
    keywords: "peptide vendors, research peptide suppliers, peptide vendor list",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "guides",
    title: "Peptide Buying Guides",
    subtitle: "Plain-English guides to using peptide coupon codes, reading certificates of analysis and comparing prices.",
    content: "", faqs: [],
    meta_title: "Peptide Buying Guides | Coupons, COAs & Price Comparison | PeptidesCodes",
    meta_description: "Guides on using peptide coupon codes, reading a peptide certificate of analysis (COA) and comparing peptide prices per mg after a discount.",
    keywords: "peptide guide, how to read peptide COA, peptide price per mg",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "extension",
    title: "Get Peptide Coupon Codes Automatically",
    subtitle: "Our free Chrome extension shows a verified code and the supplier's rating the moment you open a supported peptide store.",
    content: "## How it works\n\n1. Visit a supported supplier's website.\n2. If we have a verified code for that store, the extension icon shows a badge and a small card appears with the discount and the code.\n3. Click **Activate offer**, then copy the code or fill it into the store's coupon field.\n4. Press the store's own Apply button to see your discount.\n\n## Privacy first\n\n- Runs only on supported supplier websites\n- Does not read or collect your browsing history\n- Does not collect personal information, passwords or payment details\n- Your settings are stored locally in your browser\n\n## Affiliate disclosure\n\nWhen you click **Activate offer**, we may earn a commission from the supplier at no extra cost to you. Offers are only activated when you click, and the extension never replaces another site's referral.",
    faqs: [
      { q: "Is the extension free?", a: "Yes. The extension is free to install and use." },
      { q: "Does the extension place orders or submit forms?", a: "No. Auto-fill is off by default and the extension never submits forms or places orders for you." },
      { q: "Which browsers are supported?", a: "Google Chrome and Chromium-based browsers that can install extensions from the Chrome Web Store, such as Brave and Edge." },
    ],
    meta_title: "Peptide Coupon Code Chrome Extension (Free) | PeptidesCodes",
    meta_description: "Install our free Chrome extension to see verified peptide promo codes on 80+ supplier sites and apply them in one click. No browsing history collected.",
    keywords: "peptide coupon extension, peptide promo code chrome extension, peplookup extension",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "about",
    title: "About PeptidesCodes",
    subtitle: "An independent directory of verified research peptide coupon codes.",
    content: "## What we do\n\nPeptidesCodes collects coupon and promo codes from research peptide suppliers, checks them, and lists each one with the date of our last check. You can copy a code in one click and go straight to the store.\n\n## How we verify codes\n\n1. **We source the code** directly from the supplier or its partner program.\n2. **We test it** in a real cart where the store allows it, and note whether it is sitewide or limited to eligible products.\n3. **We date it.** Every code shows the day we last confirmed it worked.\n4. **We remove dead codes.** If a code stops working, we update or flag it.\n\n## Independence\n\nWe don't sell peptides and we don't give medical advice. Some links are affiliate links, which is how the site is funded; a commission never changes the discount you receive. Read our [affiliate disclosure](/affiliate-disclosure).\n\n## Research use only\n\nProducts sold by listed suppliers are intended for laboratory research use only and are not for human consumption.",
    faqs: [],
    meta_title: "About PeptidesCodes | How We Verify Peptide Coupon Codes",
    meta_description: "PeptidesCodes is an independent directory of verified research peptide coupon codes. Learn how we source, test and date every code.",
    keywords: "about peptidescodes, peptide coupon verification",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "contact",
    title: "Contact Us",
    subtitle: "Found a code that doesn't work, or want your store listed? Get in touch.",
    content: "We usually reply within one business day. Suppliers who want to be listed or update a code can use the form and include the store URL.",
    faqs: [],
    meta_title: "Contact PeptidesCodes | Report a Code or List Your Store",
    meta_description: "Contact PeptidesCodes to report a peptide coupon code that doesn't work, suggest a supplier, or list your research peptide store.",
    keywords: "contact peptidescodes",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "affiliate-disclosure",
    title: "Affiliate Disclosure",
    subtitle: "How PeptidesCodes is funded.",
    content: "PeptidesCodes is reader-supported. Some links on this website are affiliate links. If you click one and make a purchase, the supplier may pay us a commission **at no extra cost to you**.\n\nAffiliate relationships do not change the discount a code gives you, and we list codes from suppliers whether or not we have a partner agreement with them.\n\nCoupon codes such as partner codes may be tied to our affiliate account with the supplier.\n\nIf you have questions, email us at info@peptidescodes.com.",
    faqs: [],
    meta_title: "Affiliate Disclosure | PeptidesCodes",
    meta_description: "How PeptidesCodes is funded: some links are affiliate links and we may earn a commission at no extra cost to you.",
    keywords: "", canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    subtitle: "What we collect and why.",
    content: "## Information we collect\n\n- **Contact form:** your name, email and message, used only to reply to you.\n- **Newsletter:** your email address, used only to send code updates. You can unsubscribe at any time.\n- **Click statistics:** when you click a deal we record which vendor was clicked and when, without personal identifiers, so we can see which codes are useful.\n\n## Cookies\n\nWe use only essential storage needed for the site to work. Supplier websites you visit through our links have their own privacy policies and may set affiliate cookies.\n\n## Your rights\n\nTo access or delete data you have sent us, email info@peptidescodes.com.",
    faqs: [],
    meta_title: "Privacy Policy | PeptidesCodes",
    meta_description: "The PeptidesCodes privacy policy: what information we collect, how we use it, and how to contact us.",
    keywords: "", canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "terms",
    title: "Terms of Use & Research Disclaimer",
    subtitle: "Please read before using this website.",
    content: "## Information only\n\nPeptidesCodes publishes coupon codes and supplier information for convenience. Codes, prices and terms are set by suppliers and can change without notice. Always confirm the discount at checkout before paying.\n\n## Research use only\n\nProducts sold by suppliers listed on this website are intended for **laboratory research use only**. They are not drugs, foods or cosmetics and are not for human or veterinary use. Nothing on this site is medical advice.\n\n## No endorsement\n\nListing a supplier is not an endorsement. Do your own due diligence, including reviewing certificates of analysis.\n\n## Limitation of liability\n\nPeptidesCodes is not responsible for purchases made on third-party websites.",
    faqs: [],
    meta_title: "Terms of Use & Research Disclaimer | PeptidesCodes",
    meta_description: "Terms of use for PeptidesCodes and the research-use-only disclaimer for products sold by listed peptide suppliers.",
    keywords: "", canonical_url: "", og_image: "", noindex: false,
  },
];

export const seedPosts = [
  {
    slug: "how-to-use-a-peptide-coupon-code",
    title: "How to Use a Peptide Coupon Code (and Make Sure It Worked)",
    excerpt: "A step-by-step guide to applying a research peptide promo code at checkout, plus the five most common reasons a code fails.",
    cover_image: "/guides/how-to-use-a-peptide-coupon-code.svg",
    author: "",
    published: true,
    published_at: "2026-11-10",
    content: "Applying a coupon code takes under a minute, but a few small mistakes cause most failed codes. Here is the process we use when we verify codes.\n\n## Step 1: Copy the exact code\n\nUse the **Copy** button on PeptidesCodes rather than typing the code. Codes can be case sensitive, and a stray space at the end is the most common reason a code is rejected.\n\n## Step 2: Open the store through the deal link\n\nClick **Get deal** to open the supplier. Some partner codes are tied to the referral link, so opening the store through it helps make sure the discount is credited.\n\n## Step 3: Add eligible products to your cart\n\nCheck whether the code is **Sitewide** or limited to **Eligible products**. Our vendor pages show this for every code.\n\n## Step 4: Paste the code at checkout\n\nFind the field labelled *coupon*, *promo code* or *discount code*, usually on the cart page or the first checkout step. Paste and press **Apply**.\n\n## Step 5: Check the discount line\n\nBefore paying, confirm the discount appears as its own line in the order summary and that the total dropped by the expected amount.\n\n## Why isn't my peptide coupon code working?\n\n1. **Extra spaces or wrong case.** Paste the code again.\n2. **Another code is already applied.** Most stores accept one code per order.\n3. **Items aren't eligible.** Sale items or bundles are often excluded.\n4. **Minimum order not met.** Some codes need a minimum cart value.\n5. **The code has expired.** Check the verified date on our page and try the next-best code.\n\nIf a code still fails, [contact us](/contact) and we will re-check it.",
    faqs: [
      { q: "Are peptide coupon codes case sensitive?", a: "Some stores treat codes as case sensitive. Copying the code with the Copy button avoids the problem." },
      { q: "Can I use a coupon code on sale items?", a: "It depends on the supplier. Many exclude items that are already discounted." },
    ],
    meta_title: "How to Use a Peptide Coupon Code (Step-by-Step) | PeptidesCodes",
    meta_description: "Learn how to apply a research peptide coupon code at checkout, check the discount worked, and fix the 5 most common reasons a promo code fails.",
    keywords: "how to use peptide coupon code, peptide promo code not working",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "how-to-read-a-peptide-coa",
    title: "How to Read a Peptide Certificate of Analysis (COA)",
    excerpt: "What purity, identity and batch numbers on a peptide COA actually mean, and the red flags to look for before you order.",
    cover_image: "/guides/how-to-read-a-peptide-coa.svg",
    author: "",
    published: true,
    published_at: "2026-11-08",
    content: "A certificate of analysis (COA) is a lab report for a specific batch of a product. For research peptides, it is the main evidence that what is in the vial matches the label.\n\n## The parts of a COA\n\n- **Product name and amount** | for example *BPC-157, 10 mg*. It should match the vial you buy.\n- **Batch or lot number** | the COA must refer to the same batch printed on your product. A COA for a different batch tells you little.\n- **Testing laboratory** | the name of the lab that ran the test. Independent third-party labs carry more weight than in-house testing.\n- **Test date** | recent tests are more relevant than reports that are years old.\n- **Purity (HPLC)** | high-performance liquid chromatography reports the percentage of the sample that is the target compound. Research suppliers often report 98-99%+.\n- **Identity (mass spectrometry)** | MS confirms the molecular mass matches the expected peptide.\n- **Quantity** | some labs also measure the actual amount of peptide in the vial versus the labelled amount.\n\n## Red flags\n\n1. No batch number, or a batch number that doesn't match your product.\n2. A report that can't be verified with the testing lab.\n3. Purity reported without a chromatogram.\n4. The same COA reused across many products or years.\n\n## Use COAs alongside coupon codes\n\nA large discount is only worth it if the product is what it claims to be. Our vendor pages show how many COAs a supplier publishes where we have that data.",
    faqs: [
      { q: "What purity should a research peptide COA show?", a: "Many research suppliers report HPLC purity of 98% or higher. Always check that the COA matches your batch." },
      { q: "What is HPLC on a COA?", a: "High-performance liquid chromatography, a test that separates the sample to estimate what percentage is the target compound." },
    ],
    meta_title: "How to Read a Peptide COA (Certificate of Analysis) | PeptidesCodes",
    meta_description: "Learn how to read a research peptide certificate of analysis: batch numbers, HPLC purity, mass spec identity, test dates and the red flags to watch for.",
    keywords: "how to read peptide coa, peptide certificate of analysis, peptide hplc purity",
    canonical_url: "", og_image: "", noindex: false,
  },
  {
    slug: "compare-peptide-prices-after-discount",
    title: "How to Compare Peptide Prices After a Discount",
    excerpt: "The biggest percentage off isn't always the cheapest order. Here's how to compare research peptide prices per mg after a coupon code.",
    cover_image: "/guides/compare-peptide-prices-after-discount.svg",
    author: "",
    published: true,
    published_at: "2026-11-05",
    content: "A 50% coupon at an expensive store can cost more than a 10% coupon at a cheaper one. Comparing the **price per milligram after the discount** is the fairest way to decide.\n\n## The formula\n\n**Price per mg = (list price × (1 − discount)) ÷ mg in the vial**\n\nExample: a 10 mg vial listed at $60 with a 20% code costs $48, or **$4.80 per mg**. A 10 mg vial at $45 with a 10% code costs $40.50, or **$4.05 per mg**, cheaper despite the smaller discount.\n\n## Don't forget shipping\n\nAdd shipping to the total before dividing, especially on small orders. Some suppliers offer free shipping over a threshold, which can change the result.\n\n## Check the quantity and the COA\n\nMake sure you are comparing the same compound and the same vial size, and that each supplier publishes a recent certificate of analysis. Read our guide on [how to read a peptide COA](/guides/how-to-read-a-peptide-coa).\n\n## Use the codes\n\nOnce you have picked a supplier, grab its code from our [full coupon list](/coupons).",
    faqs: [
      { q: "Is the biggest discount always the best deal?", a: "No. Compare the final price per mg after the discount and shipping, not the percentage off." },
    ],
    meta_title: "How to Compare Peptide Prices Per mg After a Discount | PeptidesCodes",
    meta_description: "Why the biggest peptide coupon isn't always cheapest: learn to compare research peptide prices per mg after the discount and shipping, with worked examples.",
    keywords: "peptide price per mg, compare peptide prices, cheapest peptide vendor",
    canonical_url: "", og_image: "", noindex: false,
  },
];
