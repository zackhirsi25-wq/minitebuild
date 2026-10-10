import type { BusinessType } from "@/lib/business-type";
import type { ImageSlot } from "@/lib/content/schema";
import type { SiteImage } from "@/lib/images/stock";
import type { PublicSite } from "@/lib/sites/public";

// The contract between the app and a template folder. A template folder holds:
//   meta.ts       TemplateMeta (default export)
//   Template.tsx  the component (default export), server component
//   tokens.css    spacing, radius and colour tokens, scoped to its root class
//   demo.ts       TemplateDemo (default export): which demo business it shows
//   thumb-desktop.png, thumb-mobile.png   rendered by `npm run templates:thumbs`
// scripts/build-template-registry.mjs finds folders and writes the registry.

export type StyleTag = "dark" | "light" | "bold" | "elegant" | "warm" | "story";

export type SlotSpec = {
  slot: ImageSlot;
  /** CSS aspect-ratio of the frame, e.g. "16 / 9". "fill" = full-bleed, any ratio. */
  aspect: string;
  label: string;
};

export type Palette = {
  id: string;
  name: string;
  /** Custom properties set on the template root, without the leading "--". */
  vars: Record<string, string>;
};

export type TemplateMeta = {
  id: string;
  name: string;
  /** One sentence for the gallery. */
  concept: string;
  /** Position in the gallery. */
  order: number;
  styles: StyleTag[];
  /** Business types it's shown first for. Every template works for every type. */
  suits: BusinessType[];
  slots: SlotSpec[];
  /** First one is the default; the rest are alternates picked by slug hash. */
  palettes: Palette[];
};

export type TemplateDemo = {
  /** Business type shown when the gallery has no type filter. */
  defaultType: BusinessType;
};

export type TemplateSite = PublicSite & { businessType: BusinessType };

export type TemplateProps = {
  site: TemplateSite;
  images: Partial<Record<ImageSlot, SiteImage | null>>;
  palette: Palette;
};
