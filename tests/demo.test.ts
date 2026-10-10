import { describe, expect, it } from "vitest";
import { contentIssues } from "@/lib/ai/copy";
import { BUSINESS_TYPES, inferBusinessType } from "@/lib/business-type";
import { siteContentSchema } from "@/lib/content/schema";
import { demoSite, hasDemo } from "@/demo";

// Demo businesses are shown publicly in the template gallery, so they must
// pass the same checks as generated copy (schema and invented-fact guard).

describe("demo businesses", () => {
  for (const type of BUSINESS_TYPES) {
    it(`${type} has valid demo content`, () => {
      expect(hasDemo(type)).toBe(true);
      const site = demoSite(type, "cinematic");
      expect(siteContentSchema.safeParse(site.content).success).toBe(true);
      expect(inferBusinessType(site.name, site.category)).toBe(type);
      expect(
        contentIssues(site.content, { ...site, businessType: type, services: undefined }).filter(
          (i) => !i.startsWith("services:"),
        ),
      ).toEqual([]);
      expect(site.phone).toMatch(/555-01\d\d/);
    });
  }
});
