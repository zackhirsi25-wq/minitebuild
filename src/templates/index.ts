import { TEMPLATE_DEMOS, TEMPLATE_IDS, TEMPLATE_LOADERS, TEMPLATE_METAS, TEMPLATE_THUMBS } from "./registry.generated";
import type { TemplateMeta } from "./_kit/types";

export { TEMPLATE_DEMOS, TEMPLATE_IDS, TEMPLATE_METAS, TEMPLATE_THUMBS };
export type { TemplateMeta, TemplateProps, TemplateSite, Palette, StyleTag } from "./_kit/types";

export const DEFAULT_TEMPLATE = "cinematic";

/** Template ids stored before the library existed. */
const LEGACY_IDS: Record<string, string> = { bold: "cinematic", classic: "gallery", split: "impact" };

export function isTemplateId(id: unknown): id is string {
  return typeof id === "string" && id in TEMPLATE_METAS;
}

/** A stored or requested id as a registered template: legacy ids are mapped, unknown ones get the default. */
export function resolveTemplateId(id: string | null | undefined): string {
  if (isTemplateId(id)) return id;
  const mapped = id ? LEGACY_IDS[id] : undefined;
  if (isTemplateId(mapped)) return mapped;
  return DEFAULT_TEMPLATE in TEMPLATE_METAS ? DEFAULT_TEMPLATE : TEMPLATE_IDS[0];
}

export function templateMeta(id: string): TemplateMeta {
  return TEMPLATE_METAS[resolveTemplateId(id)];
}

export async function loadTemplate(id: string) {
  return (await TEMPLATE_LOADERS[resolveTemplateId(id)]()).default;
}

/** All templates in gallery order. */
export function allTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATE_METAS).sort((a, b) => a.order - b.order);
}
