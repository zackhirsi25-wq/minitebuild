"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export type LoginState = { error: string | null; email: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: "That email and password don't match. Check them and try again.", email };
  }
  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access to the admin panel.", email };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
