import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === env.adminEmail;
}

/** The signed-in user if they are the admin, otherwise null. */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user && isAdminEmail(data.user.email) ? data.user : null;
}

/** For admin pages and server actions: sends anyone else to the login page. */
export async function requireAdmin(): Promise<User> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  if (!isAdminEmail(data.user.email)) redirect("/login?error=not-allowed");
  return data.user;
}
