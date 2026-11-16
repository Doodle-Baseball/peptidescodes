import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPosts, getSettings, isPagePublished } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { Markdown, PageHero } from "@/components/Content";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSettings(), getPage("guides")]);
  return buildMetadata({ settings, seo: page, path: "/guides", title: page.meta_title || page.title, description: page.meta_description || page.subtitle || "", ogTitle: page.title });
}

export default async function GuidesPage() {
  const [settings, page, posts] = await Promise.all([getSettings(), getPage("guides"), getPosts()]);
  if (!isPagePublished(page)) notFound();
  return (
    <>
      <PageHero crumbs={[{ name: "Guides", href: "/guides" }]} siteUrl={settings.site_url} title={page.title} subtitle={page.subtitle} />
      <section className="bg-bone py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Link key={p.slug} href={`/guides/${p.slug}`} className="group block" data-reveal style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
              <article data-tilt="5" className="card flex h-full flex-col overflow-hidden">
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#0b3d80] via-[#0a2b66] to-ink">
                  {p.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="font-display absolute bottom-4 left-5 right-5 text-[23px] font-semibold leading-tight text-white">{p.title.split(" (")[0]}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <time className="text-[13px] text-muted" dateTime={p.published_at || undefined}>{formatDate(p.published_at)}</time>
                  <h2 className="mt-2 text-[19px] font-bold leading-snug text-ink group-hover:text-navy">{p.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.excerpt}</p>
                  <span className="mt-auto pt-4 text-[14px] font-semibold text-navy">Read guide →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
      {page.content && <section className="py-12 sm:py-16"><div className="container-x max-w-3xl"><Markdown content={page.content} /></div></section>}
    </>
  );
}
