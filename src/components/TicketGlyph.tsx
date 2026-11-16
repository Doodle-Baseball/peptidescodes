/**
 * Brand icon glyph: two coupon tickets with a % sign, thin clean line style.
 * Front ticket in white; back ticket and % in the accent blue. Drawn on the 64×64 navy square.
 * Keep in sync with src/app/icon.svg.
 * Returns plain SVG elements (not a component) so it also works inside next/og ImageResponse.
 */
const FRONT = "M61 130H454a26 26 0 0 1 26 26V197a72 72 0 0 0 0 111V349a26 26 0 0 1-26 26H61a26 26 0 0 1-26-26V308a72 72 0 0 0 0-111V156a26 26 0 0 1 26-26Z";
const BACK = "M66 132H464a26 26 0 0 1 26 26V337a26 26 0 0 1-26 26H66a26 26 0 0 1-26-26V158a26 26 0 0 1 26-26Z";
const ACCENT = "#6aa8ff";

export function ticketGlyph(id: string) {
  return [
    <defs key="d">
      {/* The back ticket only shows above and below the front ticket. */}
      <clipPath id={id} clipPathUnits="userSpaceOnUse">
        <path d="M-200 -200H800V119H-200Z M-200 386H800V800H-200Z" />
      </clipPath>
    </defs>,
    <g key="g" transform="translate(32 32) scale(0.094) translate(-257 -248)" fill="none" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
      <g clipPath={`url(#${id})`}>
        <path d={BACK} transform="rotate(19 265 247.5)" stroke={ACCENT} />
      </g>
      <path d={FRONT} stroke="#fff" />
      <path d="M128 148V360" stroke="#fff" strokeDasharray="12 38" />
      <g stroke={ACCENT}>
        <circle cx="241" cy="206" r="20" />
        <circle cx="350" cy="302" r="20" />
        <path d="M352 204 240 304" />
      </g>
    </g>,
  ];
}
