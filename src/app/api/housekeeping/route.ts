import { runHousekeeping } from "@/lib/housekeeping";
import { workerAuthorized } from "@/lib/worker-auth";

// Called nightly by Supabase pg_cron (see the build_flow migration), with
// "Authorization: Bearer <WORKER_SECRET>".

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!workerAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runHousekeeping();
    if (result.skipped) console.warn(result.skipped);
    return Response.json(result);
  } catch (error) {
    console.error("Housekeeping failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "Housekeeping failed" }, { status: 500 });
  }
}
