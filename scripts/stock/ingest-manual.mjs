// Manual path into the stock library, for photos downloaded by hand from
// pexels.com into stock-src/<niche>/. Same output as `fetch-stock.mjs download`.
//
//   node scripts/stock/ingest-manual.mjs prepare --niche roofing
//     Reads every photo in stock-src/roofing/, writes small previews to
//     stock-work/manual/roofing/ for review, and lists files whose name has no
//     Pexels id.
//   (review: write the slot for every photo in stock-work/manual-picks.json)
//   node scripts/stock/ingest-manual.mjs ingest --niche roofing
//     Resizes picked photos to their slot width into public/stock/roofing/,
//     merges the niche into public/stock/index.json and rewrites CREDITS.md.
//   Then: npm run stock:upload -- --niche roofing
//
// manual-picks.json, one object per niche:
//   { "roofing": {
//       "hero":    [{ "file": "pexels-jane-doe-123.jpg", "alt": "…", "focal": [50, 40] }],
//       "about": [...], "gallery": [...], "detail": [...],
//       "rejected": { "pexels-x-456.jpg": "Visible company logo on the truck" } } }
// The first photo in a slot is the default. A file without an id in its name
// needs "source_url" and "photographer" in its pick.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MANIFEST = path.join(import.meta.dirname, "stock-manifest.json");
const SRC = path.join(ROOT, "stock-src");
const WORK = path.join(ROOT, "stock-work", "manual");
const PICKS = path.join(ROOT, "stock-work", "manual-picks.json");
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

const [command, ...rest] = process.argv.slice(2);
const flag = rest.indexOf("--niche");
const nicheIds = flag > -1 ? rest[flag + 1].split(",") : [];

const readJson = async (p, fallback) => {
  try {
    return JSON.parse(await fs.readFile(p, "utf8"));
  } catch (error) {
    if (fallback !== undefined && error.code === "ENOENT") return fallback;
    throw error;
  }
};

const titleCase = (slug) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Pexels names downloads pexels-<photographer>-<id>.jpg; newer ones add the
 * photographer's numeric user id (pexels-alex-andrews-271121-9666306.jpg) and
 * older ones are pexels-photo-<id>.jpeg. Browsers add " (1)" to repeats.
 */
export function parsePexelsName(file) {
  const base = file.replace(IMAGE, "").replace(/\s*\(\d+\)$/, "");
  let m = base.match(/^pexels-photo-(\d{3,})$/i);
  if (m) return { id: Number(m[1]), photographer: null };
  m = base.match(/^pexels-(.+)-(\d{3,})$/i);
  if (!m) return null;
  const name = m[1]
    .split("-")
    .filter((part) => !/^\d{5,}$/.test(part))
    .join("-");
  return { id: Number(m[2]), photographer: name ? titleCase(name) : null };
}

async function loadManifest() {
  const manifest = await readJson(MANIFEST);
  const unknown = nicheIds.filter((id) => !manifest.niches.some((n) => n.id === id));
  if (!nicheIds.length || unknown.length) {
    throw new Error(unknown.length ? `Unknown niche: ${unknown.join(", ")}` : "Pass --niche <id>[,<id>]");
  }
  return manifest;
}

async function listPhotos(niche) {
  const dir = path.join(SRC, niche);
  const files = (await fs.readdir(dir).catch(() => [])).filter((f) => IMAGE.test(f)).sort();
  return files.map((file) => ({ file, path: path.join(dir, file) }));
}

// ---------- prepare ----------

async function prepare() {
  await loadManifest();
  for (const niche of nicheIds) {
    const photos = await listPhotos(niche);
    const out = path.join(WORK, niche);
    await fs.mkdir(out, { recursive: true });
    const rows = [];
    for (const { file, path: p } of photos) {
      let meta;
      try {
        meta = await sharp(p).rotate().metadata();
      } catch {
        rows.push({ file, error: "not a readable image" });
        continue;
      }
      const width = meta.autoOrient?.width ?? meta.width;
      const height = meta.autoOrient?.height ?? meta.height;
      await sharp(p).rotate().resize({ width: 900, height: 900, fit: "inside" }).jpeg({ quality: 78 }).toFile(path.join(out, `${file}.preview.jpg`));
      rows.push({ file, ...parsePexelsName(file), width, height, orientation: width > height * 1.1 ? "landscape" : height > width * 1.1 ? "portrait" : "square" });
    }
    await fs.writeFile(path.join(out, "files.json"), JSON.stringify(rows, null, 2) + "\n");
    console.log(`\n${niche}: ${rows.length} photos (previews in ${path.relative(ROOT, out)})`);
    for (const r of rows) {
      const note = r.error ? `ERROR ${r.error}` : `${r.width}x${r.height} ${r.orientation}${r.id ? ` id ${r.id}` : "  NO ID IN NAME"}${r.id && !r.photographer ? "  no photographer in name" : ""}`;
      console.log(`  ${r.file}  ${note}`);
    }
  }
}

// ---------- ingest ----------

function creditsMarkdown(index) {
  let md = "# Photo credits\n\nStock photos are from [Pexels](https://www.pexels.com) and used under the [Pexels licence](https://www.pexels.com/license/).\n";
  for (const entry of Object.values(index)) {
    md += `\n## ${entry.label}\n\n`;
    for (const list of Object.values(entry.slots)) {
      for (const p of list) {
        const by = p.photographer_url ? `[${p.photographer}](${p.photographer_url})` : p.photographer;
        md += `- \`${p.file}\`: [photo](${p.source_url}) by ${by} on Pexels\n`;
      }
    }
  }
  return md;
}

async function ingest() {
  const manifest = await loadManifest();
  const allPicks = await readJson(PICKS, {});
  const outRoot = path.join(ROOT, manifest.output_dir);
  const indexPath = path.join(outRoot, "index.json");
  const index = await readJson(indexPath, {});
  const problems = [];
  const short = [];

  // Pexels ids used by other niches already in the library.
  const usedElsewhere = new Map();
  for (const [id, entry] of Object.entries(index)) {
    if (nicheIds.includes(id)) continue;
    for (const [slot, list] of Object.entries(entry.slots)) for (const p of list) usedElsewhere.set(p.pexels_id, `${id}/${slot}`);
  }

  for (const nicheId of nicheIds) {
    const niche = manifest.niches.find((n) => n.id === nicheId);
    const picks = allPicks[nicheId];
    if (!picks) {
      problems.push(`${nicheId}: no entry in stock-work/manual-picks.json`);
      continue;
    }
    const photos = await listPhotos(nicheId);
    const assigned = new Set([...Object.keys(manifest.slots).flatMap((s) => (picks[s] ?? []).map((p) => p.file)), ...Object.keys(picks.rejected ?? {})]);
    for (const { file } of photos) if (!assigned.has(file)) problems.push(`${nicheId}/${file}: not assigned to a slot or rejected`);

    const outDir = path.join(outRoot, nicheId);
    await fs.mkdir(outDir, { recursive: true });
    const entry = { label: niche.label, google_types: niche.google_types, keywords: niche.keywords, slots: {} };
    const usedHere = new Set();

    for (const [slot, rules] of Object.entries(manifest.slots)) {
      const list = picks[slot] ?? [];
      if (list.length < rules.keep_per_niche) short.push(`${nicheId}/${slot}: ${list.length} of ${rules.keep_per_niche}`);
      let n = 0;
      for (const pick of list) {
        const src = path.join(SRC, nicheId, pick.file);
        const parsed = parsePexelsName(pick.file);
        const id = parsed?.id ?? (pick.source_url?.match(/(\d{3,})\/?$/) ? Number(pick.source_url.match(/(\d{3,})\/?$/)[1]) : null);
        const photographer = pick.photographer ?? parsed?.photographer;
        if (!id) {
          problems.push(`${nicheId}/${pick.file}: no Pexels id in the name; add "source_url" to its pick`);
          continue;
        }
        if (!photographer) {
          problems.push(`${nicheId}/${pick.file}: no photographer in the name; add "photographer" to its pick`);
          continue;
        }
        if (usedElsewhere.has(id)) {
          problems.push(`${nicheId}/${pick.file}: photo ${id} is already used by ${usedElsewhere.get(id)}`);
          continue;
        }
        if (usedHere.has(id)) {
          problems.push(`${nicheId}/${pick.file}: photo ${id} is picked twice`);
          continue;
        }
        if (!pick.alt || pick.alt.length < 5) {
          problems.push(`${nicheId}/${pick.file}: needs alt text`);
          continue;
        }
        let meta;
        try {
          meta = await sharp(src).rotate().metadata();
        } catch {
          problems.push(`${nicheId}/${pick.file}: missing or not a readable image`);
          continue;
        }
        const srcWidth = meta.autoOrient?.width ?? meta.width;
        const srcHeight = meta.autoOrient?.height ?? meta.height;
        if (srcWidth < rules.min_width) {
          problems.push(`${nicheId}/${pick.file}: ${srcWidth}px wide, ${slot} needs ${rules.min_width}px`);
          continue;
        }
        usedHere.add(id);
        n++;
        const width = Math.min(srcWidth, rules.min_width);
        const file = `${slot}-${n}-${id}.jpg`;
        // Same format as the API download: JPEG, quality 80, metadata stripped (sharp's default).
        const info = await sharp(src).rotate().resize({ width }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(outDir, file));
        (entry.slots[slot] ??= []).push({
          order: n,
          file: `${nicheId}/${file}`,
          width: info.width,
          height: info.height ?? Math.round((srcHeight * width) / srcWidth),
          alt: pick.alt,
          avg_color: "",
          ...(pick.focal ? { focal: pick.focal } : {}),
          pexels_id: id,
          photographer,
          photographer_url: pick.photographer_url ?? null,
          source_url: pick.source_url ?? `https://www.pexels.com/photo/${id}/`,
        });
      }
    }
    index[nicheId] = entry;
    const rejected = Object.entries(picks.rejected ?? {});
    console.log(`${nicheId}: ${Object.values(entry.slots).flat().length} photos kept, ${rejected.length} rejected`);
    for (const [file, why] of rejected) console.log(`  rejected ${file}: ${why}`);
  }

  await fs.mkdir(outRoot, { recursive: true });
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2) + "\n");
  await fs.writeFile(path.join(ROOT, manifest.credits_file), creditsMarkdown(index));
  console.log(`Wrote ${manifest.output_dir}/index.json and ${manifest.credits_file}`);
  if (short.length) {
    console.log(`\nSlots that still need photos:`);
    for (const s of short) console.log(`  - ${s}`);
  }
  if (problems.length) {
    console.log(`\n${problems.length} things to fix:`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exitCode = 1;
  }
}

const commands = { prepare, ingest };
if (!commands[command]) {
  console.log("Usage: node scripts/stock/ingest-manual.mjs <prepare|ingest> --niche <id>[,<id>]");
  process.exit(command ? 1 : 0);
}
await commands[command]();
