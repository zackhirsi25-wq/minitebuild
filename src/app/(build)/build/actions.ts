"use server";

import { redirect } from "next/navigation";
import { allow, ipKey, LIMITS } from "@/lib/build/rate-limit";
import { createDraft, getDraft, saveDraft, type Draft, type DraftPhoto } from "@/lib/build/draft";
import { lookUp } from "@/lib/build/run";
import { deleteDraftImage, MAX_PHOTOS, processImage, storeDraftImage, UploadError } from "@/lib/build/uploads";
import { isBusinessType } from "@/lib/business-type";
import { businessInputSchema } from "@/lib/content/schema";
import { isTemplateId } from "@/templates";

export type DetailsState = { error?: string; fields?: { name: string; city: string; phone: string } };

/**
 * Starts (or updates) a build from name, city and phone: the home page's build
 * box and the Details step both post here. Sent by POST, so the phone number
 * never appears in a URL. Looks the business up on Google, then shows the
 * Details step to confirm.
 */
export async function startBuild(_: DetailsState, formData: FormData): Promise<DetailsState> {
  const fields = {
    name: String(formData.get("name") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };
  const parsed = businessInputSchema.safeParse(fields);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the details and try again.", fields };

  if (!(await allow(`lookup:ip:${await ipKey()}`, 3600, LIMITS.lookupsPerIpHour))) {
    return { error: "That's a lot of lookups in a short time. Please try again in an hour.", fields };
  }

  const type = formData.get("type");
  const template = formData.get("template");
  const current = await getDraft();
  const keep = current && !current.data.slug ? current.data : null;
  const draft: Draft = {
    ...(keep ?? { photos: [], logo: null, confirmed: false, designChosen: false }),
    name: parsed.data.name,
    city: parsed.data.city,
    phone: parsed.data.phone,
    typeHint: isBusinessType(type) ? type : keep?.typeHint,
    template: isTemplateId(template) ? template : keep?.template,
    match: await lookUp(parsed.data),
    confirmed: false,
    slug: undefined,
  };
  if (keep && current) await saveDraft(current.id, draft);
  else await createDraft(draft);
  redirect("/build");
}

/** "Yes, continue" on the Details step. */
export async function confirmDetails(formData: FormData) {
  const current = await getDraft();
  if (!current?.data.name) redirect("/build");
  const template = formData.get("template");
  await saveDraft(current.id, {
    ...current.data,
    confirmed: true,
    template: isTemplateId(template) ? template : current.data.template,
  });
  redirect("/build/photos");
}

export type UploadResult = { ok: true; photo: DraftPhoto } | { ok: false; error: string };

/** One photo or the logo, validated and re-encoded (see lib/build/uploads). */
export async function uploadBuildImage(formData: FormData): Promise<UploadResult> {
  const current = await getDraft();
  if (!current?.data.confirmed) return { ok: false, error: "Your session has ended. Go back to the first step." };
  const kind = formData.get("kind") === "logo" ? "logo" : "photo";
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose a file to upload." };
  if (kind === "photo" && current.data.photos.length >= MAX_PHOTOS) {
    return { ok: false, error: `You can add up to ${MAX_PHOTOS} photos.` };
  }
  if (!(await allow(`upload:ip:${await ipKey()}`, 3600, LIMITS.uploadsPerIpHour))) {
    return { ok: false, error: "Too many uploads in a short time. Please try again later." };
  }
  try {
    const image = await processImage(file, kind);
    const stored = await storeDraftImage(current.id, image);
    // Re-read so parallel uploads don't overwrite each other's additions.
    const latest = (await getDraft()) ?? current;
    if (kind === "logo") {
      if (latest.data.logo) await deleteDraftImage(latest.data.logo.path);
      await saveDraft(latest.id, { ...latest.data, logo: { ...stored, color: image.color } });
    } else {
      await saveDraft(latest.id, { ...latest.data, photos: [...latest.data.photos, stored].slice(0, MAX_PHOTOS) });
    }
    return { ok: true, photo: stored };
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, error: error.message };
    console.error("Upload failed", error);
    return { ok: false, error: "That upload didn't work. Please try again." };
  }
}

export async function removeBuildImage(path: string): Promise<{ ok: boolean }> {
  const current = await getDraft();
  if (!current) return { ok: false };
  const isLogo = current.data.logo?.path === path;
  if (!isLogo && !current.data.photos.some((p) => p.path === path)) return { ok: false };
  await saveDraft(current.id, {
    ...current.data,
    logo: isLogo ? null : current.data.logo,
    photos: current.data.photos.filter((p) => p.path !== path),
  });
  await deleteDraftImage(path);
  return { ok: true };
}

/** Design step: a template id, or "auto" for "Let us choose". */
export async function chooseDesign(formData: FormData) {
  const current = await getDraft();
  if (!current?.data.confirmed) redirect("/build");
  const choice = String(formData.get("template") ?? "auto");
  await saveDraft(current.id, {
    ...current.data,
    template: isTemplateId(choice) ? choice : undefined,
    designChosen: true,
  });
  redirect("/build/preview");
}

/** Start over with an empty draft (the previous preview is untouched). */
export async function startOver() {
  await createDraft({});
  redirect("/build");
}
