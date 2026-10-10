// Renders real thumbnails of every template's demo into its folder:
//   src/templates/<id>/thumb-desktop.jpg  (1440×900 viewport)
//   src/templates/<id>/thumb-mobile.jpg   (390×844 viewport, 2x)
//
//   npm run dev   (in another terminal)
//   npm run templates:thumbs [-- --base http://localhost:3000 --id cinematic]
//
// Needs Playwright, which is not a project dependency (installing it with npm
// on Windows prunes other platforms' binaries from the lockfile):
//   npm install --no-save playwright && npx playwright install chromium

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is missing. Run: npm install --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg("base", "http://localhost:3000").replace(/\/$/, "");
const only = arg("id", null);
const DIR = path.resolve(import.meta.dirname, "..", "src", "templates");
const ids = fs
  .readdirSync(DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(DIR, d.name, "meta.ts")))
  .map((d) => d.name)
  .filter((id) => !only || id === only);

const browser = await chromium.launch();
for (const id of ids) {
  for (const [kind, viewport, scale, width] of [
    ["desktop", { width: 1440, height: 900 }, 1, 1200],
    ["mobile", { width: 390, height: 844 }, 2, 600],
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: scale, reducedMotion: "reduce" });
    await page.goto(`${base}/demo/${id}`, { waitUntil: "networkidle", timeout: 180_000 });
    // Only images on screen matter; lazy ones further down never load here.
    await page.waitForFunction(
      () =>
        [...document.images]
          .filter((img) => img.getBoundingClientRect().top < window.innerHeight)
          .every((img) => img.complete && img.naturalWidth > 0),
      null,
      { timeout: 90_000 },
    );
    await page.waitForTimeout(300);
    const png = await page.screenshot({ type: "png" });
    const out = path.join(DIR, id, `thumb-${kind}.jpg`);
    await sharp(png).resize({ width }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    console.log(`  ${path.relative(process.cwd(), out)}`);
    await page.close();
  }
}
await browser.close();
