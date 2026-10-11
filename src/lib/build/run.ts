import "server-only";
import sharp from "sharp";
import { requestJson } from "@/lib/ai/anthropic";
import { generateSiteContent, type BusinessFacts } from "@/lib/ai/copy";
import { PHOTO_SYSTEM_PROMPT, photoPlacementJsonSchema, placePhotos } from "@/lib/ai/photos";
import { inferBusinessType } from "@/lib/business-type";
import type { BusinessInput, Tag } from "@/lib/content/schema";
import { env } from "@/lib/env";
import { detailsFromMatch, inferTrade, type GeneratedBusiness } from "@/lib/generation/generate";
import { generationDeps, insertBusiness } from "@/lib/generation/runner";
import { createPlacesClient } from "@/lib/places/client";
import { findBusiness } from "@/lib/places/match";
import type { PlaceMatch } from "@/lib/places/types";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { allTemplates, isTemplateId, templateMeta } from "@/templates";
import { chooseTemplate, paletteForColor } from "./design";
import { saveDraft, type Draft } from "./draft";

// Turns a finished draft into a preview site, one visible step at a time:
// the build page shows each step as it starts and finishes.

export const BUILD_STEPS = [
  { id: "lookup", label: "Finding your business on Google" },
  { id: "copy", label: "Writing your headline, services and answers" },
  { id: "photos", label: "Placing photos" },
  { id: "design", label: "Choosing the design and colours" },
  { id: "page", label: "Building your page" },
] as const;
export type BuildStepId = (typeof BUILD_STEPS)[number]["id"];

export type BuildEvent =
  | { type: "step"; step: BuildStepId; status: "running" | "done"; label: string }
  | { type: "done"; slug: string }
  | { type: "error"; message: string };

/** Unpaid public previews stop being served after this many days. */
export const PREVIEW_DAYS = 14;

export function inputOf(draft: Draft): BusinessInput {
  return { name: draft.name, city: draft.city, phone: draft.phone };
}

/** Looks the business up on Google (or the fixtures without a key). */
export async function lookUp(input: BusinessInput): Promise<PlaceMatch> {
  return findBusiness(input, createPlacesClient(env.googlePlacesApiKey, input));
}

async function photoBlocks(paths: string[]) {
  const db = supabaseAdmin().storage.from("site-images");
  return Promise.all(
    paths.map(async (path) => {
      const { data, error } = await db.download(path);
      if (error || !data) throw new Error(`Could not read an uploaded photo: ${error?.message ?? path}`);
      const small = await sharp(Buffer.from(await data.arrayBuffer()))
        .resize({ width: 768, height: 768, fit: "inside" })
        .jpeg({ quality: 70 })
        .toBuffer();
      return {
        type: "image" as const,
        source: { type: "base64" as const, media_type: "image/jpeg" as const, data: small.toString("base64") },
      };
    }),
  );
}

export async function runBuild(
  draftId: string,
  draft: Draft,
  tokenHash: string,
  emit: (event: BuildEvent) => void,
): Promise<string> {
  const input = inputOf(draft);

  // 1. Google
  emit({ type: "step", step: "lookup", status: "running", label: BUILD_STEPS[0].label });
  const match: PlaceMatch =
    draft.match === undefined || draft.match === null ? await lookUp(input) : (draft.match as PlaceMatch);
  const details = detailsFromMatch(input, match);
  emit({
    type: "step",
    step: "lookup",
    status: "done",
    label: match.found ? `Found ${details.name} on Google` : "Building from the details you entered",
  });

  // 2. Copy
  emit({ type: "step", step: "copy", status: "running", label: BUILD_STEPS[1].label });
  const businessType = draft.typeHint ?? inferBusinessType(details.name, details.category);
  const trade = inferTrade(details.name, details.category);
  const facts: BusinessFacts = {
    name: details.name,
    city: details.city,
    phone: details.phone,
    address: details.address,
    category: details.category,
    trade,
    businessType,
    hours: details.hours,
  };
  const content = await generateSiteContent(facts, generationDeps(input).callModelFor(facts));
  emit({ type: "step", step: "copy", status: "done", label: "Wrote your headline, services and answers" });

  // 3. Photos
  emit({ type: "step", step: "photos", status: "running", label: BUILD_STEPS[2].label });
  const images: Record<string, unknown> = {};
  if (draft.photos.length) {
    let suggestion: unknown = null;
    if (env.anthropicApiKey) {
      try {
        const blocks = await photoBlocks(draft.photos.map((p) => p.path));
        const text = await requestJson({
          apiKey: env.anthropicApiKey,
          model: env.anthropicModel,
          system: PHOTO_SYSTEM_PROMPT,
          schema: photoPlacementJsonSchema as unknown as Record<string, unknown>,
          maxTokens: 4000,
          messages: [
            {
              role: "user",
              content: [
                ...blocks.flatMap((b, i) => [{ type: "text" as const, text: `Photo ${i}:` }, b]),
                {
                  type: "text",
                  text: `These are photos from ${details.name}, ${businessType === "contractor" ? "a contractor" : `a ${businessType.replace("-", " ")} business`} in ${details.city}. Place each one.`,
                },
              ],
            },
          ],
        });
        suggestion = JSON.parse(text);
      } catch (error) {
        // Placement still works without Claude: photos go to slots in order.
        console.error("Photo placement fell back to upload order", error);
      }
    }
    let gallery = 0;
    for (const p of placePhotos(draft.photos.length, suggestion, `Photo from ${details.name}`)) {
      const photo = draft.photos[p.index];
      const slot = p.role === "gallery" ? `gallery-${++gallery}` : p.role;
      images[slot] = {
        path: photo.path,
        alt: p.alt,
        width: photo.width,
        height: photo.height,
        blur: photo.blur,
        focal: p.focal,
      };
    }
  }
  emit({
    type: "step",
    step: "photos",
    status: "done",
    label: draft.photos.length
      ? `Placed your ${draft.photos.length} photo${draft.photos.length === 1 ? "" : "s"}`
      : "Chose photos for your kind of business",
  });

  // 4. Design
  emit({ type: "step", step: "design", status: "running", label: BUILD_STEPS[3].label });
  const template =
    draft.template && isTemplateId(draft.template)
      ? draft.template
      : chooseTemplate(allTemplates(), businessType, `${input.name}|${input.city}`.toLowerCase()).id;
  const meta = templateMeta(template);
  const palette = draft.logo?.color ? paletteForColor(meta, draft.logo.color) : null;
  emit({ type: "step", step: "design", status: "done", label: `Chose the ${meta.name} design` });

  // 5. Page
  emit({ type: "step", step: "page", status: "running", label: BUILD_STEPS[4].label });
  const tags: Tag[] = [];
  if (details.websiteUrl) tags.push("has website");
  if (!match.found) tags.push("unverified");
  const generated: GeneratedBusiness = {
    input,
    ...details,
    placesFetchedAt: new Date().toISOString(),
    trade,
    template,
    tags,
    content,
    match,
  };
  const { id, slug } = await insertBusiness(generated, {
    source: "public",
    editTokenHash: tokenHash,
    expiresAt: new Date(Date.now() + PREVIEW_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    images,
    palette,
  });
  await saveDraft(draftId, { ...draft, match, slug }, id);
  emit({ type: "step", step: "page", status: "done", label: "Built your page" });
  emit({ type: "done", slug });
  return slug;
}
