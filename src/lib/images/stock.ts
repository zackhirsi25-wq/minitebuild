import type { ImageOverrides, ImageSlot, Trade } from "@/lib/content/schema";

// Stock images live in public/stock/<trade>/ (see scripts/generate-stock-art.mjs).
// Each business gets a stable pick per slot; the admin can replace any slot
// with an uploaded photo stored in Supabase Storage.

export type SiteImage = { src: string; alt: string; width: number; height: number };

const SIZES: Record<ImageSlot, { width: number; height: number }> = {
  hero: { width: 1600, height: 1067 },
  about: { width: 1200, height: 900 },
};

const STOCK: Record<Trade, Record<ImageSlot, { file: string; alt: string }[]>> = {
  general_contractor: {
    hero: [
      { file: "hero-1.jpg", alt: "Blueprint drawing of a house with framed walls and roof rafters" },
      { file: "hero-2.jpg", alt: "Wood frame of a new house against an evening sky" },
    ],
    about: [
      { file: "about-1.jpg", alt: "Stacked lumber seen from the cut ends" },
      { file: "about-2.jpg", alt: "Steel beams bolted together on a construction site" },
    ],
  },
  remodeling: {
    hero: [
      { file: "hero-1.jpg", alt: "Remodeled kitchen with green lower cabinets and a tile backsplash" },
      { file: "hero-2.jpg", alt: "Updated bathroom with a round mirror, green vanity and subway tile" },
    ],
    about: [
      { file: "about-1.jpg", alt: "Samples of wood, marble, tile and paint laid out for a remodel" },
      { file: "about-2.jpg", alt: "Floor plan sketch of a kitchen, dining room, living room and bath" },
    ],
  },
};

function hash(value: string): number {
  let h = 0;
  for (const ch of value) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function stockImage(trade: Trade, slot: ImageSlot, seed: string): SiteImage {
  const options = STOCK[trade][slot];
  const pick = options[hash(`${seed}:${slot}`) % options.length];
  return { src: `/stock/${trade}/${pick.file}`, alt: pick.alt, ...SIZES[slot] };
}

export function storagePublicUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/site-images/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/** The image to show in a slot: the admin's upload if there is one, otherwise stock. */
export function siteImage(
  site: { slug: string; trade: Trade; images: ImageOverrides },
  slot: ImageSlot,
  supabaseUrl: string,
): SiteImage {
  const override = site.images[slot];
  if (override) {
    return { src: storagePublicUrl(supabaseUrl, override.path), alt: override.alt, ...SIZES[slot] };
  }
  return stockImage(site.trade, slot, site.slug);
}
