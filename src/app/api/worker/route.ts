import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { runWorker } from "@/lib/generation/runner";

// Called every minute by Supabase pg_cron (see the worker_cron migration),
// with "Authorization: Bearer <WORKER_SECRET>".

export const maxDuration = 300;

function authorized(request: Request): boolean {
  const secret = env.workerSecret;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Start new chunks for up to a minute; the next cron tick picks up the rest.
    const result = await runWorker({ budgetMs: 60_000, chunkSize: 3 });
    return Response.json(result);
  } catch (error) {
    console.error("Import worker failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "Worker failed" }, { status: 500 });
  }
}
