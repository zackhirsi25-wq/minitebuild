import { env } from "@/lib/env";
import { siteImage } from "@/lib/images/stock";
import { localBusinessJsonLd } from "@/lib/sites/seo";
import type { PublicSite } from "@/lib/sites/public";
import type { TemplateId } from "@/lib/content/schema";
import { JsonLd } from "./parts";
import { BoldTemplate } from "./templates/bold";
import { ClassicTemplate } from "./templates/classic";
import { SplitTemplate } from "./templates/split";

const TEMPLATES = { bold: BoldTemplate, classic: ClassicTemplate, split: SplitTemplate } as const;

/** Renders a business site with its template. `template` overrides the saved one (admin preview). */
export function SiteRenderer({
  site,
  template,
  jsonLdUrl,
}: {
  site: PublicSite;
  template?: TemplateId;
  /** Absolute URL of the live site; when set, LocalBusiness JSON-LD is included. */
  jsonLdUrl?: string;
}) {
  const images = {
    hero: siteImage(site, "hero", env.supabaseUrl),
    about: siteImage(site, "about", env.supabaseUrl),
  };
  const Template = TEMPLATES[template ?? site.template];
  const imageUrl = images.hero.src.startsWith("http") ? images.hero.src : `${jsonLdUrl}${images.hero.src}`;
  return (
    <>
      {jsonLdUrl && <JsonLd data={localBusinessJsonLd(site, jsonLdUrl, imageUrl)} />}
      <Template site={site} images={images} />
    </>
  );
}
