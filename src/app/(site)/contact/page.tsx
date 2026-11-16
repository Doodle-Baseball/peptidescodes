import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getSettings, isPagePublished } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, Markdown, PageHero } from "@/components/Content";
import { ContactForm } from "@/components/Forms";
import { IconClock, IconMail, IconPhone, IconWhatsApp } from "@/components/Icons";
import { externalRel, whatsappUrl } from "@/lib/format";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSettings(), getPage("contact")]);
  return buildMetadata({ settings, seo: page, path: "/contact", title: page.meta_title || page.title, description: page.meta_description || page.subtitle || "", ogTitle: page.title });
}

export default async function ContactPage() {
  const [settings, page] = await Promise.all([getSettings(), getPage("contact")]);
  if (!isPagePublished(page)) notFound();
  const tel = settings.contact_phone.replace(/[^+\d]/g, "");
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: page.title, url: `${settings.site_url}/contact`, mainEntity: { "@id": `${settings.site_url}/#organization` } }} />
      <PageHero crumbs={[{ name: "Contact", href: "/contact" }]} siteUrl={settings.site_url} title={page.title} subtitle={page.subtitle} />
      <section className="bg-bone py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <a href={`mailto:${settings.contact_email}`} className="card card-hover flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b3d80] to-ink text-white"><IconMail size={22} /></span>
              <span><span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-muted">Email</span><span className="font-semibold text-ink">{settings.contact_email}</span></span>
            </a>
            <a href={whatsappUrl(settings.contact_phone, "Hi PeptidesCodes, ")} target="_blank" rel={externalRel(whatsappUrl(settings.contact_phone))} className="card card-hover flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white"><IconWhatsApp size={24} /></span>
              <span><span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-muted">WhatsApp</span><span className="font-semibold text-ink">{settings.contact_phone}</span></span>
            </a>
            <a href={`tel:${tel}`} className="card card-hover flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b3d80] to-ink text-white"><IconPhone size={22} /></span>
              <span><span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-muted">Phone</span><span className="font-semibold text-ink">{settings.contact_phone}</span></span>
            </a>
            <div className="card flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone text-ink"><IconClock size={22} /></span>
              <span><span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-muted">Response time</span><span className="font-semibold text-ink">Within one business day</span></span>
            </div>
            <div className="card p-6"><Markdown content={page.content} className="!text-[15.5px]" /></div>
          </div>
          <ContactForm to={settings.contact_email} />
        </div>
      </section>
    </>
  );
}
