import { describe, expect, it } from "vitest";
import { appUrl, liveSiteUrl, normalizeHost, resolveHost, sitePath } from "@/lib/routing/hostname";

const ROOT = "minitebuild.com";

describe("resolveHost", () => {
  it("serves the app on the root domain and www", () => {
    expect(resolveHost("minitebuild.com", ROOT)).toEqual({ kind: "app" });
    expect(resolveHost("www.minitebuild.com", ROOT)).toEqual({ kind: "app" });
    expect(resolveHost("MiniteBuild.com:443", ROOT)).toEqual({ kind: "app" });
  });

  it("maps a subdomain to a site slug", () => {
    expect(resolveHost("elite-remodeling-austin.minitebuild.com", ROOT)).toEqual({
      kind: "site",
      slug: "elite-remodeling-austin",
    });
    expect(resolveHost("Elite-Remodeling-Austin-2.MINITEBUILD.com.", ROOT)).toEqual({
      kind: "site",
      slug: "elite-remodeling-austin-2",
    });
  });

  it("rejects nested, reserved and malformed subdomains", () => {
    expect(resolveHost("a.b.minitebuild.com", ROOT)).toEqual({ kind: "unknown" });
    expect(resolveHost("api.minitebuild.com", ROOT)).toEqual({ kind: "unknown" });
    expect(resolveHost("-bad-.minitebuild.com", ROOT)).toEqual({ kind: "unknown" });
    expect(resolveHost("under_score.minitebuild.com", ROOT)).toEqual({ kind: "unknown" });
  });

  it("does not treat look-alike domains as ours", () => {
    expect(resolveHost("evilminitebuild.com", ROOT)).toEqual({ kind: "unknown" });
    expect(resolveHost("site.minitebuild.com.evil.test", ROOT)).toEqual({ kind: "unknown" });
    expect(resolveHost("random.example.org", ROOT)).toEqual({ kind: "unknown" });
  });

  it("works with a localhost root domain and port in development", () => {
    const dev = "localhost:3000";
    expect(resolveHost("localhost:3000", dev)).toEqual({ kind: "app" });
    expect(resolveHost("acme-builders-dallas.localhost:3000", dev)).toEqual({
      kind: "site",
      slug: "acme-builders-dallas",
    });
  });

  it("serves the app on localhost and Vercel preview URLs", () => {
    expect(resolveHost("localhost:3000", ROOT)).toEqual({ kind: "app" });
    expect(resolveHost("127.0.0.1:3000", ROOT)).toEqual({ kind: "app" });
    expect(resolveHost("minitebuild-git-main-acme.vercel.app", ROOT)).toEqual({ kind: "app" });
  });

  it("treats a missing host header as the app", () => {
    expect(resolveHost(null, ROOT)).toEqual({ kind: "app" });
  });

  it("tolerates a ROOT_DOMAIN written as a URL", () => {
    expect(resolveHost("foo.minitebuild.com", "https://minitebuild.com/")).toEqual({ kind: "site", slug: "foo" });
  });
});

describe("sitePath", () => {
  it("rewrites site paths to the internal route", () => {
    expect(sitePath("acme", "/")).toBe("/s/acme");
    expect(sitePath("acme", "/robots.txt")).toBe("/s/acme/robots.txt");
    expect(sitePath("acme", "/sitemap.xml")).toBe("/s/acme/sitemap.xml");
    expect(sitePath("acme", "/admin")).toBe("/s/acme/admin");
  });
});

describe("URLs", () => {
  it("uses https in production and http on localhost", () => {
    expect(liveSiteUrl("acme", ROOT)).toBe("https://acme.minitebuild.com");
    expect(liveSiteUrl("acme", "localhost:3000")).toBe("http://acme.localhost:3000");
    expect(appUrl("/api/worker", ROOT)).toBe("https://minitebuild.com/api/worker");
  });

  it("normalizes hosts", () => {
    expect(normalizeHost("HTTPS://Foo.Example.com:8080/path")).toBe("foo.example.com");
    expect(normalizeHost("[::1]:3000")).toBe("[::1]");
  });
});
