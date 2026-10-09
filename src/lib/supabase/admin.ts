import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "./database.types";

export type AdminClient = SupabaseClient<Database>;

let client: AdminClient | null = null;

/**
 * Secret-key client. It bypasses row-level security, so only use it in server
 * code that has already checked the caller (requireAdmin, the worker secret,
 * or a verified webhook).
 */
export function supabaseAdmin(): AdminClient {
  client ??= createClient<Database>(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
