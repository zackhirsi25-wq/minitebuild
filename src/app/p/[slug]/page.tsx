import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PreviewBanner } from "@/components/preview-banner";
import { SiteRenderer } from "@/components/site/site-renderer";
import { env } from "@/lib/env";
import { liveSiteUrl } from "@/lib/routing/hostname";
import { getPublicSite } from "@/lib/sites/public";
import { siteTitle } from "@/lib/sites/seo";

// Preview of a generated site at /p/<slug>. Never indexed (see also the
// X-Robots-Tag header set in proxy.ts). Redirects to the live address once
// the site is live.

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  return {
    title: site ? `Preview: ${siteTitle(site)}` : "Page not found",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function PreviewPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  if (!site) notFound();
  if (site.status === "live") redirect(liveSiteUrl(site.slug, env.rootDomain));

  return (
    <>
      <PreviewBanner name={site.name} slug={site.slug} />
      <SiteRenderer site={site} />
    </>
  );
}
