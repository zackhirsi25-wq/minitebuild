import { describe, expect, it } from "vitest";
import { baseSlug, nextAvailableSlug, slugify } from "@/lib/content/slug";

describe("slugs", () => {
  it("builds business-name-city", () => {
    expect(baseSlug("Elite Remodeling", "Austin")).toBe("elite-remodeling-austin");
    expect(baseSlug("Summit Kitchen & Bath", "Boulder")).toBe("summit-kitchen-and-bath-boulder");
    expect(baseSlug("O'Brien's Café Builders", "San José")).toBe("obriens-cafe-builders-san-jose");
  });

  it("adds -2, -3 on a clash", () => {
    expect(nextAvailableSlug("acme-dallas", [])).toBe("acme-dallas");
    expect(nextAvailableSlug("acme-dallas", ["acme-dallas"])).toBe("acme-dallas-2");
    expect(nextAvailableSlug("acme-dallas", ["acme-dallas", "acme-dallas-2"])).toBe("acme-dallas-3");
  });

  it("never uses a reserved subdomain", () => {
    expect(nextAvailableSlug("www", [])).toBe("www-2");
  });

  it("stays a valid DNS label", () => {
    const slug = nextAvailableSlug(baseSlug("A".repeat(80) + " Construction Company", "Albuquerque"), []);
    expect(slug.length).toBeLessThanOrEqual(63);
    expect(slug).toMatch(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/);
    expect(slugify("!!!")).toBe("");
    expect(baseSlug("!!!", "???")).toBe("site");
  });
});
