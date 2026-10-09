// Decides what a request's Host header points at. Pure so it can be unit
// tested and shared by the proxy (middleware) and server code.

export type HostTarget = { kind: "app" } | { kind: "site"; slug: string } | { kind: "unknown" };

/** Subdomains that never map to a customer site. */
export const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "mail"]);

const SLUG_LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

/** Lowercase, drop protocol, path, port and trailing dot. */
export function normalizeHost(value: string): string {
  let host = value.trim().toLowerCase();
  host = host.replace(/^[a-z]+:\/\//, "");
  host = host.split("/")[0];
  if (host.startsWith("[")) {
    // IPv6 literal, e.g. [::1]:3000
    host = host.slice(0, host.indexOf("]") + 1);
  } else {
    host = host.split(":")[0];
  }
  return host.replace(/\.$/, "");
}

export function resolveHost(hostHeader: string | null | undefined, rootDomain: string): HostTarget {
  if (!hostHeader) return { kind: "app" };

  const host = normalizeHost(hostHeader);
  const root = normalizeHost(rootDomain);

  if (host === root || host === `www.${root}`) return { kind: "app" };

  if (host.endsWith(`.${root}`)) {
    const sub = host.slice(0, -(root.length + 1));
    if (sub.includes(".")) return { kind: "unknown" };
    if (RESERVED_SUBDOMAINS.has(sub)) return { kind: "unknown" };
    if (!SLUG_LABEL.test(sub)) return { kind: "unknown" };
    return { kind: "site", slug: sub };
  }

  // Local development and Vercel preview deployments serve the app itself.
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return { kind: "app" };
  if (host.endsWith(".vercel.app")) return { kind: "app" };

  return { kind: "unknown" };
}

/** Internal path a site request is rewritten to. Paths a site doesn't have end up at a 404. */
export function sitePath(slug: string, pathname: string): string {
  if (pathname === "/" || pathname === "") return `/s/${slug}`;
  if (pathname === "/robots.txt") return `/s/${slug}/robots.txt`;
  if (pathname === "/sitemap.xml") return `/s/${slug}/sitemap.xml`;
  return `/s/${slug}${pathname}`;
}

function isLocal(root: string): boolean {
  const host = normalizeHost(root);
  return host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1";
}

/** Public address of a live site, e.g. https://elite-remodeling-austin.example.com */
export function liveSiteUrl(slug: string, rootDomain: string): string {
  const root = rootDomain
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/\/.*$/, "");
  const protocol = isLocal(root) ? "http" : "https";
  return `${protocol}://${slug}.${root}`;
}

/** Absolute URL on the main app domain. */
export function appUrl(path: string, rootDomain: string): string {
  const root = rootDomain
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/\/.*$/, "");
  const protocol = isLocal(root) ? "http" : "https";
  return `${protocol}://${root}${path.startsWith("/") ? path : `/${path}`}`;
}
