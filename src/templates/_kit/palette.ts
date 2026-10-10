import type { CSSProperties } from "react";
import type { Palette, TemplateMeta } from "./types";

function hash(value: string): number {
  let h = 2166136261;
  for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** The admin's choice if it's one of this template's palettes, else one picked by slug. */
export function pickPalette(meta: TemplateMeta, slug: string, chosen?: string | null): Palette {
  const exact = chosen ? meta.palettes.find((p) => p.id === chosen) : undefined;
  return exact ?? meta.palettes[hash(slug) % meta.palettes.length];
}

/** Palette variables as an inline style for the template root. */
export function paletteStyle(palette: Palette): CSSProperties {
  return Object.fromEntries(Object.entries(palette.vars).map(([k, v]) => [`--${k}`, v])) as CSSProperties;
}
