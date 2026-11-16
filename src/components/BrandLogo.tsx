import Link from "next/link";

/** Square icon, used in the admin panel and favicon. */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="pcmark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b3d80" />
          <stop offset="1" stopColor="#081e4c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#pcmark)" />
      <path d="M21 48V16h12.5a10 10 0 0 1 0 20H21" fill="none" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46.5" cy="45.5" r="5.5" fill="#209b42" stroke="#081e4c" strokeWidth="2" />
    </svg>
  );
}

/** Letter-spaced stacked wordmark: P E P T I D E S / C O D E S */
export function Wordmark({ light = false, size = "md" }: { light?: boolean; size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className={`flex flex-col items-center leading-none ${light ? "text-white" : "text-ink"}`}>
      <span className={`${big ? "text-[40px] tracking-[0.34em] pl-[0.34em]" : "text-[19px] tracking-[0.36em] pl-[0.36em]"} font-normal`}>PEPTIDES</span>
      <span className={`${big ? "mt-3 text-[15px] tracking-[0.62em] pl-[0.62em]" : "mt-[5px] text-[8.5px] tracking-[0.62em] pl-[0.62em]"} font-semibold`}>CODES</span>
    </span>
  );
}

export function BrandLogo({ name = "PeptidesCodes", light = false }: { name?: string; light?: boolean }) {
  return (
    <Link href="/" className="shrink-0" aria-label={`${name} home`}>
      <Wordmark light={light} />
    </Link>
  );
}
