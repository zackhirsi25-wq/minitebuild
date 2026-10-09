import "server-only";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  imageOverridesSchema,
  siteContentSchema,
  STATUSES,
  TEMPLATES,
  TRADES,
  type ImageOverrides,
} from "@/lib/content/schema";
import type { Database } from "@/lib/supabase/database.types";

// The only way public pages read a business. It calls get_public_site() with
// the publishable key, which returns just the fields a site renders.

const publicSiteSchema = z.object({
  slug: z.string(),
  status: z.enum(STATUSES),
  template: z.enum(TEMPLATES),
  trade: z.enum(TRADES),
  name: z.string(),
  city: z.string(),
  phone: z.string(),
  address: z.string().nullable(),
  hours: z.array(z.string()),
  category: z.string().nullable(),
  content: siteContentSchema,
  images: imageOverridesSchema,
  updatedAt: z.string(),
});

export type PublicSite = z.infer<typeof publicSiteSchema> & { images: ImageOverrides };

export const siteTag = (slug: string) => `site:${slug}`;

async function fetchPublicSite(slug: string): Promise<PublicSite | null> {
  const supabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("get_public_site", { p_slug: slug });
  if (error) throw new Error(`Could not load site "${slug}": ${error.message}`);
  if (!data) return null;
  const parsed = publicSiteSchema.safeParse(data);
  if (!parsed.success) {
    console.error(`Site "${slug}" has invalid stored data`, parsed.error.issues.slice(0, 5));
    return null;
  }
  return parsed.data;
}

/** Cached per slug; admin edits and billing changes call revalidateSite(). */
export async function getPublicSite(slug: string): Promise<PublicSite | null> {
  if (!/^[a-z0-9-]{1,63}$/.test(slug)) return null;
  return unstable_cache(() => fetchPublicSite(slug), ["public-site", slug], {
    tags: [siteTag(slug)],
    revalidate: 3600,
  })();
}

/** Uncached read, for the admin's live preview. */
export async function getPublicSiteFresh(slug: string): Promise<PublicSite | null> {
  return fetchPublicSite(slug);
}
