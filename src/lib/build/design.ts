import type { BusinessType } from "@/lib/business-type";
import type { TemplateMeta } from "@/templates/_kit/types";

// "Let us choose": a template designed with the business type in mind, picked
// stably from the name and city; and, when a logo was uploaded, the
// template palette whose accent is closest in colour to the logo. Template
// palettes are already contrast-checked, so a logo can never produce
// unreadable text.

function hash(value: string): number {
  let h = 2166136261;
  for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

export function chooseTemplate(templates: TemplateMeta[], type: BusinessType, seed: string): TemplateMeta {
  const suited = templates.filter((t) => t.suits.includes(type));
  const pool = suited.length ? suited : templates;
  return pool[hash(seed) % pool.length];
}

/** Hue (0-360), saturation and lightness (0-1) of a #rrggbb colour. */
export function hsl(hex: string): { h: number; s: number; l: number } | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

/**
 * The palette whose accent is nearest the logo colour, or null when the logo
 * colour is too grey to say (then the template's usual choice applies).
 */
export function paletteForColor(meta: TemplateMeta, logoHex: string): string | null {
  const logo = hsl(logoHex);
  if (!logo || logo.s < 0.18) return null;
  let best: { id: string; score: number } | null = null;
  for (const p of meta.palettes) {
    const accent = p.vars.accent ? hsl(p.vars.accent) : null;
    if (!accent || accent.s < 0.1) continue;
    const dh = Math.min(Math.abs(accent.h - logo.h), 360 - Math.abs(accent.h - logo.h));
    const score = dh + Math.abs(accent.l - logo.l) * 60;
    if (!best || score < best.score) best = { id: p.id, score };
  }
  return best && best.score < 70 ? best.id : null;
}
