import "server-only";
import { businessInputSchema, STATUSES, TAGS, type BusinessStatus, type Tag } from "@/lib/content/schema";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];
export type JobRow = Database["public"]["Tables"]["import_jobs"]["Row"];

export const PAGE_SIZE = 25;

export type BusinessFilters = { q?: string; status?: BusinessStatus; tag?: Tag; page: number };

export function parseFilters(params: Record<string, string | string[] | undefined>): BusinessFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const status = one(params.status);
  const tag = one(params.tag);
  const page = Number(one(params.page) ?? "1");
  return {
    q: one(params.q)?.slice(0, 100),
    status: STATUSES.includes(status as BusinessStatus) ? (status as BusinessStatus) : undefined,
    tag: TAGS.includes(tag as Tag) ? (tag as Tag) : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export async function listBusinesses(filters: BusinessFilters) {
  let query = supabaseAdmin()
    .from("businesses")
    .select("id, slug, name, city, status, template, tags, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE - 1);
  if (filters.q) {
    // Escape LIKE wildcards; commas and parentheses would break the or() filter.
    const term = filters.q.replace(/[%_\\]/g, (c) => `\\${c}`).replace(/[,()]/g, " ");
    query = query.or(`name.ilike.%${term}%,input_name.ilike.%${term}%`);
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.tag) query = query.contains("tags", [filters.tag]);

  const { data, count, error } = await query;
  if (error) throw new Error(`Could not load businesses: ${error.message}`);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getBusiness(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = supabaseAdmin();
  const { data, error } = await db.from("businesses").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load the business: ${error.message}`);
  if (!data) return null;
  const [{ data: subscriptions }, { data: events }] = await Promise.all([
    db.from("subscriptions").select("*").eq("business_id", id).order("created_at", { ascending: false }),
    db.from("billing_events").select("id, provider, type, received_at, processed_at, error").eq("business_id", id).order("received_at", { ascending: false }).limit(10),
  ]);
  return { business: data, subscriptions: subscriptions ?? [], events: events ?? [] };
}

export type BatchProgress = {
  id: string;
  filename: string | null;
  source: string;
  createdAt: string;
  completedAt: string | null;
  total: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
  rows: {
    id: string;
    rowNumber: number;
    name: string;
    city: string;
    status: JobRow["status"];
    error: string | null;
    attempts: number;
    /** Failed for a reason other than bad input, so trying again may work. */
    retryable: boolean;
    business: { id: string; slug: string } | null;
  }[];
};

export async function getBatchProgress(batchId: string): Promise<BatchProgress | null> {
  if (!/^[0-9a-f-]{36}$/i.test(batchId)) return null;
  const db = supabaseAdmin();
  const { data: batch } = await db.from("import_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batch) return null;
  const { data: jobs, error } = await db
    .from("import_jobs")
    .select("id, row_number, input, status, error, attempts, business_id, businesses(id, slug)")
    .eq("batch_id", batchId)
    .order("row_number");
  if (error) throw new Error(`Could not load the import: ${error.message}`);

  const rows = (jobs ?? []).map((j) => {
    const input = (j.input ?? {}) as { name?: string; city?: string };
    const business = Array.isArray(j.businesses) ? j.businesses[0] : j.businesses;
    return {
      id: j.id,
      rowNumber: j.row_number,
      name: input.name || "(no name)",
      city: input.city || "",
      status: j.status,
      error: j.error,
      attempts: j.attempts,
      retryable: j.status === "failed" && businessInputSchema.safeParse(j.input).success,
      business: business ? { id: business.id, slug: business.slug } : null,
    };
  });
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  return {
    id: batch.id,
    filename: batch.filename,
    source: batch.source,
    createdAt: batch.created_at,
    completedAt: batch.completed_at,
    total: rows.length,
    queued: count("queued"),
    running: count("running"),
    done: count("done"),
    failed: count("failed"),
    rows,
  };
}

export async function listRecentBatches(limit = 8) {
  const db = supabaseAdmin();
  const { data } = await db
    .from("import_batches")
    .select("id, filename, source, total_rows, created_at, completed_at")
    .eq("source", "csv")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
