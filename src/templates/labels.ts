import type { StyleTag } from "./_kit/types";

export const STYLE_LABELS: Record<StyleTag, string> = {
  dark: "Dark",
  light: "Light",
  bold: "Bold",
  elegant: "Elegant",
  warm: "Warm",
  story: "Story",
};

export const STYLE_TAGS = Object.keys(STYLE_LABELS) as StyleTag[];

export function isStyleTag(value: unknown): value is StyleTag {
  return typeof value === "string" && value in STYLE_LABELS;
}
