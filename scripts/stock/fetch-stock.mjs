#!/usr/bin/env node
// Builds the stock photo library from Pexels. No dependencies; needs Node 20+.
//
//   node scripts/stock/fetch-stock.mjs search     find candidates, write review pages
//   node scripts/stock/fetch-stock.mjs status     show progress per niche
//   node scripts/stock/fetch-stock.mjs download   download the photos picked in selection.json
//
// Flags: --niche roofing,plumbing   --per 12   --budget 180   --manifest path
// Key:   PEXELS_API_KEY in the environment or in .env.local

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const WORK = path.join(ROOT, 'stock-work');
const CANDIDATES = path.join(WORK, 'candidates.json');
const SELECTION = path.join(WORK, 'selection.json');
const REVIEW = path.join(WORK, 'review');
const API = (process.env.PEXELS_API_BASE || 'https://api.pexels.com/v1').replace(/\/$/, '');
const IMAGE_HOSTS = new Set(['images.pexels.com']);
if (process.env.PEXELS_API_BASE) IMAGE_HOSTS.add(new URL(API).host);

const [command, ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) flags[rest[i].slice(2)] = rest[i + 1]?.startsWith('--') || rest[i + 1] === undefined ? 'true' : rest[++i];
}

const exists = (p) => access(p).then(() => true, () => false);
const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'));
const writeJson = (p, data) => writeFile(p, JSON.stringify(data, null, 2) + '\n');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const label = (slot, i) => `${slot[0]}${i + 1}`;

async function loadManifest() {
  const p = flags.manifest ? path.resolve(flags.manifest) : path.join(HERE, 'stock-manifest.json');
  if (!(await exists(p))) throw new Error(`Manifest not found at ${p}`);
  const manifest = await readJson(p);
  if (flags.niche) {
    const wanted = new Set(flags.niche.split(','));
    const unknown = [...wanted].filter((id) => !manifest.niches.some((n) => n.id === id));
    if (unknown.length) throw new Error(`Unknown niche: ${unknown.join(', ')}`);
    manifest.niches = manifest.niches.filter((n) => wanted.has(n.id));
  }
  return manifest;
}

async function loadKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY.trim();
  for (const file of ['.env.local', '.env']) {
    const p = path.join(ROOT, file);
    if (!(await exists(p))) continue;
    const line = (await readFile(p, 'utf8')).split(/\r?\n/).find((l) => /^\s*PEXELS_API_KEY\s*=/.test(l));
    const value = line?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    if (value) return value;
  }
  throw new Error('PEXELS_API_KEY is missing. Add it to .env.local (get one at https://www.pexels.com/api/).');
}

// ---------- search ----------

async function search() {
  const manifest = await loadManifest();
  const key = await loadKey();
  const perPage = Math.min(Number(flags.per || 12), 80);
  const budget = Number(flags.budget || 180); // Pexels allows 200 searches an hour
  await mkdir(REVIEW, { recursive: true });
  const state = (await exists(CANDIDATES)) ? await readJson(CANDIDATES) : { done: [], niches: {} };
  const done = new Set(state.done);
  let used = 0;
  let stopped = '';
  let total = 0;

  outer: for (const niche of manifest.niches) {
    for (const [slot, rules] of Object.entries(manifest.slots)) {
      for (const query of niche.queries[slot] || []) {
        total++;
        const id = `${niche.id}|${slot}|${query}`;
        if (done.has(id)) continue;
        if (used >= budget) { stopped = 'budget'; continue; }
        const url = new URL(`${API}/search`);
        url.searchParams.set('query', query);
        url.searchParams.set('per_page', String(perPage));
        url.searchParams.set('size', 'small');
        if (rules.orientation !== 'any') url.searchParams.set('orientation', rules.orientation);
        const res = await fetch(url, { headers: { Authorization: key } });
        used++;
        if (res.status === 429) { stopped = 'rate'; break outer; }
        if (res.status === 401 || res.status === 403) throw new Error(`Pexels rejected the API key (HTTP ${res.status}).`);
        if (!res.ok) { console.warn(`  skipped "${query}" (HTTP ${res.status}); it will be retried next run`); continue; }
        const body = await res.json();
        const bucket = ((state.niches[niche.id] ??= {})[slot] ??= []);
        const seen = new Set(Object.values(state.niches[niche.id]).flat().map((p) => p.id));
        for (const p of body.photos || []) {
          if (seen.has(p.id) || p.width < rules.min_width) continue;
          seen.add(p.id);
          bucket.push({
            id: p.id, width: p.width, height: p.height, alt: p.alt || '', avg_color: p.avg_color || '',
            photographer: p.photographer, photographer_url: p.photographer_url, url: p.url,
            thumb: p.src?.medium, original: p.src?.original, query,
          });
        }
        done.add(id);
        state.done = [...done];
        await writeJson(CANDIDATES, state);
        console.log(`  ${niche.id} / ${slot} / "${query}" -> ${bucket.length} candidates`);
      }
    }
  }

  await writeReview(manifest, state);
  const finished = [...done].length;
  console.log(`\nSearches finished: ${finished}${flags.niche ? '' : ` of ${total}`}. Review pages: ${path.relative(ROOT, path.join(REVIEW, 'index.html'))}`);
  if (stopped) {
    console.log('Stopped at the hourly limit (Pexels allows 200 searches an hour).');
    console.log('Run the same command again in about an hour. It continues where it stopped.');
    process.exitCode = 2;
  }
}

// ---------- review pages ----------

const CSS = `
:root{color-scheme:light dark;--bg:#f5f5f2;--fg:#15171c;--mut:#5d6470;--card:#fff;--line:#d8dbe1;--pick:#0b7a4d;--chip:#15171c;--chipfg:#fff}
@media(prefers-color-scheme:dark){:root{--bg:#131519;--fg:#eceef2;--mut:#9ba2ae;--card:#1c1f25;--line:#31353d;--pick:#3ddc97;--chip:#eceef2;--chipfg:#131519}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;padding:24px 16px 160px}
main{max-width:1280px;margin:0 auto}h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:40px 0 4px}p{margin:0 0 12px;color:var(--mut);max-width:70ch}
a{color:inherit}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.card{position:relative;margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:pointer;padding:0;text-align:left;color:inherit;font:inherit}
.card img{display:block;width:100%;height:170px;object-fit:cover;background:var(--line)}
.card .tag{position:absolute;top:8px;left:8px;background:var(--chip);color:var(--chipfg);font-weight:700;font-size:20px;line-height:1;padding:6px 9px;border-radius:6px}
.card .meta{display:block;padding:8px 10px;font-size:13px;color:var(--mut);overflow-wrap:anywhere}
.card[aria-pressed=true]{outline:4px solid var(--pick);outline-offset:-4px}.card[aria-pressed=true] .tag{background:var(--pick);color:#fff}
.card:focus-visible{outline:3px solid var(--fg);outline-offset:2px}
.bar{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:12px 16px}
.bar div{max-width:1280px;margin:0 auto;display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}
textarea{flex:1 1 320px;min-height:84px;font:13px/1.4 ui-monospace,monospace;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:8px}
button.copy{font:inherit;font-weight:600;padding:10px 16px;border-radius:6px;border:1px solid var(--fg);background:var(--fg);color:var(--bg);cursor:pointer}
ul{padding-left:20px}li{margin:4px 0}`;

async function writeReview(manifest, state) {
  await mkdir(REVIEW, { recursive: true });
  const rows = [];
  for (const niche of manifest.niches) {
    const slots = state.niches[niche.id];
    if (!slots) continue;
    let sections = '';
    for (const [slot, rules] of Object.entries(manifest.slots)) {
      const photos = slots[slot] || [];
      sections += `<h2>${esc(slot)}: pick ${rules.keep_per_niche} <span data-count="${esc(slot)}"></span></h2><p>${esc(rules.use)}</p><div class="grid">` +
        photos.map((p, i) => `<button class="card" type="button" aria-pressed="false" data-slot="${esc(slot)}" data-label="${label(slot, i)}">` +
          `<img loading="lazy" src="${esc(p.thumb)}" alt="${esc(p.alt)}"><span class="tag">${label(slot, i)}</span>` +
          `<span class="meta">${p.width}×${p.height} · ${esc(p.photographer)} · id ${p.id}</span></button>`).join('') + '</div>';
    }
    const script = `const N=${JSON.stringify(niche.id).replace(/</g, '\\u003c')},K='stock-picks-'+N;let picks={};try{picks=JSON.parse(localStorage.getItem(K))||{}}catch{}
const out=document.querySelector('textarea');function draw(){document.querySelectorAll('.card').forEach(c=>c.setAttribute('aria-pressed',String((picks[c.dataset.slot]||[]).includes(c.dataset.label))));
document.querySelectorAll('[data-count]').forEach(s=>s.textContent='('+(picks[s.dataset.count]||[]).length+' picked)');out.value=JSON.stringify({[N]:picks},null,2);try{localStorage.setItem(K,JSON.stringify(picks))}catch{}}
document.addEventListener('click',e=>{const c=e.target.closest('.card');if(c){const a=picks[c.dataset.slot]||(picks[c.dataset.slot]=[]),i=a.indexOf(c.dataset.label);i===-1?a.push(c.dataset.label):a.splice(i,1);draw()}
if(e.target.closest('.copy')){out.select();navigator.clipboard?.writeText(out.value).then(()=>{e.target.textContent='Copied'},()=>{})}});draw();`;
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(niche.label)} stock review</title><style>${CSS}</style>` +
      `<main><p><a href="index.html">All niches</a></p><h1>${esc(niche.label)}</h1><p>Click a photo to pick it. The first pick in each slot becomes the default.</p>${sections}</main>` +
      `<div class="bar"><div><textarea readonly aria-label="Picks for this niche"></textarea><button class="copy" type="button">Copy picks</button></div></div><script>${script}</script></html>`;
    await writeFile(path.join(REVIEW, `${niche.id}.html`), html);
    rows.push(`<li><a href="${esc(niche.id)}.html">${esc(niche.label)}</a> (${Object.values(slots).flat().length} candidates)</li>`);
  }
  const index = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stock review</title><style>${CSS}</style>` +
    `<main><h1>Stock photo review</h1><p>Open a niche, pick photos for each slot, then save the picks in stock-work/selection.json as one object keyed by niche id, for example {"roofing":{"hero":["h3","h1","h7"]}}. Then run the download command.</p><ul>${rows.join('')}</ul></main></html>`;
  await writeFile(path.join(REVIEW, 'index.html'), index);
}

// ---------- download ----------

function resolvePicks(manifest, state, selection, kept = {}) {
  const problems = [];
  // Photos already in index.json for niches outside this run count as used.
  const used = new Map();
  for (const [id, entry] of Object.entries(kept)) {
    for (const [slot, list] of Object.entries(entry.slots)) for (const p of list) used.set(p.pexels_id, `${id}/${slot}`);
  }
  const jobs = [];
  for (const niche of manifest.niches) {
    for (const [slot, rules] of Object.entries(manifest.slots)) {
      const picks = selection[niche.id]?.[slot] || [];
      const pool = state.niches[niche.id]?.[slot] || [];
      if (picks.length < rules.keep_per_niche) problems.push(`${niche.id}/${slot}: ${picks.length} picked, ${rules.keep_per_niche} wanted`);
      picks.forEach((pick, n) => {
        const m = /^[a-z](\d+)$/.exec(String(pick));
        const photo = m ? pool[Number(m[1]) - 1] : pool.find((p) => String(p.id) === String(pick));
        if (!photo) return problems.push(`${niche.id}/${slot}: "${pick}" is not a candidate`);
        if (used.has(photo.id)) return problems.push(`${niche.id}/${slot}: photo ${photo.id} is already used by ${used.get(photo.id)}`);
        used.set(photo.id, `${niche.id}/${slot}`);
        jobs.push({ niche, slot, n: n + 1, photo, width: Math.min(photo.width, rules.min_width) });
      });
    }
  }
  return { jobs, problems };
}

async function download() {
  const manifest = await loadManifest();
  if (!(await exists(CANDIDATES))) throw new Error('No candidates yet. Run the search command first.');
  if (!(await exists(SELECTION))) throw new Error(`No picks yet. Create ${path.relative(ROOT, SELECTION)} first.`);
  const state = await readJson(CANDIDATES);
  const outDir = path.join(ROOT, manifest.output_dir);
  // Keep niches that aren't part of this run (--niche), so one niche at a time works.
  const indexPath = path.join(outDir, 'index.json');
  const index = (await exists(indexPath)) ? await readJson(indexPath) : {};
  for (const niche of manifest.niches) delete index[niche.id];
  const { jobs, problems } = resolvePicks(manifest, state, await readJson(SELECTION), index);
  let fetched = 0;
  let failed = 0;

  const run = async (job) => {
    const src = new URL(job.photo.original);
    if (!IMAGE_HOSTS.has(src.host)) { failed++; return problems.push(`${job.photo.id}: unexpected image host ${src.host}`); }
    for (const [k, v] of Object.entries({ auto: 'compress', cs: 'tinysrgb', fm: 'jpg', q: '80', w: String(job.width) })) src.searchParams.set(k, v);
    const dir = path.join(outDir, job.niche.id);
    await mkdir(dir, { recursive: true });
    const base = `${job.slot}-${job.n}-${job.photo.id}`;
    let file = ['jpg', 'png', 'webp'].map((e) => `${base}.${e}`);
    let found = null;
    for (const f of file) if (await exists(path.join(dir, f))) found = f;
    if (!found) {
      const res = await fetch(src);
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.startsWith('image/')) { failed++; return problems.push(`${job.photo.id}: download failed (HTTP ${res.status})`); }
      found = `${base}.${type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'}`;
      await writeFile(path.join(dir, found), Buffer.from(await res.arrayBuffer()));
      fetched++;
    }
    const entry = (index[job.niche.id] ??= { label: job.niche.label, google_types: job.niche.google_types, keywords: job.niche.keywords, slots: {} });
    (entry.slots[job.slot] ??= []).push({
      order: job.n, file: `${job.niche.id}/${found}`, width: job.width, height: Math.round((job.photo.height * job.width) / job.photo.width),
      alt: job.photo.alt, avg_color: job.photo.avg_color, pexels_id: job.photo.id,
      photographer: job.photo.photographer, photographer_url: job.photo.photographer_url, source_url: job.photo.url,
    });
  };
  const queue = [...jobs];
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await run(queue.shift()); }));

  for (const entry of Object.values(index)) for (const list of Object.values(entry.slots)) list.sort((a, b) => a.order - b.order);
  await mkdir(outDir, { recursive: true });
  await writeJson(path.join(outDir, 'index.json'), index);
  let credits = '# Photo credits\n\nStock photos are from [Pexels](https://www.pexels.com) and used under the [Pexels licence](https://www.pexels.com/license/).\n';
  for (const entry of Object.values(index)) {
    credits += `\n## ${entry.label}\n\n`;
    // Photos ingested by hand (ingest-manual.mjs) have no photographer profile link.
    for (const list of Object.values(entry.slots)) for (const p of list) credits += `- \`${p.file}\`: [photo](${p.source_url}) by ${p.photographer_url ? `[${p.photographer}](${p.photographer_url})` : p.photographer} on Pexels\n`;
  }
  await writeFile(path.join(ROOT, manifest.credits_file), credits);

  console.log(`Downloaded ${fetched} new photos (${jobs.length - fetched - failed} already present) into ${manifest.output_dir}`);
  console.log(`Wrote ${manifest.output_dir}/index.json and ${manifest.credits_file}`);
  if (problems.length) {
    console.log(`\n${problems.length} things to fix:`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exitCode = 1;
  }
}

// ---------- status ----------

async function status() {
  const manifest = await loadManifest();
  const state = (await exists(CANDIDATES)) ? await readJson(CANDIDATES) : { done: [], niches: {} };
  const selection = (await exists(SELECTION)) ? await readJson(SELECTION) : {};
  const slots = Object.keys(manifest.slots);
  console.log(['niche'.padEnd(22), ...slots.map((s) => s.padEnd(12))].join('') + '(candidates/picked/wanted)');
  for (const niche of manifest.niches) {
    console.log(niche.id.padEnd(22) + slots.map((s) => `${state.niches[niche.id]?.[s]?.length || 0}/${selection[niche.id]?.[s]?.length || 0}/${manifest.slots[s].keep_per_niche}`.padEnd(12)).join(''));
  }
  const total = manifest.niches.reduce((sum, n) => sum + Object.values(n.queries).flat().length, 0);
  console.log(`\nSearches finished: ${state.done.length} of ${total}`);
}

const commands = { search, download, status };
if (!commands[command]) {
  console.log('Usage: node fetch-stock.mjs <search|status|download> [--niche a,b] [--per 12] [--budget 180]');
  process.exit(command ? 1 : 0);
}
commands[command]().catch((err) => { console.error(`Error: ${err.message}`); process.exit(1); });
