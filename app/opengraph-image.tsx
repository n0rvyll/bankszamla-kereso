/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #6366f1 40%, #111827 100%)",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          <div>Bankszámlaszám kereső</div>
          <div style={{ fontSize: 28, fontWeight: 500, opacity: 0.9 }}>
            Első 8 számjegy alapján bank és fiók (MNB adat)
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
