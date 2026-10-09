import { env } from "@/lib/env";
import { liveSiteUrl } from "@/lib/routing/hostname";
import { getPublicSite } from "@/lib/sites/public";

// Always reflect the site's current status (live, paused, preview).
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext<"/s/[slug]/sitemap.xml">) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  if (!site || site.status !== "live") return new Response("Not found", { status: 404 });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${liveSiteUrl(slug, env.rootDomain)}/</loc>
    <lastmod>${new Date(site.updatedAt).toISOString()}</lastmod>
  </url>
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
