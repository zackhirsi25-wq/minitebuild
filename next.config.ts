import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
const supabaseIsLocal = !!supabaseUrl && ["127.0.0.1", "localhost"].includes(supabaseUrl.hostname);

const nextConfig: NextConfig = {
  // Cache Components is off on purpose: public sites must answer an unknown
  // address with a real 404 and a live preview with a real redirect, which
  // streamed responses can't do. Site data is cached per slug with
  // unstable_cache and invalidated by tag instead (src/lib/sites).
  cacheComponents: false,
  poweredByHeader: false,
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/object/public/site-images/**",
          },
          {
            // Stock photo library (scripts/stock/upload-stock.mjs).
            protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/object/public/stock/**",
          },
        ]
      : [],
    // Local Supabase serves uploads from 127.0.0.1.
    dangerouslyAllowLocalIP: supabaseIsLocal,
  },
  // Basic security headers on every response (app and customer sites).
  // SAMEORIGIN, not DENY: the template gallery and the admin preview show
  // sites in iframes on the same origin.
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];
    if (process.env.NODE_ENV === "production") {
      headers.push({ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" });
    }
    return [{ source: "/:path*", headers }];
  },
  experimental: {
    serverActions: {
      // Photo uploads (admin: 5 MB, build flow: 10 MB) go through server actions.
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
