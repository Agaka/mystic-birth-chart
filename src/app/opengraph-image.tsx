import { ImageResponse } from "next/og";

export const alt = "Mystic Birth Chart - traditional astrology from the old study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 76px",
          color: "#f4ead7",
          background:
            "radial-gradient(circle at 76% 45%, rgba(184,138,58,0.18), transparent 30%), linear-gradient(135deg, #090705 0%, #211811 58%, #301b17 100%)",
          border: "1px solid rgba(184,138,58,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#d2ad63",
          }}
        >
          Mystic Birth Chart
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
          <div style={{ display: "flex", fontFamily: "Georgia", fontSize: 68, lineHeight: 1.08 }}>
            Your chart is not a list of placements.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "rgba(244,234,215,0.72)" }}>
            Traditional astrology, practical synthesis, and a clear path from free preview to complete reading.
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 21, color: "#d2ad63" }}>
          <span>Free chart preview</span>
          <span>Essential $17</span>
          <span>Complete $97</span>
        </div>
      </div>
    ),
    size,
  );
}
