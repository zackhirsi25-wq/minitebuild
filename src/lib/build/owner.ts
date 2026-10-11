import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isOwner } from "./draft";

/** The business's id if this browser built it (its build cookie matches), else null. */
export async function ownedBusiness(
  slug: string,
): Promise<{ id: string; template: string; palette: string | null } | null> {
  const { data } = await supabaseAdmin()
    .from("businesses")
    .select("id, template, palette, edit_token_hash, status")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || data.status !== "preview") return null;
  return (await isOwner(data.edit_token_hash)) ? { id: data.id, template: data.template, palette: data.palette } : null;
}
