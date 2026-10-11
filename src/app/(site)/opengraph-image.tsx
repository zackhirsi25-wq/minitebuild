import { ImageResponse } from "next/og";
import { formatPrice, product } from "@/config/product";

// Social share image for Minitebuild's own pages (customer sites are separate).

export const alt = `${product.name}: a website for your business, built while you wait`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "radial-gradient(60% 70% at 50% 35%, #1b1d22 0%, #0b0c0e 70%)",
        color: "#edeef0",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="44" height="44" viewBox="0 0 24 24">
          <path
            fill="#edeef0"
            fillRule="evenodd"
            d="M5 2.5h14A2.5 2.5 0 0 1 21.5 5v14a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 19V5A2.5 2.5 0 0 1 5 2.5Zm4.5 19v-6a2.5 2.5 0 0 1 5 0v6h-5ZM6 6.5h12V8H6V6.5Z"
          />
        </svg>
        <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1 }}>{product.name.toLowerCase()}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, maxWidth: 900 }}>
          A website for your business, built while you wait.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, color: "#9a9da5" }}>
          <span>Name, city and phone. We do the rest.</span>
          <span style={{ width: 10, height: 10, borderRadius: 10, background: "#ffb547" }} />
          <span>{formatPrice(product.plans.monthly.price)} a month when you go live</span>
        </div>
      </div>
    </div>,
    size,
  );
}
