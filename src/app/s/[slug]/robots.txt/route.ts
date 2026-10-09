import { env } from "@/lib/env";
import { liveSiteUrl } from "@/lib/routing/hostname";
import { getPublicSite } from "@/lib/sites/public";

// Always reflect the site's current status (live, paused, preview).
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext<"/s/[slug]/robots.txt">) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  const live = site?.status === "live";
  const body = live
    ? `User-agent: *\nAllow: /\n\nSitemap: ${liveSiteUrl(slug, env.rootDomain)}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
