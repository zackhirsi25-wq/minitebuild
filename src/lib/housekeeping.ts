import "server-only";
import { legal } from "@/config/legal";
import { revalidateSite } from "@/lib/sites/revalidate";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Nightly cleanup, called by the housekeeping cron (see the build_flow
// migration). Deletes:
//   - unpaid public previews 30 days after they expired
//   - cancelled sites legal.retentionDays after cancellation (skipped while
//     retentionDays is unset)
//   - photos uploaded to build drafts that were abandoned
// Subscriptions, billing events and policy acceptances are kept: their
// business_id becomes null when the business row goes.

const BUCKET = "site-images";

/** Every "path" string in a business's images JSON. */
export function imagePaths(images: unknown): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      for (const [key, v] of Object.entries(value)) {
        if (key === "path" && typeof v === "string") out.push(v);
        else walk(v);
      }
    }
  };
  walk(images);
  return out;
}

async function listFolder(folder: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).list(folder, { limit: 1000 });
  if (error) throw new Error(`Could not list ${folder}: ${error.message}`);
  return (data ?? []).map((item) => item.name);
}

async function removeFiles(paths: string[]) {
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await supabaseAdmin()
      .storage.from(BUCKET)
      .remove(paths.slice(i, i + 100));
    if (error) throw new Error(`Could not delete photos: ${error.message}`);
  }
}

async function deleteDueSites() {
  const db = supabaseAdmin();
  const { data, error } = await db.rpc("sites_due_for_deletion", { p_retention_days: legal.retentionDays });
  if (error) throw new Error(`Could not find sites to delete: ${error.message}`);
  const deleted = { expired: 0, canceled: 0 };
  for (const site of data ?? []) {
    // Photos first: if that fails the row stays and the next run retries.
    const adminUploads = (await listFolder(site.id)).map((name) => `${site.id}/${name}`);
    await removeFiles([...new Set([...imagePaths(site.images), ...adminUploads])]);
    const { error: deleteError } = await db.from("businesses").delete().eq("id", site.id);
    if (deleteError) throw new Error(`Could not delete ${site.slug}: ${deleteError.message}`);
    revalidateSite(site.slug);
    deleted[site.reason as keyof typeof deleted] += 1;
  }
  return deleted;
}

/** Photos in drafts/<id>/ whose draft is gone and that no business uses. */
async function deleteAbandonedDraftPhotos() {
  const db = supabaseAdmin();
  const folders = await listFolder("drafts");
  if (folders.length === 0) return 0;
  const [{ data: drafts, error: draftError }, { data: businesses, error: businessError }] = await Promise.all([
    db.from("build_drafts").select("id").in("id", folders),
    db.from("businesses").select("images").eq("source", "public"),
  ]);
  if (draftError || businessError) throw new Error((draftError ?? businessError)!.message);
  const live = new Set((drafts ?? []).map((d) => d.id));
  const used = new Set((businesses ?? []).flatMap((b) => imagePaths(b.images)));
  const orphans: string[] = [];
  for (const folder of folders.filter((f) => !live.has(f))) {
    for (const name of await listFolder(`drafts/${folder}`)) {
      const path = `drafts/${folder}/${name}`;
      if (!used.has(path)) orphans.push(path);
    }
  }
  await removeFiles(orphans);
  return orphans.length;
}

export async function runHousekeeping() {
  const sites = await deleteDueSites();
  const draftPhotos = await deleteAbandonedDraftPhotos();
  return {
    deletedExpiredPreviews: sites.expired,
    deletedCanceledSites: sites.canceled,
    deletedDraftPhotos: draftPhotos,
    ...(legal.retentionDays === null
      ? { skipped: "Cancelled sites were not checked: retentionDays is not set in src/config/legal.ts." }
      : {}),
  };
}
