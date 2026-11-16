import { getSettings, getVendors, lite } from "@/lib/data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DealProvider } from "@/components/Deal";
import { Interactions } from "@/components/Interactions";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, vendors] = await Promise.all([getSettings(), getVendors()]);
  const top = vendors.filter((v) => v.coupon_active).slice(0, 7);
  return (
    <DealProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">Skip to content</a>
      <Header siteName={settings.site_name} announcement={settings.announcement} extensionUrl={settings.extension_url} vendors={vendors.map(lite)} />
      <main id="main">{children}</main>
      <Footer settings={settings} topVendors={top} />
      <Interactions />
    </DealProvider>
  );
}
