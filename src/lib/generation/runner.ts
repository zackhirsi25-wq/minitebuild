import "server-only";
import { createAnthropicCaller, ModelError } from "@/lib/ai/anthropic";
import { CopyValidationError, generateSiteContent, type BusinessFacts, type CallModel } from "@/lib/ai/copy";
import { fixtureCaller } from "@/lib/ai/fixture-copy";
import { baseSlug, nextAvailableSlug } from "@/lib/content/slug";
import type { BusinessInput, SiteContent, Trade } from "@/lib/content/schema";
import { env } from "@/lib/env";
import { createPlacesClient, PlacesApiError } from "@/lib/places/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { generateBusiness, InvalidInputError, type GeneratedBusiness, type GenerateDeps } from "./generate";

type JobRow = Database["public"]["Tables"]["import_jobs"]["Row"];

export function generationDeps(input: BusinessInput): GenerateDeps {
  const key = env.anthropicApiKey;
  const model = env.anthropicModel;
  return {
    places: createPlacesClient(env.googlePlacesApiKey, input),
    callModelFor: (facts: BusinessFacts): CallModel => (key ? createAnthropicCaller(key, model) : fixtureCaller(facts)),
  };
}

/** Fresh copy for an existing business ("Regenerate copy"). */
export async function regenerateCopy(facts: BusinessFacts): Promise<SiteContent> {
  return generateSiteContent(facts, generationDeps({ name: facts.name, city: facts.city, phone: facts.phone }).callModelFor(facts));
}

export function factsFor(row: {
  name: string;
  city: string;
  phone: string;
  address: string | null;
  category: string | null;
  trade: string;
  hours: string[];
}): BusinessFacts {
  return { ...row, trade: row.trade as Trade };
}

/** Inserts a generated business under a free slug (business-name-city, then -2, -3...). */
export async function insertBusiness(generated: GeneratedBusiness): Promise<{ id: string; slug: string }> {
  const db = supabaseAdmin();
  const base = baseSlug(generated.input.name, generated.input.city);

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing, error: lookupError } = await db
      .from("businesses")
      .select("slug")
      .or(`slug.eq.${base},slug.like.${base}-%`);
    if (lookupError) throw new Error(`Could not check existing addresses: ${lookupError.message}`);

    const slug = nextAvailableSlug(
      base,
      (existing ?? []).map((r) => r.slug),
    );
    const { data, error } = await db
      .from("businesses")
      .insert({
        slug,
        template: generated.template,
        trade: generated.trade,
        input_name: generated.input.name,
        input_city: generated.input.city,
        input_phone: generated.input.phone,
        name: generated.name,
        city: generated.city,
        phone: generated.phone,
        address: generated.address,
        hours: generated.hours,
        category: generated.category,
        website_url: generated.websiteUrl,
        place_id: generated.placeId,
        places_fetched_at: generated.placesFetchedAt,
        content: generated.content,
        tags: generated.tags,
      })
      .select("id, slug")
      .single();
    if (!error) return data;
    if (error.code !== "23505") throw new Error(`Could not save the business: ${error.message}`);
    // Another worker took the same slug a moment ago; look again.
  }
  throw new Error("Could not find a free web address for this business. Try again.");
}

/** Errors that will not go away by retrying. */
function isPermanent(error: unknown): boolean {
  if (error instanceof InvalidInputError || error instanceof CopyValidationError) return true;
  if (error instanceof PlacesApiError) return [400, 401, 403, 404].includes(error.status);
  if (error instanceof ModelError) return /rejected|not found|declined/.test(error.message);
  return false;
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something unexpected went wrong.";
}

/** Generates one queued row. Never throws: the outcome is written to the job. */
export async function processJob(job: JobRow): Promise<"done" | "failed" | "retry"> {
  const db = supabaseAdmin();
  const input = job.input as BusinessInput;
  try {
    const generated = await generateBusiness(input, generationDeps(input));
    const business = await insertBusiness(generated);
    await db
      .from("import_jobs")
      .update({ status: "done", business_id: business.id, error: null, locked_at: null, finished_at: new Date().toISOString() })
      .eq("id", job.id);
    return "done";
  } catch (error) {
    const message = describe(error);
    const outOfAttempts = job.attempts >= job.max_attempts;
    if (isPermanent(error) || outOfAttempts) {
      await db
        .from("import_jobs")
        .update({ status: "failed", error: message, locked_at: null, finished_at: new Date().toISOString() })
        .eq("id", job.id);
      return "failed";
    }
    // Back off 30s, 60s... before the next attempt.
    const runAfter = new Date(Date.now() + job.attempts * 30_000).toISOString();
    await db
      .from("import_jobs")
      .update({ status: "queued", error: message, locked_at: null, run_after: runAfter })
      .eq("id", job.id);
    return "retry";
  }
}

async function completeFinishedBatches(batchIds: string[]) {
  const db = supabaseAdmin();
  for (const batchId of new Set(batchIds)) {
    const { count } = await db
      .from("import_jobs")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .in("status", ["queued", "running"]);
    if (count === 0) {
      await db
        .from("import_batches")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", batchId)
        .is("completed_at", null);
    }
  }
}

export type WorkerResult = { claimed: number; done: number; failed: number; retried: number };

/**
 * Claims jobs in small chunks and processes each chunk in parallel. Stops
 * claiming once the time budget is used, so the request ends well before the
 * platform's function timeout.
 */
export async function runWorker(opts: { budgetMs: number; chunkSize?: number; batchId?: string; maxChunks?: number }) {
  const db = supabaseAdmin();
  const started = Date.now();
  const result: WorkerResult = { claimed: 0, done: 0, failed: 0, retried: 0 };
  let chunks = 0;

  while (Date.now() - started < opts.budgetMs && chunks < (opts.maxChunks ?? Infinity)) {
    const { data: jobs, error } = await db.rpc("claim_import_jobs", {
      p_limit: opts.chunkSize ?? 3,
      p_batch_id: opts.batchId,
    });
    if (error) throw new Error(`Could not read the queue: ${error.message}`);
    if (!jobs || jobs.length === 0) break;
    chunks++;
    result.claimed += jobs.length;

    const outcomes = await Promise.all(jobs.map((job) => processJob(job)));
    for (const outcome of outcomes) {
      if (outcome === "done") result.done++;
      else if (outcome === "failed") result.failed++;
      else result.retried++;
    }
    await completeFinishedBatches(jobs.map((j) => j.batch_id));
  }
  return result;
}
