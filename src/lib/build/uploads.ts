import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { DraftPhoto } from "./draft";

// Photos and logos from the public build flow. Every file is decoded by sharp
// (the browser's claimed type is not trusted), limited in size, resized to fit
// 2400px, re-encoded as WebP and stripped of all metadata (EXIF, GPS, colour
// profiles) before it is stored.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTOS = 10;
const MAX_EDGE = 2400;

export class UploadError extends Error {}

export type ProcessedImage = { buffer: Buffer; width: number; height: number; blur: string; color: string | null };

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

export async function processImage(file: File, kind: "photo" | "logo"): Promise<ProcessedImage> {
  if (file.size === 0) throw new UploadError("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("That file is over 10 MB. Use a smaller one.");
  const input = Buffer.from(await file.arrayBuffer());
  let meta;
  try {
    meta = await sharp(input, { limitInputPixels: 80_000_000 }).metadata();
  } catch {
    throw new UploadError("That doesn't look like an image. Use a JPEG, PNG, WebP or HEIC photo.");
  }
  if (
    !meta.width ||
    !meta.height ||
    !["jpeg", "png", "webp", "heif", "avif", "tiff", "gif"].includes(meta.format ?? "")
  ) {
    throw new UploadError("That doesn't look like an image. Use a JPEG, PNG, WebP or HEIC photo.");
  }
  if (kind === "photo" && Math.min(meta.width, meta.height) < 600) {
    throw new UploadError("That photo is too small to look good. Use one at least 600 pixels on each side.");
  }

  const pipeline = sharp(input, { limitInputPixels: 80_000_000 })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  const { data, info } = await pipeline
    .webp({ quality: kind === "logo" ? 90 : 82, alphaQuality: 90 })
    .toBuffer({ resolveWithObject: true });
  const blur = await sharp(data).resize(16).webp({ quality: 40 }).toBuffer();
  let color: string | null = null;
  if (kind === "logo") {
    const stats = await sharp(data).flatten({ background: "#ffffff" }).stats();
    color = toHex(stats.dominant.r, stats.dominant.g, stats.dominant.b);
  }
  return {
    buffer: data,
    width: info.width,
    height: info.height,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    color,
  };
}

/** Stores a processed image in the public site-images bucket under the draft's folder. */
export async function storeDraftImage(draftId: string, image: ProcessedImage): Promise<DraftPhoto> {
  const path = `drafts/${draftId}/${randomUUID()}.webp`;
  const { error } = await supabaseAdmin()
    .storage.from("site-images")
    .upload(path, image.buffer, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Could not store the photo: ${error.message}`);
  return { path, width: image.width, height: image.height, blur: image.blur };
}

export async function deleteDraftImage(path: string): Promise<void> {
  if (!path.startsWith("drafts/")) return;
  await supabaseAdmin().storage.from("site-images").remove([path]);
}
