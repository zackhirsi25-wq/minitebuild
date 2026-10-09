// Generates the stock images in public/stock/ from SVG drawings.
//
//   node scripts/generate-stock-art.mjs
//
// These are illustrations, so the repo ships with images that need no
// licence. To use photographs instead, drop JPEGs with the same file names
// into public/stock/<trade>/ (same aspect ratio: hero 3:2, about 4:3) and
// update the alt text in src/lib/images/stock.ts.

import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "stock");

// Small deterministic PRNG so the output is identical on every run.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const svg = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

function grid(w, h, step, color, width = 1) {
  let d = "";
  for (let x = 0; x <= w; x += step) d += `M${x} 0V${h}`;
  for (let y = 0; y <= h; y += step) d += `M0 ${y}H${w}`;
  return `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
}

// ---------------------------------------------------------------------------
// General contractor
// ---------------------------------------------------------------------------

function gcHeroBlueprint() {
  const w = 1600,
    h = 1067;
  const line = "#cfe3ff";
  const baseY = 860,
    left = 420,
    right = 1180,
    wallTop = 560,
    ridge = 300;
  let studs = "";
  for (let x = left + 40; x < right; x += 48)
    studs += `<line x1="${x}" y1="${wallTop + 12}" x2="${x}" y2="${baseY - 12}" />`;
  let rafters = "";
  for (let i = 1; i < 16; i++) {
    const t = i / 16;
    const x = left + (right - left) * t;
    const y =
      x <= 800
        ? wallTop - (wallTop - ridge) * ((x - left) / (800 - left))
        : wallTop - (wallTop - ridge) * ((right - x) / (right - 800));
    rafters += `<line x1="${x}" y1="${wallTop}" x2="${x}" y2="${y}" />`;
  }
  const body = `
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    ${grid(w, h, 40, "rgba(160,200,255,0.10)")}
    ${grid(w, h, 200, "rgba(160,200,255,0.18)", 1.5)}
    <g stroke="${line}" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${left - 60} ${wallTop + 4} L800 ${ridge - 40} L${right + 60} ${wallTop + 4}" stroke-width="5"/>
      <rect x="${left}" y="${wallTop}" width="${right - left}" height="${baseY - wallTop}" stroke-width="5"/>
      <g stroke-width="2" opacity="0.75">${studs}${rafters}</g>
      <line x1="${left}" y1="${wallTop + 12}" x2="${right}" y2="${wallTop + 12}" stroke-width="3"/>
      <line x1="${left}" y1="${baseY - 12}" x2="${right}" y2="${baseY - 12}" stroke-width="3"/>
      <rect x="560" y="640" width="150" height="140" stroke-width="4" fill="#1b3354"/>
      <rect x="900" y="660" width="120" height="200" stroke-width="4" fill="#1b3354"/>
      <line x1="635" y1="640" x2="635" y2="780" stroke-width="2"/>
      <line x1="560" y1="710" x2="710" y2="710" stroke-width="2"/>
      <line x1="280" y1="${baseY}" x2="1320" y2="${baseY}" stroke-width="4"/>
      <g stroke-width="1.5" opacity="0.8">
        <line x1="${left}" y1="930" x2="${right}" y2="930"/>
        <line x1="${left}" y1="915" x2="${left}" y2="945"/><line x1="${right}" y1="915" x2="${right}" y2="945"/>
        <line x1="1260" y1="${ridge - 40}" x2="1260" y2="${baseY}"/>
        <line x1="1245" y1="${ridge - 40}" x2="1275" y2="${ridge - 40}"/><line x1="1245" y1="${baseY}" x2="1275" y2="${baseY}"/>
      </g>
    </g>
    <g fill="${line}" font-family="monospace" font-size="22" opacity="0.85">
      <text x="760" y="965">32'-0"</text>
      <text x="1285" y="600">24'-6"</text>
    </g>`;
  const defs = `<radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#1d3a63"/><stop offset="1" stop-color="#0d1b2e"/></radialGradient>`;
  return { w, h, svg: svg(w, h, body, defs) };
}

function gcHeroDusk() {
  const w = 1600,
    h = 1067;
  const r = rng(7);
  const ground = 820;
  let frame = "";
  // Wall studs for a two-storey frame
  for (let x = 380; x <= 1220; x += 42) frame += `<rect x="${x}" y="470" width="10" height="${ground - 470}"/>`;
  frame += `<rect x="370" y="460" width="870" height="16"/><rect x="370" y="640" width="870" height="14"/><rect x="370" y="${ground - 14}" width="870" height="14"/>`;
  // Trusses
  for (let x = 380; x <= 1230; x += 70) {
    frame += `<path d="M${x} 470 L805 250 L${Math.min(x + 10, 1240)} 470" stroke="#1a1410" stroke-width="7" fill="none"/>`;
  }
  frame += `<path d="M340 476 L805 236 L1270 476" stroke="#1a1410" stroke-width="16" fill="none" stroke-linejoin="round"/>`;
  let stars = "";
  for (let i = 0; i < 40; i++)
    stars += `<circle cx="${r() * w}" cy="${r() * 300}" r="${0.8 + r() * 1.4}" fill="#fff" opacity="${0.25 + r() * 0.5}"/>`;
  const body = `
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    ${stars}
    <circle cx="1210" cy="610" r="120" fill="#ffd58a" opacity="0.55"/>
    <path d="M0 ${ground - 40} Q 300 ${ground - 110} 620 ${ground - 60} T 1600 ${ground - 70} V ${h} H 0 Z" fill="#3b2a3f" opacity="0.7"/>
    <g fill="#1a1410">${frame}</g>
    <rect x="0" y="${ground}" width="${w}" height="${h - ground}" fill="#16110e"/>
    <g fill="#1a1410"><rect x="150" y="700" width="16" height="${ground - 700}"/><path d="M110 700 h200 l-20 -40 h-160 z"/></g>`;
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2350"/><stop offset="0.45" stop-color="#8a4a6b"/><stop offset="0.75" stop-color="#e48a5a"/><stop offset="1" stop-color="#f6c27a"/></linearGradient>`;
  return { w, h, svg: svg(w, h, body, defs) };
}

function gcAboutLumber() {
  const w = 1200,
    h = 900;
  const r = rng(11);
  let ends = "";
  const size = 150;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 9; col++) {
      const x = col * size - (row % 2 ? size / 2 : 0) + 20;
      const y = row * (size * 0.86) - 40;
      const tone = ["#d9a066", "#c98d52", "#e3b47a", "#b97a43"][Math.floor(r() * 4)];
      let rings = "";
      for (let k = 1; k <= 5; k++)
        rings += `<circle cx="${x + size / 2 + (r() - 0.5) * 8}" cy="${y + size / 2 + (r() - 0.5) * 8}" r="${(size / 2 - 8) * (k / 6)}" fill="none" stroke="#8a5528" stroke-opacity="0.35" stroke-width="2"/>`;
      ends += `<rect x="${x + 4}" y="${y + 4}" width="${size - 8}" height="${size - 8}" rx="10" fill="${tone}"/>${rings}`;
    }
  }
  const body = `<rect width="${w}" height="${h}" fill="#5a3a1f"/>${ends}<rect width="${w}" height="${h}" fill="url(#shade)"/>`;
  const defs = `<linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.08"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>`;
  return { w, h, svg: svg(w, h, body, defs) };
}

function gcAboutSteel() {
  const w = 1200,
    h = 900;
  const beam = (x, y, len, angle, color) =>
    `<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="0" y="-38" width="${len}" height="14" fill="${color}"/><rect x="0" y="24" width="${len}" height="14" fill="${color}"/><rect x="0" y="-26" width="${len}" height="52" fill="${color}" opacity="0.75"/></g>`;
  const body = `
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    ${grid(w, h, 60, "rgba(255,255,255,0.05)")}
    ${beam(-100, 220, 1500, 0, "#f59e0b")}
    ${beam(-100, 600, 1500, 0, "#d97706")}
    ${beam(260, -100, 1200, 90, "#fbbf24")}
    ${beam(860, -100, 1200, 90, "#f59e0b")}
    ${beam(260, 220, 700, 32, "#b45309")}
    <g fill="#1f2937">${[260, 860].flatMap((x) => [220, 600].map((y) => `<circle cx="${x}" cy="${y}" r="9"/><circle cx="${x + 28}" cy="${y}" r="9"/>`)).join("")}</g>`;
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb4c7"/><stop offset="1" stop-color="#5d7287"/></linearGradient>`;
  return { w, h, svg: svg(w, h, body, defs) };
}

// ---------------------------------------------------------------------------
// Remodeling
// ---------------------------------------------------------------------------

function remHeroKitchen() {
  const w = 1600,
    h = 1067;
  const ink = "#3b3328";
  let uppers = "";
  for (let i = 0; i < 4; i++) {
    const x = 220 + i * 150;
    uppers += `<rect x="${x}" y="190" width="140" height="250" rx="6" fill="#e9dfcf" stroke="${ink}" stroke-width="4"/><line x1="${x + 115}" y1="380" x2="${x + 115}" y2="420" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 2; i++) {
    const x = 1090 + i * 150;
    uppers += `<rect x="${x}" y="190" width="140" height="250" rx="6" fill="#e9dfcf" stroke="${ink}" stroke-width="4"/><line x1="${x + 25}" y1="380" x2="${x + 25}" y2="420" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
  }
  let lowers = "";
  for (let i = 0; i < 8; i++) {
    const x = 220 + i * 145;
    if (i === 4) continue;
    lowers += `<rect x="${x}" y="640" width="135" height="260" rx="6" fill="#4f6b5c" stroke="${ink}" stroke-width="4"/><line x1="${x + 30}" y1="680" x2="${x + 105}" y2="680" stroke="#d6b67a" stroke-width="6" stroke-linecap="round"/>`;
  }
  let tiles = "";
  for (let y = 440; y < 610; y += 34)
    for (let x = 205 + ((y / 34) % 2) * 34; x < 1395; x += 68)
      tiles += `<rect x="${x}" y="${y}" width="64" height="30" rx="3" fill="#f7f2ea" stroke="#d9cdb9" stroke-width="2"/>`;
  const body = `
    <rect width="${w}" height="${h}" fill="#efe6d8"/>
    <rect x="200" y="440" width="1200" height="180" fill="#f3ece1"/>
    ${tiles}
    <rect x="830" y="170" width="230" height="270" rx="8" fill="url(#sky)" stroke="${ink}" stroke-width="5"/>
    <line x1="945" y1="170" x2="945" y2="440" stroke="${ink}" stroke-width="4"/>
    ${uppers}
    <path d="M800 520 L900 470 H990 L1090 520 Z" fill="#c9bba4" stroke="${ink}" stroke-width="4"/>
    <rect x="200" y="612" width="1200" height="30" rx="4" fill="#fbfaf7" stroke="${ink}" stroke-width="4"/>
    ${lowers}
    <rect x="800" y="640" width="135" height="260" rx="6" fill="#2b2b2b" stroke="${ink}" stroke-width="4"/>
    <rect x="818" y="700" width="99" height="120" rx="6" fill="#444" />
    <rect x="200" y="900" width="1200" height="24" fill="#3b3328"/>
    <rect x="0" y="924" width="${w}" height="${h - 924}" fill="#c9a77c"/>
    <g fill="#5d7f62"><circle cx="1330" cy="585" r="34"/><circle cx="1300" cy="565" r="26"/><circle cx="1360" cy="560" r="24"/></g>
    <rect x="1310" y="580" width="44" height="34" rx="6" fill="#b5653a"/>`;
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc3e0"/><stop offset="1" stop-color="#e8f1f7"/></linearGradient>`;
  return { w, h, svg: svg(w, h, body, defs) };
}

function remHeroBath() {
  const w = 1600,
    h = 1067;
  let tiles = "";
  for (let y = 0; y < h; y += 46)
    for (let x = -((y / 46) % 2) * 46; x < w; x += 92)
      tiles += `<rect x="${x + 2}" y="${y + 2}" width="88" height="42" rx="3" fill="#dfe8e1"/>`;
  const body = `
    <rect width="${w}" height="${h}" fill="#bfcfc4"/>
    ${tiles}
    <rect x="560" y="140" width="480" height="420" rx="210" fill="url(#mirror)" stroke="#b08d57" stroke-width="12"/>
    <rect x="430" y="650" width="740" height="40" rx="8" fill="#f4f1ea"/>
    <rect x="450" y="690" width="700" height="250" rx="10" fill="#6f8f7e"/>
    <line x1="800" y1="700" x2="800" y2="930" stroke="#5c7a6a" stroke-width="4"/>
    <g fill="#b08d57"><rect x="760" y="760" width="10" height="60" rx="5"/><rect x="830" y="760" width="10" height="60" rx="5"/></g>
    <path d="M760 650 v-40 q40 -30 80 0 v40" fill="none" stroke="#b08d57" stroke-width="10"/>
    <rect x="0" y="940" width="${w}" height="${h - 940}" fill="#8a9d90"/>
    <g fill="#4e7a59"><path d="M1250 650 q-40 -120 10 -200 q20 90 -10 200z"/><path d="M1265 650 q30 -140 90 -180 q-20 110 -90 180z"/><path d="M1255 650 q-90 -60 -120 -140 q80 40 120 140z"/></g>
    <rect x="1215" y="640" width="90" height="70" rx="10" fill="#e9e4d8"/>`;
  const defs = `<linearGradient id="mirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f8f9"/><stop offset="0.6" stop-color="#cfdfe3"/><stop offset="1" stop-color="#b6cbd1"/></linearGradient>`;
  return { w, h, svg: svg(w, h, body, defs) };
}

function remAboutSwatches() {
  const w = 1200,
    h = 900;
  const r = rng(23);
  let marble = "";
  for (let i = 0; i < 9; i++) {
    const y = 120 + r() * 380;
    marble += `<path d="M640 ${y} C 760 ${y - 60 + r() * 120}, 880 ${y - 40 + r() * 80}, 1000 ${y + r() * 60}" stroke="#a9a4a0" stroke-width="${1 + r() * 2.5}" fill="none" opacity="0.7"/>`;
  }
  let grain = "";
  for (let i = 0; i < 26; i++) {
    const y = 470 + i * 14 + r() * 6;
    grain += `<path d="M110 ${y} q 130 ${-8 + r() * 16} 260 0 t 260 0" stroke="#8b5a2b" stroke-opacity="0.35" stroke-width="2" fill="none"/>`;
  }
  let tile = "";
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++)
      tile += `<rect x="${430 + x * 64}" y="${120 + y * 64}" width="60" height="60" rx="4" fill="${(x + y) % 2 ? "#2f4858" : "#e8e1d4"}"/>`;
  const chips = ["#c56a3d", "#e2b65c", "#7f9b84", "#3d5a80", "#e9e4da"]
    .map((c, i) => `<rect x="${720 + i * 78}" y="600" width="66" height="200" rx="8" fill="${c}" stroke="#00000020"/>`)
    .join("");
  const body = `
    <rect width="${w}" height="${h}" fill="#f2ede4"/>
    <g filter="url(#shadow)">
      <rect x="110" y="120" width="290" height="300" rx="14" fill="#d8c3a5"/>
      <rect x="110" y="460" width="520" height="340" rx="14" fill="#c99a63"/>
      <rect x="420" y="110" width="276" height="276" rx="12" fill="#1f2d36"/>
      <rect x="630" y="110" width="460" height="440" rx="14" fill="#f6f4f1"/>
    </g>
    ${grain}${tile}${marble}
    <g filter="url(#shadow)">${chips}</g>
    <rect x="130" y="140" width="250" height="260" rx="10" fill="none" stroke="#b49a74" stroke-width="3" stroke-dasharray="6 8"/>`;
  const defs = `<filter id="shadow" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity="0.18"/></filter>`;
  return { w, h, svg: svg(w, h, body, defs) };
}

function remAboutPlan() {
  const w = 1200,
    h = 900;
  const ink = "#2a4365";
  const body = `
    <rect width="${w}" height="${h}" fill="#f8f5ee"/>
    ${grid(w, h, 30, "rgba(42,67,101,0.07)")}
    <g stroke="${ink}" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M160 140 H1040 V760 H160 Z" stroke-width="14"/>
      <path d="M560 140 V430 M560 520 V760 M160 460 H420 M500 460 H560 M560 400 H800 M880 400 H1040" stroke-width="9"/>
      <path d="M420 460 A80 80 0 0 1 500 540" stroke-width="3"/>
      <path d="M800 400 A80 80 0 0 0 880 480" stroke-width="3"/>
      <g stroke-width="4">
        <rect x="620" y="190" width="380" height="60" rx="6"/>
        <rect x="660" y="290" width="180" height="70" rx="10"/>
        <circle cx="900" cy="560" r="80"/>
        <rect x="200" y="200" width="200" height="140" rx="12"/>
        <rect x="200" y="520" width="140" height="200" rx="10"/>
        <rect x="380" y="640" width="140" height="80" rx="10"/>
      </g>
    </g>
    <g fill="#c56a3d" opacity="0.85"><circle cx="900" cy="560" r="10"/><circle cx="300" cy="270" r="10"/></g>
    <g fill="${ink}" font-family="Georgia, serif" font-size="30" opacity="0.8">
      <text x="640" y="455">Kitchen</text><text x="235" y="420">Dining</text><text x="830" y="700">Living</text><text x="380" y="600">Bath</text>
    </g>`;
  return { w, h, svg: svg(w, h, body) };
}

const images = [
  ["general_contractor", "hero-1", gcHeroBlueprint],
  ["general_contractor", "hero-2", gcHeroDusk],
  ["general_contractor", "about-1", gcAboutLumber],
  ["general_contractor", "about-2", gcAboutSteel],
  ["remodeling", "hero-1", remHeroKitchen],
  ["remodeling", "hero-2", remHeroBath],
  ["remodeling", "about-1", remAboutSwatches],
  ["remodeling", "about-2", remAboutPlan],
];

for (const [trade, name, draw] of images) {
  const { svg: markup } = draw();
  const dir = path.join(OUT, trade);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${name}.jpg`);
  await sharp(Buffer.from(markup)).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
  console.log("wrote", path.relative(process.cwd(), file));
}
