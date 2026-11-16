import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getSettings } from "@/lib/data";
import { JsonLd } from "@/components/Content";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#081e4c",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(s.site_url),
    title: { default: s.default_meta_title, template: `%s | ${s.site_name}` },
    description: s.default_meta_description,
    applicationName: s.site_name,
    authors: [{ name: s.author_name, url: s.author_url }],
    creator: s.author_name,
    publisher: s.publisher_name,
    category: "shopping",
    formatDetection: { telephone: false, email: false, address: false },
    verification: {
      google: s.google_site_verification || undefined,
      other: s.bing_site_verification ? { "msvalidate.01": s.bing_site_verification } : undefined,
    },
    other: { "content-language": s.lang },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${s.site_url}/#organization`,
        name: s.publisher_name,
        url: s.site_url,
        logo: { "@type": "ImageObject", url: `${s.site_url}${s.publisher_logo.startsWith("/") ? s.publisher_logo : "/logo.png"}`, width: 512, height: 512 },
        email: s.contact_email,
        telephone: s.contact_phone,
        contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: s.contact_email, telephone: s.contact_phone, availableLanguage: ["English"] }],
        sameAs: [s.extension_url, s.twitter ? `https://x.com/${s.twitter.replace("@", "")}` : ""].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${s.site_url}/#website`,
        url: s.site_url,
        name: s.site_name,
        description: s.default_meta_description,
        inLanguage: s.lang,
        publisher: { "@id": `${s.site_url}/#organization` },
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${s.site_url}/coupons?q={search_term_string}` }, "query-input": "required name=search_term_string" },
      },
    ],
  };

  return (
    <html lang={s.lang || "en-US"} className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "if(!/[?&]static=1/.test(location.search))document.documentElement.classList.add('js')" }} />
        <JsonLd data={org} />
      </head>
      <body className="min-h-screen bg-bone">
        {children}
        {s.ga_measurement_id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.ga_measurement_id}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${s.ga_measurement_id}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
