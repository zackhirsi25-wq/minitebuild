import type { Metadata, Viewport } from "next";
import { THEME_SCRIPT } from "@/components/site-shell/theme-script";
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
    // THEME_SCRIPT may set data-mb-theme before hydration, hence suppressHydrationWarning.
    // It only affects Minitebuild's own pages (styles scoped to .mb).
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
