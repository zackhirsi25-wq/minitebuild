import "server-only";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** True when the request carries "Authorization: Bearer <WORKER_SECRET>" (sent by Supabase pg_cron). */
export function workerAuthorized(request: Request): boolean {
  const secret = env.workerSecret;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
