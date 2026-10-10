import type { Metadata } from "next";
import { product } from "@/config/product";
import { STOCK_INDEX } from "@/lib/images/stock";

export const metadata: Metadata = {
  title: `Photo credits | ${product.name}`,
  description: "The photographers whose work appears in Minitebuild's stock photo library.",
};

/** Photographers in the stock library (public/stock/index.json, the source of CREDITS.md). */
function photographers() {
  const byName = new Map<string, { name: string; url: string | null; photos: string[] }>();
  for (const niche of Object.values(STOCK_INDEX)) {
    for (const list of Object.values(niche.slots)) {
      for (const p of list ?? []) {
        const entry = byName.get(p.photographer) ?? { name: p.photographer, url: p.photographer_url, photos: [] };
        entry.photos.push(p.source_url);
        byName.set(p.photographer, entry);
      }
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function CreditsPage() {
  const people = photographers();
  return (
    <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] py-[var(--mb-section)]">
      <div className="max-w-2xl">
        <h1 className="text-heading font-semibold">Photo credits</h1>
        <p className="mt-4 text-lead text-muted text-pretty">
          The stock photos on sites we build come from{" "}
          <a
            href="https://www.pexels.com"
            className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg"
          >
            Pexels
          </a>{" "}
          and are used under the{" "}
          <a
            href="https://www.pexels.com/license/"
            className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg"
          >
            Pexels licence
          </a>
          . Thank you to the photographers below.
        </p>
      </div>
      {people.length === 0 ? (
        <p className="mt-12 text-body text-muted">No stock photos are in use yet.</p>
      ) : (
        <ul className="mt-14 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <li key={p.name} className="flex min-h-11 items-baseline justify-between gap-4 border-b border-line py-2">
              {p.url ? (
                <a href={p.url} className="text-body text-fg hover:underline">
                  {p.name}
                </a>
              ) : (
                <span className="text-body text-fg">{p.name}</span>
              )}
              <span className="flex flex-wrap justify-end gap-x-2 text-small text-muted">
                {p.photos.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    className="hover:text-fg"
                    aria-label={`Photo ${i + 1} by ${p.name} on Pexels`}
                  >
                    {p.photos.length > 1 ? `Photo ${i + 1}` : "Photo"}
                  </a>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
