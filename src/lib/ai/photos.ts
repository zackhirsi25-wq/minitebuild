import { z } from "zod";

// Where each uploaded photo goes on the site. Claude looks at the photos and
// suggests a slot, a focal point and alt text; placePhotos() then enforces the
// rules (one photo per main slot, everything else in the gallery, at most six
// gallery photos) so a bad suggestion can't break a page.

export const PHOTO_ROLES = ["hero", "about", "feature", "detail", "gallery"] as const;
export type PhotoRole = (typeof PHOTO_ROLES)[number];

export type PhotoPlacement = { index: number; role: PhotoRole; focal: [number, number]; alt: string };

export const photoPlacementJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["photos"],
  properties: {
    photos: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "role", "focal_x", "focal_y", "alt"],
        properties: {
          index: { type: "integer", description: "Photo number as given, starting at 0." },
          role: {
            type: "string",
            enum: [...PHOTO_ROLES],
            description:
              "hero: wide, strong, room for a headline. about: people at work or the place. feature: a wide closing image. detail: a close-up. gallery: everything else.",
          },
          focal_x: { type: "integer", description: "Horizontal focal point, 0-100 (percent from left)." },
          focal_y: { type: "integer", description: "Vertical focal point, 0-100 (percent from top)." },
          alt: { type: "string", description: "Plain description of what is in the photo, 5-140 characters." },
        },
      },
    },
  },
} as const;

const suggestionSchema = z.object({
  photos: z.array(
    z.object({
      index: z.number().int(),
      role: z.enum(PHOTO_ROLES),
      focal_x: z.number(),
      focal_y: z.number(),
      alt: z.string(),
    }),
  ),
});

export const PHOTO_SYSTEM_PROMPT = `You place a local business's own photos on its new one-page website. For each photo, choose where it fits best, where the important part is (the focal point, so cropping keeps it), and write alt text.

Roles: hero (at most one; the strongest wide photo, with calm space for a headline), about (at most one; people at work or the place itself), feature (at most one; a wide image for the closing section), detail (at most one; a close-up of materials, products or tools), gallery (everything else).

Alt text describes only what is visible, in plain words, without guessing names, places or claims. No "image of" or "photo of".`;

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
const cleanAlt = (alt: string) =>
  alt
    .replace(/\s+/g, " ")
    .replace(/^(an? )?(image|photo|picture) of /i, "")
    .trim()
    .slice(0, 140);

/**
 * Turns Claude's suggestion (or nothing) into a valid placement for `count`
 * photos: each photo once, each main role at most once, at most six gallery
 * photos, missing main roles filled in order, alt text always present.
 */
export function placePhotos(count: number, suggestion: unknown, fallbackAlt: string): PhotoPlacement[] {
  const parsed = suggestionSchema.safeParse(suggestion);
  const byIndex = new Map<number, PhotoPlacement>();
  const taken = new Set<PhotoRole>();
  if (parsed.success) {
    for (const p of parsed.data.photos) {
      if (p.index < 0 || p.index >= count || byIndex.has(p.index)) continue;
      const role: PhotoRole = p.role !== "gallery" && taken.has(p.role) ? "gallery" : p.role;
      if (role !== "gallery") taken.add(role);
      const alt = cleanAlt(p.alt);
      byIndex.set(p.index, {
        index: p.index,
        role,
        focal: [clamp(p.focal_x), clamp(p.focal_y)],
        alt: alt.length >= 5 ? alt : fallbackAlt,
      });
    }
  }
  const out: PhotoPlacement[] = [];
  for (let i = 0; i < count; i++) {
    out.push(byIndex.get(i) ?? { index: i, role: "gallery", focal: [50, 50], alt: fallbackAlt });
  }
  // Give every empty main slot a photo from the gallery, hero first.
  for (const role of ["hero", "about", "feature", "detail"] as const) {
    if (out.some((p) => p.role === role)) continue;
    const spare = out.find((p) => p.role === "gallery");
    if (spare) spare.role = role;
  }
  let gallery = 0;
  return out.filter((p) => p.role !== "gallery" || ++gallery <= 6);
}
