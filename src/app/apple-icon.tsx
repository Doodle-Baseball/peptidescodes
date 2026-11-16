import { ImageResponse } from "next/og";
import { ticketGlyph } from "@/components/TicketGlyph";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iPhone / iPad home-screen icon. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(180deg,#0b3d80,#081e4c)" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          {ticketGlyph("apple-t")}
        </svg>
      </div>
    ),
    size,
  );
}
