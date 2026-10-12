import { describe, expect, it } from "vitest";
import { fixtureContent } from "@/lib/ai/fixture-copy";
import {
  buildUserPrompt,
  generateSiteContent,
  nameVariant,
  SYSTEM_PROMPT,
  type BusinessFacts,
  type CallModel,
} from "@/lib/ai/copy";
import type { SiteContent } from "@/lib/content/schema";

const facts: BusinessFacts = {
  name: "Clearwater Plumbing Test",
  city: "Austin, TX",
  phone: "(512) 555-0143",
  address: null,
  category: null,
  trade: "general_contractor",
  hours: [],
};

const valid = (): SiteContent => structuredClone(fixtureContent(facts));

describe("nameVariant", () => {
  it("accepts the exact name, including possessives, and copy that doesn't name the business", () => {
    expect(nameVariant("Clearwater Plumbing Test fixes leaks across Austin.", facts.name, facts.city)).toBeNull();
    expect(nameVariant("Clearwater Plumbing Test's plumbers fix leaks.", facts.name, facts.city)).toBeNull();
    expect(nameVariant("Plumbing repairs for Austin homes", facts.name, facts.city)).toBeNull();
    // A name word that starts a sentence on its own is just a word.
    expect(nameVariant("Bookkeeping, payroll and tax returns.", "Calder Tax & Bookkeeping", "Austin, TX")).toBeNull();
    expect(nameVariant("We file your Tax returns.", "Calder Tax & Bookkeeping", "Austin, TX")).toBe("Tax returns");
  });

  it("finds a shortened or reworded name", () => {
    expect(nameVariant("Clearwater Plumbing fixes leaks across Austin.", facts.name, facts.city)).toBe(
      "Clearwater Plumbing fixes leaks",
    );
    expect(nameVariant("Call Clearwater today.", facts.name, facts.city)).toBe("Clearwater today");
    expect(nameVariant("Summit Peak Roofing repairs roofs.", "Summit Peak Roofing LLC", "Denver, CO")).toBe(
      "Summit Peak Roofing repairs",
    );
  });

  it("finds a variant next to an exact mention", () => {
    expect(nameVariant("Clearwater Plumbing Test is local. At Clearwater we answer.", facts.name, facts.city)).toBe(
      "Clearwater we answer",
    );
  });

  it("ignores the city and generic trade words, falling back to the first two words", () => {
    // "Austin" and "Plumbing" are not distinctive here, so it looks for "Austin Plumbing".
    expect(nameVariant("Plumbing for Austin homes.", "Austin Plumbing Co", "Austin, TX")).toBeNull();
    expect(nameVariant("Austin Plumbing fixes leaks.", "Austin Plumbing Co", "Austin, TX")).toBe(
      "Austin Plumbing fixes leaks",
    );
    expect(nameVariant("Austin Plumbing Co fixes leaks.", "Austin Plumbing Co", "Austin, TX")).toBeNull();
  });
});

describe("business name in generated copy", () => {
  it("tells the model to use the name exactly", () => {
    expect(SYSTEM_PROMPT).toMatch(/exactly as given/);
    expect(buildUserPrompt(facts)).toContain(
      "Business name: Clearwater Plumbing Test (write it exactly like this every time)",
    );
  });

  it("rejects a shortened name in the headline, subheadline or about text and retries once", async () => {
    const calls: { role: string; content: string }[][] = [];
    const bad = {
      ...valid(),
      headline: "Clearwater Plumbing for Austin homes",
      about:
        "Clearwater Plumbing fixes leaks, drains and water heaters across Austin. We come to your home, find the cause of the problem and explain what it will take before any work starts.",
    };
    const callModel: CallModel = async (messages) => {
      calls.push(structuredClone(messages));
      return JSON.stringify(calls.length === 1 ? bad : valid());
    };
    const content = await generateSiteContent(facts, callModel);
    expect(calls).toHaveLength(2);
    const retry = calls[1].at(-1)!.content;
    expect(retry).toContain('headline: names the business differently ("Clearwater Plumbing for Austin")');
    expect(retry).toContain('about: names the business differently ("Clearwater Plumbing fixes leaks")');
    expect(retry).toContain('Write the name exactly as "Clearwater Plumbing Test"');
    expect(content.about).toBe(valid().about);
  });

  it("fails when the retry still changes the name", async () => {
    const callModel: CallModel = async () =>
      JSON.stringify({ ...valid(), subheadline: "Clearwater Plumbing fixes leaks across Austin." });
    await expect(generateSiteContent(facts, callModel)).rejects.toThrow(/names the business differently/);
  });
});
