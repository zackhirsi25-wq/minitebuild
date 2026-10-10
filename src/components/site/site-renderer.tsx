import { env } from "@/lib/env";
import { businessTypeOf, siteImages } from "@/lib/images/stock";
import { localBusinessJsonLd } from "@/lib/sites/seo";
import type { PublicSite } from "@/lib/sites/public";
import { loadTemplate, resolveTemplateId, templateMeta } from "@/templates";
import { pickPalette } from "@/templates/_kit/palette";
import { JsonLd } from "./parts";

/** Renders a business site with its template. `template` overrides the saved one (admin preview). */
export async function SiteRenderer({
  site,
  template,
  palette,
  jsonLdUrl,
}: {
  site: PublicSite;
  template?: string;
  /** Palette id; overrides the saved one (admin preview). */
  palette?: string;
  /** Absolute URL of the live site; when set, LocalBusiness JSON-LD is included. */
  jsonLdUrl?: string;
}) {
  const id = resolveTemplateId(template ?? site.template);
  const meta = templateMeta(id);
  const Template = await loadTemplate(id);
  const images = siteImages(
    site,
    meta.slots.map((s) => s.slot),
    env.supabaseUrl,
  );
  const hero = images.hero;
  const imageUrl = hero ? (hero.src.startsWith("http") ? hero.src : `${jsonLdUrl}${hero.src}`) : undefined;
  return (
    <>
      {jsonLdUrl && <JsonLd data={localBusinessJsonLd(site, jsonLdUrl, imageUrl)} />}
      <Template
        site={{ ...site, businessType: businessTypeOf(site) }}
        images={images}
        palette={pickPalette(meta, site.slug, palette ?? site.palette)}
      />
    </>
  );
}
