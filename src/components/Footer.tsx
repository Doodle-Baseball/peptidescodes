import Link from "next/link";
import type { Settings, Vendor } from "@/lib/types";
import { Wordmark } from "./BrandLogo";
import { IconChrome, IconMail, IconPhone, IconWhatsApp } from "./Icons";
import { whatsappUrl } from "@/lib/format";

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.24em] text-white/45">{children}</h3>
);

export function Footer({ settings, topVendors }: { settings: Settings; topVendors: Vendor[] }) {
  const year = new Date().getFullYear();
  const tel = settings.contact_phone.replace(/[^+\d]/g, "");
  const link = "text-[15.5px] text-white/80 transition hover:text-white";
  return (
    <footer className="mt-12 sm:mt-16 overflow-hidden rounded-t-[20px] bg-ink text-white sm:rounded-t-[28px]">
      {/* Columns with vertical dividers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="px-6 py-12 sm:px-10 lg:px-14">
          <Link href="/" aria-label={`${settings.site_name} home`} className="inline-block"><Wordmark light size="lg" /></Link>
          <p className="mt-8 max-w-xs text-[14.5px] leading-relaxed text-white/60">{settings.tagline}. Independent, hand-checked and dated research peptide coupon codes.</p>
          <ul className="mt-6 space-y-3 text-[14.5px]">
            <li><a href={whatsappUrl(settings.contact_phone, "Hi PeptidesCodes, ")} target="_blank" rel="noopener" className="flex items-center gap-2.5 text-white/80 hover:text-white"><IconWhatsApp size={16} /> WhatsApp {settings.contact_phone}</a></li>
            <li><a href={`tel:${tel}`} className="flex items-center gap-2.5 text-white/80 hover:text-white"><IconPhone size={16} /> Call {settings.contact_phone}</a></li>
            <li><a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2.5 text-white/80 hover:text-white"><IconMail size={16} /> {settings.contact_email}</a></li>
          </ul>
          <a href={settings.extension_url} target="_blank" rel="noopener" className="btn btn-white mt-7"><IconChrome size={18} /> Get the Chrome extension</a>
        </div>
        <div className="border-t border-white/10 px-6 py-12 sm:px-10 lg:border-l lg:border-t-0">
          <H>Coupons</H>
          <ul className="mt-6 space-y-4">
            <li><Link href="/coupons" className={link}>All coupon codes</Link></li>
            <li><Link href="/#top-deals" className={link}>Top deals</Link></li>
            <li><Link href="/coupons?sort=discount" className={link}>Biggest discounts</Link></li>
            <li><Link href="/coupons?applies=Sitewide" className={link}>Sitewide codes</Link></li>
            <li><Link href="/vendors" className={link}>Vendors A-Z</Link></li>
          </ul>
        </div>
        <div className="border-t border-white/10 px-6 py-12 sm:px-10 lg:border-l lg:border-t-0">
          <H>Popular vendors</H>
          <ul className="mt-6 space-y-4">
            {topVendors.map((v) => (
              <li key={v.slug}><Link href={`/coupons/${v.slug}`} className={link}>{v.name}</Link></li>
            ))}
          </ul>
        </div>
        <div className="border-t border-white/10 px-6 py-12 sm:px-10 lg:border-l lg:border-t-0">
          <H>Company</H>
          <ul className="mt-6 space-y-4">
            <li><Link href="/about" className={link}>About us</Link></li>
            <li><Link href="/guides" className={link}>Buying guides</Link></li>
            <li><Link href="/extension" className={link}>Chrome extension</Link></li>
            <li><Link href="/contact" className={link}>Contact</Link></li>
          </ul>
          <div className="mt-10"><H>Policies</H></div>
          <ul className="mt-6 space-y-4">
            <li><Link href="/affiliate-disclosure" className={link}>Affiliate disclosure</Link></li>
            <li><Link href="/privacy-policy" className={link}>Privacy policy</Link></li>
            <li><Link href="/terms" className={link}>Terms & conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-7 text-[12.5px] leading-relaxed text-white/50 sm:px-10 lg:px-14">
        <p>
          <strong className="text-white/75">Research use only.</strong> Products sold by listed suppliers are intended for laboratory research use only and are not for human consumption. {settings.site_name} does not sell products and does not provide medical advice. Some links are affiliate links; we may earn a commission at no extra cost to you.
        </p>
        <p className="mt-3">© {year} {settings.publisher_name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
