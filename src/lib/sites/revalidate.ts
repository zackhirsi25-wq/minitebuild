import "server-only";
import { revalidateTag } from "next/cache";
import { siteTag } from "./public";

/** Drops the cached copy of a site so the next visit sees the change immediately. */
export function revalidateSite(slug: string) {
  revalidateTag(siteTag(slug), { expire: 0 });
}
