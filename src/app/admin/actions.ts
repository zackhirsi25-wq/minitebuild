"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PLAN_IDS, type PlanId } from "@/config/product";
import { businessEditSchema, type BusinessEdit } from "@/lib/admin/details";
import { getBatchProgress, type BatchProgress } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth";
import { handleBillingEvent } from "@/lib/billing/handle-event";
import { supabaseBillingStore } from "@/lib/billing/store";
import { parseImportCsv } from "@/lib/content/csv";
import { businessInputSchema, formatIssues, IMAGE_SLOTS, TAGS, type ImageSlot, type Tag } from "@/lib/content/schema";
import { env } from "@/lib/env";
import { detailsFromMatch } from "@/lib/generation/generate";
import { factsFor, regenerateCopy, runWorker } from "@/lib/generation/runner";
import { createPlacesClient } from "@/lib/places/client";
import { findBusiness } from "@/lib/places/match";
import { revalidateSite } from "@/lib/sites/revalidate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

// Every action re-checks the admin session: server actions are public
// endpoints and must not rely on the page that rendered them.

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function failure(error: unknown, fallback: string): ActionResult {
  console.error(fallback, error);
  return { ok: false, error: error instanceof Error && error.message ? error.message : fallback };
}

async function loadBusiness(id: string) {
  const { data, error } = await supabaseAdmin().from("businesses").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load the business: ${error.message}`);
  if (!data) throw new Error("This business no longer exists.");
  return data;
}

function afterChange(business: { id: string; slug: string }) {
  revalidateSite(business.slug);
  revalidatePath(`/admin/businesses/${business.id}`);
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

export type CreateSingleState = { error: string | null; values: { name: string; city: string; phone: string } };

/** Generates one business right away (same queue as CSV imports, one row). */
export async function createSingleBusiness(_prev: CreateSingleState, formData: FormData): Promise<CreateSingleState> {
  const user = await requireAdmin();
  const values = {
    name: String(formData.get("name") ?? ""),
    city: String(formData.get("city") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
  const parsed = businessInputSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(". ") + ".", values };

  const db = supabaseAdmin();
  const { data: batch, error } = await db
    .from("import_batches")
    .insert({ source: "single", total_rows: 1, created_by: user.id })
    .select("id")
    .single();
  if (error) return { error: `Could not start: ${error.message}`, values };
  const { error: jobError } = await db
    .from("import_jobs")
    .insert({ batch_id: batch.id, row_number: 1, input: parsed.data, max_attempts: 1 });
  if (jobError) return { error: `Could not start: ${jobError.message}`, values };

  await runWorker({ batchId: batch.id, budgetMs: Number.POSITIVE_INFINITY, maxChunks: 1, chunkSize: 1 });

  const { data: job } = await db.from("import_jobs").select("status, error, business_id").eq("batch_id", batch.id).single();
  if (!job?.business_id) {
    return { error: job?.error ?? "Generation didn't finish. Check the Import page for this row.", values };
  }
  revalidatePath("/admin");
  redirect(`/admin/businesses/${job.business_id}?created=1`);
}

export type StartImportResult = { ok: true; batchId: string } | { ok: false; error: string };

/** Queues a CSV. The file is parsed again on the server; rows with real problems are recorded as failed with the reason. */
export async function startImport(csvText: string, filename: string): Promise<StartImportResult> {
  const user = await requireAdmin();
  const parsed = parseImportCsv(csvText);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const db = supabaseAdmin();
  const { data: batch, error } = await db
    .from("import_batches")
    .insert({ source: "csv", filename: filename.slice(0, 200), total_rows: parsed.rows.length, created_by: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, error: `Could not start the import: ${error.message}` };

  const now = new Date().toISOString();
  // Every row needs the same keys for a bulk insert.
  const jobs = parsed.rows.map((row) => ({
    batch_id: batch.id,
    row_number: row.rowNumber,
    input: row.input,
    status: row.error ? "failed" : "queued",
    error: row.error ?? null,
    finished_at: row.error ? now : null,
  }));
  for (let i = 0; i < jobs.length; i += 500) {
    const { error: insertError } = await db.from("import_jobs").insert(jobs.slice(i, i + 500));
    if (insertError) {
      await db.from("import_batches").delete().eq("id", batch.id);
      return { ok: false, error: `Could not queue the rows: ${insertError.message}` };
    }
  }
  if (parsed.validCount === 0) {
    await db.from("import_batches").update({ completed_at: now }).eq("id", batch.id);
  }
  return { ok: true, batchId: batch.id };
}

/** Called in a loop by the open import page: processes one small chunk, then reports progress. */
export async function processImportChunk(batchId: string): Promise<BatchProgress | null> {
  await requireAdmin();
  await runWorker({ batchId, budgetMs: Number.POSITIVE_INFINITY, maxChunks: 1, chunkSize: 3 });
  return getBatchProgress(batchId);
}

export async function getImportProgress(batchId: string): Promise<BatchProgress | null> {
  await requireAdmin();
  return getBatchProgress(batchId);
}

/** Puts failed rows that have valid input back in the queue. */
export async function retryFailedRows(batchId: string): Promise<ActionResult> {
  await requireAdmin();
  const db = supabaseAdmin();
  const { data: failed } = await db.from("import_jobs").select("id, input").eq("batch_id", batchId).eq("status", "failed");
  const retryable = (failed ?? []).filter((j) => businessInputSchema.safeParse(j.input).success).map((j) => j.id);
  if (retryable.length === 0) return { ok: false, error: "No failed rows can be retried. Fix the file and import it again." };
  const { error } = await db
    .from("import_jobs")
    .update({ status: "queued", attempts: 0, error: null, finished_at: null, run_after: new Date().toISOString() })
    .in("id", retryable);
  if (error) return { ok: false, error: error.message };
  await db.from("import_batches").update({ completed_at: null }).eq("id", batchId);
  return { ok: true, message: `${retryable.length} row${retryable.length === 1 ? "" : "s"} queued again` };
}

// ---------------------------------------------------------------------------
// Business detail
// ---------------------------------------------------------------------------

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string; fieldErrors: Record<string, string> };

export async function saveBusiness(id: string, edit: BusinessEdit): Promise<SaveResult> {
  await requireAdmin();
  const parsed = businessEditSchema.safeParse(edit);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    const lines = formatIssues(parsed.error);
    return {
      ok: false,
      error: `Some fields need fixing before saving (${lines.length} issue${lines.length === 1 ? "" : "s"}).`,
      fieldErrors,
    };
  }
  try {
    const { details, content } = parsed.data;
    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin()
      .from("businesses")
      .update({
        name: details.name,
        city: details.city,
        phone: details.phone,
        address: details.address,
        category: details.category,
        hours: details.hours,
        website_url: details.websiteUrl,
        trade: details.trade,
        template: details.template,
        content,
        details_confirmed_at: now,
      })
      .eq("id", id)
      .select("id, slug, updated_at")
      .single();
    if (error) throw new Error(error.message);
    afterChange(data);
    return { ok: true, savedAt: data.updated_at };
  } catch (error) {
    return { ok: false, error: `Could not save: ${error instanceof Error ? error.message : "unknown error"}`, fieldErrors: {} };
  }
}

export async function regenerateBusinessCopy(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const business = await loadBusiness(id);
    const content = await regenerateCopy(factsFor(business));
    const { error } = await supabaseAdmin().from("businesses").update({ content }).eq("id", id);
    if (error) throw new Error(error.message);
    afterChange(business);
    return { ok: true, message: "New copy written" };
  } catch (error) {
    return failure(error, "Could not regenerate the copy.");
  }
}

export async function refreshFromGoogle(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const business = await loadBusiness(id);
    const input = { name: business.input_name, city: business.input_city, phone: business.input_phone };
    const match = await findBusiness(input, createPlacesClient(env.googlePlacesApiKey, input));
    const details = detailsFromMatch(input, match);

    const tags = new Set(business.tags as Tag[]);
    tags.delete("unverified");
    tags.delete("has website");
    if (!match.found) tags.add("unverified");
    if (details.websiteUrl) tags.add("has website");

    const { error } = await supabaseAdmin()
      .from("businesses")
      .update({
        ...(match.found
          ? {
              name: details.name,
              city: details.city,
              phone: details.phone,
              address: details.address,
              hours: details.hours,
              category: details.category,
              website_url: details.websiteUrl,
              place_id: details.placeId,
            }
          : {}),
        tags: Array.from(tags),
        places_fetched_at: new Date().toISOString(),
        // New Google data has to be confirmed again.
        details_confirmed_at: null,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    afterChange(business);
    return {
      ok: true,
      message: match.found ? "Details updated from Google. Review and save them." : "Google has no listing for this business.",
    };
  } catch (error) {
    return failure(error, "Could not refresh from Google.");
  }
}

export async function publishBusiness(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const business = await loadBusiness(id);
    const { error } = await supabaseAdmin()
      .from("businesses")
      .update({ status: "live", published_at: business.published_at ?? new Date().toISOString(), paused_at: null })
      .eq("id", id);
    if (error) throw new Error(error.message);
    afterChange(business);
    return { ok: true, message: "Site is live" };
  } catch (error) {
    return failure(error, "Could not publish.");
  }
}

export async function pauseBusiness(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const business = await loadBusiness(id);
    const { error } = await supabaseAdmin()
      .from("businesses")
      .update({ status: "paused", paused_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    afterChange(business);
    return { ok: true, message: "Site paused" };
  } catch (error) {
    return failure(error, "Could not pause.");
  }
}

/** Records a payment taken outside the app. Goes through the same handler as the webhook. */
export async function markAsPaid(id: string, plan: PlanId): Promise<ActionResult> {
  await requireAdmin();
  if (!PLAN_IDS.includes(plan)) return { ok: false, error: "Pick a plan." };
  try {
    const business = await loadBusiness(id);
    const eventId = `manual_${randomUUID()}`;
    await handleBillingEvent(
      {
        provider: "manual",
        eventId,
        type: "payment_succeeded",
        businessId: id,
        plan,
        subscriptionId: `manual_${id}`,
        raw: { markedBy: "admin", plan, at: new Date().toISOString() },
      },
      supabaseBillingStore(),
    );
    afterChange(business);
    return { ok: true, message: "Marked as paid. The site is live." };
  } catch (error) {
    return failure(error, "Could not mark as paid.");
  }
}

export async function saveNotes(id: string, notes: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("businesses").update({ notes: notes.slice(0, 5000) }).eq("id", id);
  if (error) return { ok: false, error: `Could not save notes: ${error.message}` };
  revalidatePath(`/admin/businesses/${id}`);
  return { ok: true, message: "Notes saved" };
}

export async function setTag(id: string, tag: Tag, on: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!TAGS.includes(tag)) return { ok: false, error: "Unknown tag." };
  try {
    const business = await loadBusiness(id);
    const tags = new Set(business.tags);
    if (on) tags.add(tag);
    else tags.delete(tag);
    const { error } = await supabaseAdmin().from("businesses").update({ tags: Array.from(tags) }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/businesses/${id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return failure(error, "Could not update tags.");
  }
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function uploadPhoto(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const slot = String(formData.get("slot")) as ImageSlot;
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();
  if (!IMAGE_SLOTS.includes(slot)) return { ok: false, error: "Unknown image slot." };
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo to upload." };
  if (!PHOTO_TYPES[file.type]) return { ok: false, error: "Use a JPEG, PNG or WebP photo." };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, error: "That photo is over 5 MB. Use a smaller one." };
  if (alt.length < 5 || alt.length > 200) {
    return { ok: false, error: "Describe the photo in 5 to 200 characters (this is its alt text)." };
  }

  try {
    const business = await loadBusiness(id);
    const db = supabaseAdmin();
    const path = `${id}/${slot}-${Date.now()}.${PHOTO_TYPES[file.type]}`;
    const { error: uploadError } = await db.storage
      .from("site-images")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const images = { ...((business.images as Record<string, { path: string; alt: string }>) ?? {}) };
    const previous = images[slot]?.path;
    images[slot] = { path, alt };
    const { error } = await db.from("businesses").update({ images: images as NonNullable<Json> }).eq("id", id);
    if (error) throw new Error(error.message);
    if (previous) await db.storage.from("site-images").remove([previous]);
    afterChange(business);
    return { ok: true, message: "Photo uploaded" };
  } catch (error) {
    return failure(error, "Could not upload the photo.");
  }
}

export async function resetPhoto(id: string, slot: ImageSlot): Promise<ActionResult> {
  await requireAdmin();
  if (!IMAGE_SLOTS.includes(slot)) return { ok: false, error: "Unknown image slot." };
  try {
    const business = await loadBusiness(id);
    const images = { ...((business.images as Record<string, { path: string; alt: string }>) ?? {}) };
    const previous = images[slot]?.path;
    delete images[slot];
    const db = supabaseAdmin();
    const { error } = await db.from("businesses").update({ images: images as NonNullable<Json> }).eq("id", id);
    if (error) throw new Error(error.message);
    if (previous) await db.storage.from("site-images").remove([previous]);
    afterChange(business);
    return { ok: true, message: "Back to the stock photo" };
  } catch (error) {
    return failure(error, "Could not reset the photo.");
  }
}
