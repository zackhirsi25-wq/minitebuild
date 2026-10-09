import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/site-renderer";
import { env } from "@/lib/env";
import { liveSiteUrl } from "@/lib/routing/hostname";
import { getPublicSite } from "@/lib/sites/public";
import { siteMetadata } from "@/lib/sites/seo";
import { Unavailable } from "./unavailable";

// A live site, reached at <slug>.ROOT_DOMAIN (the proxy rewrites it here).

export async function generateMetadata({ params }: PageProps<"/s/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  if (!site || site.status === "preview") return { title: "Page not found", robots: { index: false } };
  if (site.status === "paused") return { title: site.name, robots: { index: false, follow: false } };
  return siteMetadata(site, { url: liveSiteUrl(site.slug, env.rootDomain), index: true });
}

export default async function LiveSitePage({ params }: PageProps<"/s/[slug]">) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  // Sites that haven't gone live only exist as previews.
  if (!site || site.status === "preview") notFound();
  if (site.status === "paused") return <Unavailable name={site.name} />;
  return <SiteRenderer site={site} jsonLdUrl={liveSiteUrl(site.slug, env.rootDomain)} />;
}
