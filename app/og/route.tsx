import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "800px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: "64px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.1 }}>Yeshua-Christ</div>
        <div style={{ marginTop: 24, fontSize: 36, opacity: 0.9 }}>
          A place to share faith, the Gospel, and the Word of God freely.
        </div>
        <div style={{ marginTop: 42, fontSize: 28, opacity: 0.9 }}>#YeshuaChrist</div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    },
  );
}
