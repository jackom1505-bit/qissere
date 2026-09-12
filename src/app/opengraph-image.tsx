import { ImageResponse } from "next/og";

export const alt = "QISSARÉ — The Story That Never Stays Still. Opening 2028.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#120c08", color: "#f7ecda", border: "16px solid #a77c49" }}>
      <div style={{ fontSize: 22, letterSpacing: 7, color: "#c59c68", marginBottom: 36 }}>A CAFÉ COMING TO INDIA · 2028</div>
      <div style={{ fontSize: 112, letterSpacing: 12 }}>QISSARÉ</div>
      <div style={{ fontSize: 32, marginTop: 22 }}>The Story That Never Stays Still.</div>
      <div style={{ fontSize: 22, color: "#c59c68", marginTop: 65 }}>qissare.in</div>
    </div>,
    size,
  );
}
