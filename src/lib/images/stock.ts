import type { ImageOverrides, ImageSlot, Trade } from "@/lib/content/schema";
import { inferBusinessType, type BusinessType } from "@/lib/business-type";
import stockIndex from "../../../public/stock/index.json";

// Every image slot shows the owner's upload if there is one. Otherwise hero,
// about, feature and detail fall back to stock photos for the business's
// niche (public/stock/index.json, built by scripts/stock/fetch-stock.mjs; the
// files live in the public Supabase bucket "stock"). Photos are picked by a
// hash of the slug and never repeat within a site. Gallery slots stay empty on
// real sites, so stock photos never pass as the business's own work; demo
// sites in the template gallery fill them from the niche's gallery photos.

export type SiteImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
  /** Focal point in percent, [x, y], used as object-position. */
  focal: [number, number];
  /** True for the owner's upload, false for stock. */
  owned: boolean;
};

export type StockEntry = {
  order: number;
  file: string;
  width: number;
  height: number;
  alt: string;
  avg_color?: string;
  blur?: string;
  focal?: [number, number];
  pexels_id: number;
  photographer: string;
  /** Null for photos ingested by hand (no profile link in the file name). */
  photographer_url: string | null;
  source_url: string;
};

type StockSlot = "hero" | "about" | "gallery" | "detail";

export type StockNiche = {
  label: string;
  google_types: string[];
  keywords: string[];
  slots: Partial<Record<StockSlot, StockEntry[]>>;
};

// JSON imports widen tuples to number[]; the ingest scripts always write [x, y].
export const STOCK_INDEX = stockIndex as unknown as Record<string, StockNiche>;
export const FALLBACK_NICHE = "general-business";

/** Which stock slots, in order, can fill each site slot. */
const SLOT_SOURCES: Partial<Record<ImageSlot, StockSlot[]>> = {
  hero: ["hero"],
  about: ["about", "gallery"],
  feature: ["hero", "gallery"],
  detail: ["detail", "gallery"],
};

function hash(value: string): number {
  let h = 2166136261;
  for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** "Roofing contractor" -> "roofing_contractor", the shape of Google's place types. */
export function googleTypeFromCategory(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function keywordHit(text: string, keyword: string): boolean {
  const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}`).test(text.toLowerCase());
}

/**
 * The stock niche for a business: its Google type first, then keywords in its
 * name (then in the category), else the general-business fallback.
 */
export function nicheFor(
  site: { name: string; category: string | null },
  index: Record<string, StockNiche> = STOCK_INDEX,
): string {
  const entries = Object.entries(index).filter(([id]) => id !== FALLBACK_NICHE);
  if (site.category) {
    const type = googleTypeFromCategory(site.category);
    const byType = entries.find(([, n]) => n.google_types.includes(type));
    if (byType) return byType[0];
  }
  for (const text of [site.name, site.category ?? ""]) {
    if (!text) continue;
    const byKeyword = entries.find(([, n]) => n.keywords.some((k) => keywordHit(text, k)));
    if (byKeyword) return byKeyword[0];
  }
  return FALLBACK_NICHE;
}

export function storagePublicUrl(supabaseUrl: string, path: string, bucket = "site-images"): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/**
 * The niche whose photos a site uses. A niche without photos yet falls back to
 * general-contractor for contractors and general-business for everyone else;
 * with neither, slots stay empty and templates render their typographic hero.
 */
/** Whether a business would get stock hero photos (used to hide demo types that have none yet). */
export function hasStockPhotos(site: { name: string; category: string | null }, index = STOCK_INDEX): boolean {
  return (nicheEntry(site, index)?.slots.hero?.length ?? 0) > 0;
}

function nicheEntry(site: { name: string; category: string | null }, index: Record<string, StockNiche>) {
  const own = index[nicheFor(site, index)];
  if (own) return own;
  return businessTypeOf(site) === "contractor" ? index["general-contractor"] : index[FALLBACK_NICHE];
}

function fromStock(entry: StockEntry, supabaseUrl: string): SiteImage {
  return {
    src: storagePublicUrl(supabaseUrl, entry.file, "stock"),
    alt: entry.alt,
    width: entry.width,
    height: entry.height,
    blurDataURL: entry.blur,
    focal: entry.focal ?? [50, 50],
    owned: false,
  };
}

/** Fixed bounds of an uploaded image (uploads are re-encoded within them). */
const UPLOAD_SIZE = { width: 2400, height: 1600 };

type SiteLike = { slug: string; name: string; category: string | null; trade: Trade; images: ImageOverrides };

export function businessTypeOf(site: { name: string; category: string | null }): BusinessType {
  return inferBusinessType(site.name, site.category);
}

/**
 * Every requested slot's image for a site, or null where there is nothing real
 * to show. `demo` fills gallery slots with stock (template gallery only).
 */
export function siteImages(
  site: SiteLike,
  slots: readonly ImageSlot[],
  supabaseUrl: string,
  opts: { demo?: boolean; index?: Record<string, StockNiche> } = {},
): Record<ImageSlot, SiteImage | null> {
  const index = opts.index ?? STOCK_INDEX;
  const niche = nicheEntry(site, index);
  const used = new Set<number>();
  const out = {} as Record<ImageSlot, SiteImage | null>;

  const take = (sources: StockSlot[], seed: string): StockEntry | null => {
    for (const source of sources) {
      const list = (niche?.slots[source] ?? []).filter((p) => !used.has(p.pexels_id));
      if (!list.length) continue;
      const pick = list[hash(`${site.slug}:${seed}`) % list.length];
      used.add(pick.pexels_id);
      return pick;
    }
    return null;
  };

  // Owner uploads first, so stock never fills a slot they've claimed.
  for (const slot of slots) {
    const override = site.images[slot];
    out[slot] = override
      ? {
          src: storagePublicUrl(supabaseUrl, override.path),
          alt: override.alt,
          width: override.width ?? UPLOAD_SIZE.width,
          height: override.height ?? UPLOAD_SIZE.height,
          blurDataURL: override.blur,
          focal: override.focal ?? [50, 50],
          owned: true,
        }
      : null;
  }
  for (const slot of slots) {
    if (out[slot]) continue;
    const sources = slot.startsWith("gallery-") ? (opts.demo ? (["gallery"] as StockSlot[]) : []) : SLOT_SOURCES[slot];
    const entry = sources?.length ? take(sources, slot) : null;
    if (entry) out[slot] = fromStock(entry, supabaseUrl);
  }
  return out;
}

/** One slot's image (admin photo panel). */
export function siteImage(site: SiteLike, slot: ImageSlot, supabaseUrl: string): SiteImage | null {
  return siteImages(site, [slot], supabaseUrl)[slot];
}
