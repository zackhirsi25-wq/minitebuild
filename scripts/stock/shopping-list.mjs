// Writes stock-work/shopping-list.html: what to download by hand from
// pexels.com for each niche, with a website search link per search term.
//
//   node scripts/stock/shopping-list.mjs --niche roofing,plumbing
//
// Without --niche it lists every niche in the manifest.

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(import.meta.dirname, "stock-manifest.json");
const OUT = path.join(ROOT, "stock-work", "shopping-list.html");
const EXTRA = 1.5; // download about half again as many, so some can be rejected

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const flag = process.argv.indexOf("--niche");
const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
const wanted = flag > -1 ? process.argv[flag + 1].split(",") : manifest.niches.map((n) => n.id);
const unknown = wanted.filter((id) => !manifest.niches.some((n) => n.id === id));
if (unknown.length) throw new Error(`Unknown niche: ${unknown.join(", ")}`);
const niches = wanted.map((id) => manifest.niches.find((n) => n.id === id));

function searchUrl(term, orientation) {
  const url = `https://www.pexels.com/search/${encodeURIComponent(term)}/`;
  return orientation && orientation !== "any" ? `${url}?orientation=${orientation}` : url;
}

const perNiche = Object.values(manifest.slots).reduce((sum, s) => sum + s.keep_per_niche, 0);

const sections = niches
  .map((niche) => {
    const slots = Object.entries(manifest.slots)
      .map(([slot, rules]) => {
        const terms = niche.queries[slot] ?? [];
        return `<div class="slot">
  <h3>${esc(slot)} <span class="need">${rules.keep_per_niche} needed · aim for ${Math.ceil(rules.keep_per_niche * EXTRA)}</span></h3>
  <p>${esc(rules.use)}</p>
  <p class="spec">${rules.orientation === "any" ? "Any orientation" : `${rules.orientation[0].toUpperCase()}${rules.orientation.slice(1)}`} · at least ${rules.min_width}px wide</p>
  <ul class="terms">${terms.map((t) => `<li><a href="${esc(searchUrl(t, rules.orientation))}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul>
</div>`;
      })
      .join("");
    return `<section id="${esc(niche.id)}">
  <h2>${esc(niche.label)}</h2>
  <p class="folder">Save into <code>stock-src/${esc(niche.id)}/</code> · ${perNiche} photos needed, about ${Math.ceil(perNiche * EXTRA)} to download</p>
  ${slots}
</section>`;
  })
  .join("");

const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Stock shopping list</title>
<style>
:root{color-scheme:light dark;--bg:#f6f5f1;--fg:#16181d;--mut:#5b616c;--card:#fff;--line:#dcdde1;--acc:#05a081}
@media(prefers-color-scheme:dark){:root{--bg:#121417;--fg:#eceef1;--mut:#a0a6b0;--card:#1b1e23;--line:#2f333a;--acc:#3ddcb0}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;padding:32px 16px 80px}
main{max-width:980px;margin:0 auto}
h1{font-size:32px;line-height:1.15;margin:0 0 8px;letter-spacing:-.01em}
h2{font-size:24px;margin:0 0 4px}
h3{font-size:17px;margin:0 0 4px;text-transform:capitalize}
p{margin:0 0 8px;color:var(--mut);max-width:70ch}
code{font:600 14px ui-monospace,Consolas,monospace;color:var(--fg)}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 32px}
nav a{padding:6px 12px;border:1px solid var(--line);border-radius:999px;text-decoration:none;color:var(--fg);background:var(--card)}
.rules{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 20px;margin-bottom:32px}
.rules ul{margin:8px 0 0;padding-left:20px}.rules li{margin:4px 0;color:var(--mut)}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:24px;margin-bottom:24px;scroll-margin-top:16px}
.folder{color:var(--fg);margin-bottom:16px}
.slot{border-top:1px solid var(--line);padding:16px 0 4px}
.need{font-weight:500;font-size:14px;color:var(--acc);text-transform:none;margin-left:6px}
.spec{font-size:14px}
.terms{list-style:none;padding:0;margin:8px 0 8px;display:flex;flex-wrap:wrap;gap:8px}
.terms a{display:inline-block;padding:8px 14px;border-radius:8px;background:var(--bg);border:1px solid var(--line);color:var(--fg);text-decoration:none;font-weight:500}
.terms a:hover{border-color:var(--acc)}
.terms a:visited{color:var(--mut)}
a:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
</style>
<main>
  <h1>Stock shopping list</h1>
  <p>Download from pexels.com with <strong>Free download</strong>, choosing <strong>Original size</strong> so heroes are at least 2400px wide. Keep the file name Pexels gives you (<code>pexels-&lt;photographer&gt;-&lt;id&gt;.jpg</code>): the id becomes the credit link. Save every photo for a niche straight into its folder, with no slot folders. Download about half again as many as needed, so weaker ones can be rejected.</p>
  <nav>${niches.map((n) => `<a href="#${esc(n.id)}">${esc(n.label)}</a>`).join("")}</nav>
  <div class="rules"><strong>What gets rejected</strong><ul>${manifest.selection_rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
  ${sections}
</main>
</html>
`;

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, html);
console.log(`Wrote ${path.relative(ROOT, OUT)} (${niches.map((n) => n.id).join(", ")})`);
