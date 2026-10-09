import type { Metadata, Viewport } from "next";
import "./globals.css";

// The root layout is shared by the Minitebuild app and every customer site, so
// it stays neutral: no fonts, no branding. Each area loads its own font.

export const metadata: Metadata = {
  title: { default: "Website", template: "%s" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
