import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 18, props: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const IconSearch = ({ size, ...p }: P) => (<svg {...base(size, p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconCopy = ({ size, ...p }: P) => (<svg {...base(size, p)}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>);
export const IconCheck = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M20 6 9 17l-5-5" /></svg>);
export const IconArrowUpRight = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const IconArrowRight = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconChevronDown = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="m6 9 6 6 6-6" /></svg>);
export const IconChevronLeft = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="m15 18-6-6 6-6" /></svg>);
export const IconChevronRight = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="m9 18 6-6-6-6" /></svg>);
export const IconMenu = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
export const IconX = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const IconShield = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>);
export const IconTag = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="8" cy="8" r="1.5" /></svg>);
export const IconFlask = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3" /><path d="M7 15h10" /></svg>);
export const IconClock = ({ size, ...p }: P) => (<svg {...base(size, p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IconCalendar = ({ size, ...p }: P) => (<svg {...base(size, p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>);
export const IconMail = ({ size, ...p }: P) => (<svg {...base(size, p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const IconWhatsApp = ({ size = 18, ...p }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37A9.78 9.78 0 0 1 2.24 12c0-5.41 4.4-9.8 9.82-9.8 2.62 0 5.08 1.02 6.93 2.88a9.74 9.74 0 0 1 2.87 6.93c0 5.41-4.4 9.8-9.81 9.8Zm8.35-18.15A11.73 11.73 0 0 0 12.05.2C5.54.2.25 5.49.24 12c0 2.08.54 4.11 1.58 5.9L.15 24l6.25-1.64a11.8 11.8 0 0 0 5.64 1.44h.01c6.5 0 11.8-5.3 11.8-11.8 0-3.15-1.23-6.12-3.45-8.35Z" /></svg>);
export const IconPhone =({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" /></svg>);
export const IconSpark = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>);
export const IconGlobe = ({ size, ...p }: P) => (<svg {...base(size, p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>);
export const IconPuzzle = ({ size, ...p }: P) => (<svg {...base(size, p)}><path d="M14 4a2 2 0 1 1 4 0v2h2a1 1 0 0 1 1 1v4h-2a2 2 0 1 0 0 4h2v4a1 1 0 0 1-1 1h-4v-2a2 2 0 1 0-4 0v2H8a1 1 0 0 1-1-1v-4H5a2 2 0 1 1 0-4h2V7a1 1 0 0 1 1-1h6V4Z" /></svg>);
export const IconLock = ({ size, ...p }: P) => (<svg {...base(size, p)}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
export const IconStar = ({ size = 18, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" />
  </svg>
);
export const IconChrome = ({ size = 18, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden {...p}>
    <circle cx="24" cy="24" r="22" fill="#db4437" />
    <path d="M24 24 43.05 13A22 22 0 0 1 26.2 45.9Z" fill="#f4c20d" />
    <path d="M24 24 26.2 45.9A22 22 0 0 1 4.95 13Z" fill="#0f9d58" />
    <circle cx="24" cy="24" r="10" fill="#fff" />
    <circle cx="24" cy="24" r="7.5" fill="#4285f4" />
  </svg>
);
