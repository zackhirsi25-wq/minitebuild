import type { MetadataRoute } from "next";
import { isLegalPublished } from "@/app/(site)/(legal)/unpublished";
import { env } from "@/lib/env";
import { LEGAL_TITLES, type LegalDocId } from "@/lib/legal";
import { appUrl } from "@/lib/routing/hostname";
import { allTemplates } from "@/templates";

// sitemap.xml for Minitebuild's own site (customer sites each have their own
// at <slug>.ROOT_DOMAIN/sitemap.xml). Legal pages are listed only once
// published; previews, build steps, admin and demos never are.
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => appUrl(path, env.rootDomain);
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/templates"), changeFrequency: "weekly", priority: 0.8 },
    ...allTemplates().map((t) => ({
      url: url(`/templates/${t.id}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: url("/credits"), changeFrequency: "monthly", priority: 0.2 },
    ...(Object.keys(LEGAL_TITLES) as LegalDocId[])
      .filter(isLegalPublished)
      .map((id) => ({ url: url(`/${id}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
