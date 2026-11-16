import Link from "next/link";
import { marked } from "marked";
import type { Faq } from "@/lib/types";

marked.setOptions({ gfm: true, breaks: false });

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Markdown({ content, className = "" }: { content?: string | null; className?: string }) {
  if (!content?.trim()) return null;
  const html = marked.parse(content, { async: false }) as string;
  return <div className={`prose-pc ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <details key={i} className="faq" open={i === 0}>
          <summary className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6">
            <h3 className="text-[17px] font-medium tracking-[-0.01em] text-[#1f1f1f]">{f.q}</h3>
            <span className="faq-icon" aria-hidden />
          </summary>
          <div className="faq-body px-6 pb-7 text-[15.5px] leading-[1.8] text-[#5a5a5a] sm:px-8">{f.a}</div>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ items, siteUrl, light = false }: { items: Crumb[]; siteUrl: string; light?: boolean }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={`text-[14px] ${light ? "text-white/70" : "text-muted"}`}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden className="opacity-50">›</span>}
              {i < all.length - 1 ? (
                <Link href={c.href} className="transition-colors hover:text-navy">{c.name}</Link>
              ) : (
                <span aria-current="page" className={light ? "text-white" : "text-ink/80"}>{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${siteUrl}${c.href === "/" ? "/" : c.href}` })),
        }}
      />
    </>
  );
}

export function SectionHeading({
  eyebrow, title, sub, dark = false, center = false, as = "h2",
}: { eyebrow?: string; title: React.ReactNode; sub?: React.ReactNode; dark?: boolean; center?: boolean; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`} data-reveal>
      {eyebrow && <div className={`eyebrow ${dark ? "!text-peri" : ""} ${center ? "justify-center" : ""}`}>{eyebrow}</div>}
      <H className={`h-display mt-3 text-[32px] sm:text-[44px] ${dark ? "text-white" : "text-ink"}`}>{title}</H>
      {sub && <p className={`mt-4 text-[17px] leading-relaxed ${dark ? "text-white/70" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}

/** Inner-page hero used by coupons, vendors, guides and static pages. */
export function PageHero({ crumbs, siteUrl, title, subtitle, children }: { crumbs: Crumb[]; siteUrl: string; title: string; subtitle?: string | null; children?: React.ReactNode }) {
  return (
    <section className="bg-hero relative overflow-hidden border-b border-line">
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(180deg,#000,transparent)]" />
      <div className="container-x relative py-12 sm:py-16">
        <Breadcrumbs items={crumbs} siteUrl={siteUrl} />
        <h1 className="h-display mt-6 max-w-4xl text-[38px] text-ink sm:text-[56px]">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-[17.5px] leading-relaxed text-muted">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
