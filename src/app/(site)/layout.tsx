import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { env } from "@/lib/env";
import { appUrl } from "@/lib/routing/hostname";
import { SiteFooter } from "@/components/site-shell/site-footer";
import { SiteNav } from "@/components/site-shell/site-nav";

// Minitebuild's own public pages: home, templates, build, credits. The .mb
// root scopes the design tokens (src/styles/tokens.css); dark by default.

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

// Absolute URLs for the share image and canonical links.
export const metadata: Metadata = { metadataBase: new URL(appUrl("/", env.rootDomain)) };

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`mb ${onest.variable} flex min-h-dvh flex-col`}>
      <a
        href="#main"
        className="absolute top-3 left-3 z-[70] inline-flex min-h-11 items-center rounded-button bg-fg px-4 text-small font-semibold text-canvas [clip-path:inset(50%)] focus-visible:[clip-path:none]"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
