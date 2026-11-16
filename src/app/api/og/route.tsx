import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Dynamic Open Graph image: /api/og?t=Title&s=Subtitle */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("t") || "Peptide Coupon Codes").slice(0, 90);
  const sub = (searchParams.get("s") || "Verified research peptide discount codes").slice(0, 120);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #f9f8f4 0%, #ffffff 45%, #dfe9f9 100%)", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 68, height: 68, borderRadius: 18, background: "linear-gradient(135deg,#073774,#2f73ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40, fontWeight: 800 }}>%</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: "#081e4c" }}>
            Peptides<span style={{ color: "#2f73ff" }}>Codes</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: title.length > 40 ? 64 : 78, fontWeight: 800, color: "#081e4c", lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#5b6478" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", padding: "12px 22px", borderRadius: 999, background: "#e8f5ec", color: "#17733a", fontSize: 26, fontWeight: 700 }}>✓ Verified & dated codes</div>
          <div style={{ fontSize: 26, color: "#073774", fontWeight: 700 }}>peptidescodes.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
