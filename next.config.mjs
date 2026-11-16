/** @type {import('next').NextConfig} */

// On Vercel, preview deployments (*.vercel.app) must never be indexed — only production.
const isPreview = !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: { unoptimized: true },
  devIndicators: false,
  async headers() {
    return [
      { source: "/:path*", headers: [...securityHeaders, ...(isPreview ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : [])] },
      { source: "/logos/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, immutable" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};
export default nextConfig;
