import Script from "next/script";
import { getSettings, getVendors, lite } from "@/lib/data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DealProvider } from "@/components/Deal";
import { Interactions } from "@/components/Interactions";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, vendors] = await Promise.all([getSettings(), getVendors()]);
  const top = vendors.filter((v) => v.coupon_active).slice(0, 7);
  // Google Tag Manager (public pages only). Only a valid container ID is ever written into the page.
  const gtm = /^GTM-[A-Z0-9]+$/.test((settings.gtm_id || "").trim()) ? settings.gtm_id.trim() : "";
  return (
    <DealProvider>
      {gtm && (
        <>
          <Script id="gtm" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
          <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" /></noscript>
        </>
      )}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">Skip to content</a>
      <Header siteName={settings.site_name} announcement={settings.announcement} extensionUrl={settings.extension_url} vendors={vendors.map(lite)} />
      <main id="main">{children}</main>
      <Footer settings={settings} topVendors={top} />
      <Interactions />
    </DealProvider>
  );
}
