import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { BUSINESS_TYPES } from "@/lib/business-type";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Progress through the build flow. The browser holds a random token in an
// httpOnly cookie; the database keeps only its SHA-256, next to the draft.
// The same token later proves who built a preview (businesses.edit_token_hash),
// so that person can change its design.

export const DRAFT_COOKIE = "mb_build";
const MAX_AGE = 60 * 60 * 24 * 30;

const photoSchema = z.object({
  path: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blur: z.string().startsWith("data:image/"),
});
export type DraftPhoto = z.infer<typeof photoSchema>;

const placeSchema = z.object({
  name: z.string(),
  city: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  hours: z.array(z.string()),
  category: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  placeId: z.string(),
});

export const draftSchema = z.object({
  name: z.string().default(""),
  city: z.string().default(""),
  phone: z.string().default(""),
  typeHint: z.enum(BUSINESS_TYPES).optional(),
  /** Template id, or undefined for "Let us choose". */
  template: z.string().optional(),
  /** Google result; `null` means looked up and not found; undefined = not looked up yet. */
  match: z
    .union([
      z.object({ found: z.literal(true), matchedBy: z.enum(["phone", "city"]), place: placeSchema }),
      z.object({ found: z.literal(false) }),
    ])
    .nullable()
    .optional(),
  confirmed: z.boolean().default(false),
  photos: z.array(photoSchema).max(10).default([]),
  logo: photoSchema.extend({ color: z.string().nullable() }).nullable().default(null),
  designChosen: z.boolean().default(false),
  slug: z.string().optional(),
});
export type Draft = z.infer<typeof draftSchema>;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function readToken(): Promise<string | null> {
  const value = (await cookies()).get(DRAFT_COOKIE)?.value;
  return value && /^[A-Za-z0-9_-]{40,}$/.test(value) ? value : null;
}

/** The current browser's draft, or null. */
export async function getDraft(): Promise<{ id: string; tokenHash: string; data: Draft } | null> {
  const token = await readToken();
  if (!token) return null;
  const tokenHash = hashToken(token);
  const { data } = await supabaseAdmin()
    .from("build_drafts")
    .select("id, data")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!data) return null;
  const parsed = draftSchema.safeParse(data.data);
  return { id: data.id, tokenHash, data: parsed.success ? parsed.data : draftSchema.parse({}) };
}

/**
 * Starts a new draft (new token and cookie). Called from a server action.
 * A previous preview built in this browser stays editable only through its
 * own token, so starting again never touches an existing site.
 */
export async function createDraft(data: Partial<Draft>): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const { data: row, error } = await supabaseAdmin()
    .from("build_drafts")
    .insert({ token_hash: hashToken(token), data: draftSchema.parse(data) })
    .select("id")
    .single();
  if (error) throw new Error(`Could not save your progress: ${error.message}`);
  (await cookies()).set(DRAFT_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return row.id;
}

export async function saveDraft(id: string, data: Draft, businessId?: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("build_drafts")
    .update({ data: draftSchema.parse(data), ...(businessId ? { business_id: businessId } : {}) })
    .eq("id", id);
  if (error) throw new Error(`Could not save your progress: ${error.message}`);
}

/** Whether this browser built the given business (its draft token matches). */
export async function isOwner(editTokenHash: string | null): Promise<boolean> {
  if (!editTokenHash) return false;
  const token = await readToken();
  return !!token && hashToken(token) === editTokenHash;
}
