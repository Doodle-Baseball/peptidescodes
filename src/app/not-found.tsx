import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="bg-hero flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <BrandLogo />
      <p className="font-display mt-10 text-[140px] font-semibold leading-none text-ink">404</p>
      <h1 className="mt-4 text-[28px] font-bold text-ink">This page has expired, like a bad coupon.</h1>
      <p className="mt-3 max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist. The codes below definitely do.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/coupons" className="btn btn-primary">See all coupon codes</Link>
        <Link href="/" className="btn btn-ghost">Back to home</Link>
      </div>
    </div>
  );
}
