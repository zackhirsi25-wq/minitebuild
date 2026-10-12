import { runWorker } from "@/lib/generation/runner";
import { workerAuthorized } from "@/lib/worker-auth";

// Called every minute by Supabase pg_cron (see the worker_cron migration),
// with "Authorization: Bearer <WORKER_SECRET>".

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!workerAuthorized(request)) {
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
