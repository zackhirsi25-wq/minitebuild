import { describe, expect, it } from "vitest";
import { fixtureContent } from "@/lib/ai/fixture-copy";
import { generateSiteContent, type BusinessFacts, type CallModel } from "@/lib/ai/copy";
import {
  businessInputSchema,
  containsHtml,
  formatIssues,
  siteContentJsonSchema,
  siteContentSchema,
  type SiteContent,
} from "@/lib/content/schema";

const facts: BusinessFacts = {
  name: "Elite Remodeling",
  city: "Austin",
  phone: "(512) 555-0142",
  address: "4410 Burnet Rd, Austin, TX 78756, USA",
  category: "Remodeler",
  trade: "remodeling",
  hours: [],
};

const valid = (): SiteContent => structuredClone(fixtureContent(facts));

describe("siteContentSchema", () => {
  it("accepts well-formed copy", () => {
    expect(siteContentSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts fixture copy for a general contractor too", () => {
    const content = fixtureContent({ ...facts, name: "JJ General Contractor", trade: "general_contractor" });
    expect(siteContentSchema.safeParse(content).success).toBe(true);
  });

  it.each([
    ["a bold tag", "<b>Best</b> remodeler in town"],
    ["a script tag", "Hello <script>alert(1)</script> world here"],
    ["a self-closing tag", "Kitchens, baths<br/> and more"],
    ["an HTML comment", "Great work <!-- hidden --> every time"],
  ])("rejects a headline with %s", (_label, headline) => {
    const result = siteContentSchema.safeParse({ ...valid(), headline });
    expect(result.success).toBe(false);
    expect(formatIssues(result.error!)).toContain("headline: must be plain text without HTML tags");
  });

  it("rejects HTML in nested fields", () => {
    const content = valid();
    content.faq[2].answer = 'Yes. <a href="https://x.test">See our license</a> for details.';
    const result = siteContentSchema.safeParse(content);
    expect(result.success).toBe(false);
    expect(formatIssues(result.error!)).toContain("faq[2].answer: must be plain text without HTML tags");
  });

  it("allows plain text that merely mentions comparisons", () => {
    expect(containsHtml("Most jobs take < 2 weeks and cost > $500")).toBe(false);
  });

  it("enforces length limits", () => {
    const result = siteContentSchema.safeParse({ ...valid(), headline: "x".repeat(71) });
    expect(formatIssues(result.error!)).toContain("headline: must be at most 70 characters");
  });

  it("requires 4-6 services and 4-5 FAQ entries", () => {
    const content = valid();
    expect(siteContentSchema.safeParse({ ...content, services: content.services.slice(0, 3) }).success).toBe(false);
    expect(
      siteContentSchema.safeParse({ ...content, services: [...content.services, ...content.services].slice(0, 7) })
        .success,
    ).toBe(false);
    expect(siteContentSchema.safeParse({ ...content, faq: content.faq.slice(0, 3) }).success).toBe(false);
    expect(siteContentSchema.safeParse({ ...content, faq: [...content.faq, content.faq[0]] }).success).toBe(false);
  });

  it("rejects placeholder text", () => {
    const result = siteContentSchema.safeParse({ ...valid(), subheadline: "Serving [Your City] since day one with honest work." });
    expect(formatIssues(result.error!)).toContain("subheadline: contains placeholder text");
  });

  it("rejects unknown keys and line breaks in one-line fields", () => {
    expect(siteContentSchema.safeParse({ ...valid(), extra: "nope" }).success).toBe(false);
    expect(siteContentSchema.safeParse({ ...valid(), headline: "Two\nlines of headline" }).success).toBe(false);
  });

  it("allows paragraph breaks in the about text", () => {
    expect(siteContentSchema.safeParse({ ...valid(), about: `${"A".repeat(100)}\n\n${"B".repeat(100)}` }).success).toBe(
      true,
    );
  });

  it("keeps the JSON schema sent to Claude in sync with the Zod keys", () => {
    expect(Object.keys(siteContentJsonSchema.properties).sort()).toEqual(Object.keys(siteContentSchema.shape).sort());
  });
});

describe("generateSiteContent", () => {
  it("retries once with the validation errors, then succeeds", async () => {
    const calls: { role: string; content: string }[][] = [];
    const bad = { ...valid(), headline: "<h1>Hi</h1> there friends" };
    const callModel: CallModel = async (messages) => {
      calls.push(structuredClone(messages));
      return JSON.stringify(calls.length === 1 ? bad : valid());
    };
    const content = await generateSiteContent(facts, callModel);
    expect(content.headline).toBe(valid().headline);
    expect(calls).toHaveLength(2);
    const retry = calls[1].at(-1)!.content;
    expect(retry).toContain("headline: must be plain text without HTML tags");
  });

  it("fails after the second invalid reply", async () => {
    const callModel: CallModel = async () => JSON.stringify({ ...valid(), services: [] });
    await expect(generateSiteContent(facts, callModel)).rejects.toThrow(/failed validation twice/);
  });

  it("treats non-JSON as a validation failure", async () => {
    let n = 0;
    const callModel: CallModel = async () => (++n === 1 ? "Sure! Here is your copy." : JSON.stringify(valid()));
    await expect(generateSiteContent(facts, callModel)).resolves.toBeTruthy();
    expect(n).toBe(2);
  });
});

describe("businessInputSchema", () => {
  it("accepts common phone formats", () => {
    for (const phone of ["(512) 555-0142", "512-555-0142", "+1 512 555 0142", "5125550142", "512.555.0142 ext 3"]) {
      expect(businessInputSchema.safeParse({ name: "A", city: "B", phone }).success).toBe(true);
    }
  });

  it("explains what is wrong", () => {
    const result = businessInputSchema.safeParse({ name: " ", city: "Austin", phone: "12" });
    expect(result.error!.issues.map((i) => i.message)).toEqual([
      "Business name is empty",
      "Phone number doesn't look valid",
    ]);
  });
});
