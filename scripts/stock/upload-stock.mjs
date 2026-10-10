// Uploads the downloaded stock photos to the public Supabase bucket "stock"
// and adds a blur placeholder to each entry in public/stock/index.json.
//
//   node --env-file=.env.local scripts/stock/upload-stock.mjs [--niche roofing,plumbing]
//
// Run after `fetch-stock.mjs download`. Checks every file is a real image at
// the width index.json expects; files already in the bucket are skipped.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const INDEX = path.join(ROOT, "public", "stock", "index.json");
const BUCKET = "stock";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (use --env-file=.env.local).");
const auth = { apikey: key, Authorization: `Bearer ${key}` };

const nicheFlag = process.argv.indexOf("--niche");
const only = nicheFlag > -1 ? new Set(process.argv[nicheFlag + 1].split(",")) : null;

async function ensureBucket() {
  const res = await fetch(`${url}/storage/v1/bucket/${BUCKET}`, { headers: auth });
  if (res.ok) {
    const bucket = await res.json();
    if (!bucket.public) throw new Error(`Bucket "${BUCKET}" exists but isn't public.`);
    return;
  }
  const create = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 10 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    }),
  });
  if (!create.ok) throw new Error(`Could not create bucket "${BUCKET}": HTTP ${create.status} ${await create.text()}`);
  console.log(`Created public bucket "${BUCKET}".`);
}

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

async function main() {
  await ensureBucket();
  const index = JSON.parse(await fs.readFile(INDEX, "utf8"));
  let uploaded = 0;
  let skipped = 0;
  const problems = [];

  for (const [id, niche] of Object.entries(index)) {
    if (only && !only.has(id)) continue;
    for (const list of Object.values(niche.slots)) {
      for (const entry of list) {
        const local = path.join(ROOT, "public", "stock", entry.file);
        let buffer;
        try {
          buffer = await fs.readFile(local);
        } catch {
          problems.push(`${entry.file}: missing locally`);
          continue;
        }
        let meta;
        try {
          meta = await sharp(buffer).metadata();
        } catch {
          problems.push(`${entry.file}: not a readable image`);
          continue;
        }
        if (meta.width !== entry.width) {
          problems.push(`${entry.file}: ${meta.width}px wide, index.json expects ${entry.width}px`);
        }
        entry.width = meta.width;
        entry.height = meta.height;
        if (!entry.blur) {
          const blur = await sharp(buffer).resize(16).webp({ quality: 40 }).toBuffer();
          entry.blur = `data:image/webp;base64,${blur.toString("base64")}`;
        }

        const objectUrl = `${url}/storage/v1/object/${BUCKET}/${entry.file}`;
        const head = await fetch(`${url}/storage/v1/object/public/${BUCKET}/${entry.file}`, { method: "HEAD" });
        if (head.ok) {
          skipped++;
          continue;
        }
        const ext = path.extname(entry.file).slice(1).toLowerCase();
        const put = await fetch(objectUrl, {
          method: "POST",
          headers: { ...auth, "Content-Type": MIME[ext] ?? "application/octet-stream", "Cache-Control": "31536000", "x-upsert": "true" },
          body: buffer,
        });
        if (!put.ok) problems.push(`${entry.file}: upload failed (HTTP ${put.status} ${await put.text()})`);
        else uploaded++;
      }
    }
  }

  await fs.writeFile(INDEX, JSON.stringify(index, null, 2) + "\n");
  console.log(`Uploaded ${uploaded}, already there ${skipped}. Updated public/stock/index.json.`);
  if (problems.length) {
    console.log(`\n${problems.length} problems:`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exitCode = 1;
  }
}

await main();
