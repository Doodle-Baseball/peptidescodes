const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parts(d?: string | null) {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return null;
  return { y: +m[1], mo: +m[2] - 1, d: +m[3] };
}
/** "Nov 13, 2026" */
export function formatDate(d?: string | null) {
  const p = parts(d);
  return p ? `${MONTHS[p.mo]} ${p.d}, ${p.y}` : "";
}
/** "Nov 13" */
export function shortDate(d?: string | null) {
  const p = parts(d);
  return p ? `${MONTHS[p.mo]} ${p.d}` : "";
}
/** "November 2026" */
export function monthYear(d?: string | null) {
  const p = parts(d);
  return p ? `${LONG[p.mo]} ${p.y}` : "";
}
export function initials(name: string) {
  return name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";
}

/** WhatsApp click-to-chat link for a phone number like "+1 (260) 218-1154". */
export function whatsappUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
