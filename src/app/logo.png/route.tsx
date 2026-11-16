import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/** 512×512 PNG brand logo (same design as the favicon) for schema.org publisher logo and the web manifest. */
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(180deg,#0b3d80,#081e4c)", borderRadius: 120 }}>
        <svg width="512" height="512" viewBox="0 0 64 64">
          <path d="M21 48V16h12.5a10 10 0 0 1 0 20H21" fill="none" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="46.5" cy="45.5" r="5.5" fill="#209b42" stroke="#081e4c" strokeWidth="2" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
