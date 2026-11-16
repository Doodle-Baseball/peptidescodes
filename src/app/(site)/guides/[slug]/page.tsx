import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPosts, getPost, getSettings, getVendors, lite } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { Breadcrumbs, FaqList, JsonLd, Markdown, faqJsonLd } from "@/components/Content";
import { VendorLogo } from "@/components/VendorLogo";
import { CodeChip } from "@/components/Deal";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, p] = await Promise.all([getSettings(), getPost(slug)]);
  if (!p) return { title: "Not found", robots: { index: false } };
  return buildMetadata({ settings, seo: p, path: `/guides/${p.slug}`, title: p.meta_title || p.title, description: p.meta_description || p.excerpt || "", ogTitle: p.title, ogSub: "Guide", type: "article", publishedTime: p.published_at, modifiedTime: p.updated_at || p.published_at });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const [settings, p, posts, vendors] = await Promise.all([getSettings(), getPost(slug), getPosts(), getVendors()]);
  if (!p) notFound();
  const author = p.author?.trim() || settings.author_name;
  const faqs = p.faqs || [];
  const top = vendors.filter((v) => v.coupon_active && v.code).slice(0, 5);
  const url = `${settings.site_url}/guides/${p.slug}`;
  const words = (p.content || "").split(/\s+/).length;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.meta_description || p.excerpt,
          image: p.cover_image || `${settings.site_url}/api/og?t=${encodeURIComponent(p.title)}`,
          datePublished: p.published_at,
          dateModified: p.updated_at || p.published_at,
          inLanguage: settings.lang,
          wordCount: words,
          mainEntityOfPage: url,
          author: { "@type": "Person", name: author, url: settings.author_url },
          publisher: { "@id": `${settings.site_url}/#organization` },
        }}
      />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <article>
        <header className="bg-hero border-b border-line">
          <div className="container-x max-w-4xl py-12 sm:py-16">
            <Breadcrumbs siteUrl={settings.site_url} items={[{ name: "Guides", href: "/guides" }, { name: p.title, href: `/guides/${p.slug}` }]} />
            <h1 className="h-display mt-6 text-[36px] text-ink sm:text-[52px]">{p.title}</h1>
            {p.excerpt && <p className="mt-5 text-[18px] leading-relaxed text-muted">{p.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] text-muted">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3d80] to-ink text-[13px] font-bold text-white">{author.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <span>By <Link href="/about" className="font-semibold text-ink hover:text-navy" rel="author">{author}</Link></span>
              <span>·</span>
              <time dateTime={p.published_at || undefined}>{formatDate(p.published_at)}</time>
              <span>·</span>
              <span>{Math.max(1, Math.round(words / 220))} min read</span>
            </div>
          </div>
        </header>
        <div className="container-x grid grid-cols-1 gap-12 py-14 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 max-w-3xl">
            {p.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.cover_image} alt={p.title} className="mb-8 w-full rounded-2xl" />
            )}
            <Markdown content={p.content} />
            {faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="h-display mb-6 text-[30px] text-ink">Frequently asked questions</h2>
                <FaqList faqs={faqs} />
              </div>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">Top codes right now</h2>
              <ul className="mt-4 space-y-4">
                {top.map((v) => (
                  <li key={v.slug} className="space-y-2">
                    <Link href={`/coupons/${v.slug}`} className="flex items-center gap-2.5 font-semibold text-ink hover:text-navy">
                      <VendorLogo name={v.name} src={v.logo_url} size={30} /> <span className="flex-1 truncate">{v.name}</span>
                      <span className="text-[13px] font-bold text-deal">{v.discount_percent}%</span>
                    </Link>
                    <CodeChip v={lite(v)} size="sm" source="guide" />
                  </li>
                ))}
              </ul>
              <Link href="/coupons" className="btn btn-primary btn-sm mt-5 w-full">All coupon codes</Link>
            </div>
            <div className="card p-5">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">More guides</h2>
              <ul className="mt-3 space-y-3">
                {posts.filter((x) => x.slug !== p.slug).slice(0, 4).map((x) => (
                  <li key={x.slug}><Link href={`/guides/${x.slug}`} className="text-[15px] font-semibold leading-snug text-ink hover:text-navy">{x.title}</Link></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
