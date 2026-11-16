import { ImageResponse } from "next/og";
import { ticketGlyph } from "@/components/TicketGlyph";

export const dynamic = "force-static";

/** 512×512 PNG brand logo (same design as the favicon) for schema.org publisher logo and the web manifest. */
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(180deg,#0b3d80,#081e4c)", borderRadius: 120 }}>
        <svg width="512" height="512" viewBox="0 0 64 64">
          {ticketGlyph("logo-t")}
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
