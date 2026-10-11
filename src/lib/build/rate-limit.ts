import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Limits for the public flow. Google lookups and Claude both cost money, so a
// visitor (by IP) and a phone number can only start so many.

export const LIMITS = {
  lookupsPerIpHour: 20,
  buildsPerIpHour: 3,
  buildsPerIpDay: 10,
  buildsPerPhoneDay: 2,
  uploadsPerIpHour: 60,
};

/** The visitor's IP, hashed with a server secret so raw addresses are never stored. */
export async function ipKey(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  return createHash("sha256")
    .update(`${env.workerSecret ?? "minitebuild"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** Counts a hit and says whether it is allowed. Fails open if the limiter is unavailable. */
export async function allow(key: string, windowSeconds: number, max: number): Promise<boolean> {
  const { data, error } = await supabaseAdmin().rpc("hit_rate_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max: max,
  });
  if (error) {
    console.error("Rate limiter unavailable", error.message);
    return true;
  }
  return data === true;
}
