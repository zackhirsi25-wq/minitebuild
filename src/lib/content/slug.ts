// Slugs double as subdomains, so they must be valid DNS labels (max 63 chars).

/** Slugs that would clash with app routes or common subdomains. */
export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "mail",
  "login",
  "billing",
  "static",
  "assets",
  "cdn",
  "help",
  "support",
  "status",
]);

const MAX_BASE_LENGTH = 56; // leaves room for "-999"

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** business-name-city, trimmed to a whole word if too long. */
export function baseSlug(name: string, city: string): string {
  let slug = slugify(`${name} ${city}`);
  if (slug.length > MAX_BASE_LENGTH) {
    slug = slug.slice(0, MAX_BASE_LENGTH);
    const lastDash = slug.lastIndexOf("-");
    if (lastDash > 20) slug = slug.slice(0, lastDash);
    slug = slug.replace(/-+$/, "");
  }
  return slug || "site";
}

/** First free slug: base, then base-2, base-3, ... */
export function nextAvailableSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base) && !RESERVED_SLUGS.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}
