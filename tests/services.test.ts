import { describe, expect, it } from "vitest";
import { buildUserPrompt, contentIssues, generateSiteContent, type BusinessFacts, type CallModel } from "@/lib/ai/copy";
import { fixtureContent } from "@/lib/ai/fixture-copy";
import { parseImportCsv } from "@/lib/content/csv";
import { inferSpecialty, splitServices } from "@/lib/content/services";

const base: BusinessFacts = {
  name: "Compton Construction",
  city: "Columbus",
  phone: "(614) 949-4712",
  address: null,
  category: "General contractor",
  trade: "general_contractor",
  hours: [],
};

describe("inferSpecialty", () => {
  it("reads the business name first", () => {
    expect(inferSpecialty("Peak Roofing", "General contractor")?.id).toBe("roofing");
    expect(inferSpecialty("Ace Roofing & Remodeling", null)?.id).toBe("roofing");
    expect(inferSpecialty("Summit Kitchen & Bath", null)?.id).toBe("remodeling");
  });

  it("falls back to the Google category", () => {
    expect(inferSpecialty("Smith & Sons", "Roofing contractor")?.id).toBe("roofing");
    expect(inferSpecialty("Smith & Sons", "Plumber")?.id).toBe("plumbing");
  });

  it("returns null when nothing points to a specialty", () => {
    expect(inferSpecialty("Compton Construction", "General contractor")).toBeNull();
    expect(inferSpecialty("Outdoors Builders", null)).toBeNull();
  });
});

describe("buildUserPrompt services", () => {
  it("uses the owner's list when given", () => {
    const prompt = buildUserPrompt({ ...base, services: ["Roof repair", "Gutters"] });
    expect(prompt).toContain("the owner lists exactly these: Roof repair; Gutters");
  });

  it("names the inferred specialty", () => {
    expect(buildUserPrompt({ ...base, name: "Peak Roofing" })).toContain("point to roofing");
  });

  it("asks for a general list when there is no signal", () => {
    expect(buildUserPrompt(base)).toContain("common general contracting services");
  });
});

describe("contentIssues", () => {
  const content = () => structuredClone(fixtureContent(base));

  it("passes the fixture copy", () => {
    expect(contentIssues(content(), base)).toEqual([]);
  });

  it("flags invented facts", () => {
    const c = content();
    c.about = `${c.about} With 25 years of experience and a satisfaction guarantee, we are award-winning.`;
    c.faq[0].answer = "Our license number is 12345 and our team of 12 is ready to help.";
    const issues = contentIssues(c, base).join("\n");
    expect(issues).toMatch(/about: mentions years in business \("25 years"\)/);
    expect(issues).toMatch(/about: mentions a guarantee/);
    expect(issues).toMatch(/about: mentions awards/);
    expect(issues).toMatch(/faq\[0\]\.answer: mentions a license number/);
    expect(issues).toMatch(/faq\[0\]\.answer: mentions team size/);
  });

  it("doesn't flag the business's own name", () => {
    const facts = { ...base, name: "5 Star Award Builders" };
    const c = structuredClone(fixtureContent(facts));
    expect(contentIssues(c, facts)).toEqual([]);
  });

  it("doesn't flag ordinary wording", () => {
    const c = content();
    c.about = `${c.about} We review the plans with you and work on homes built decades ago.`;
    expect(contentIssues(c, base)).toEqual([]);
  });

  it("requires the owner's services, in order", () => {
    const facts = { ...base, services: ["Roof repair", "Gutters & downspouts"] };
    const c = content();
    expect(contentIssues(c, facts)[0]).toMatch(/use exactly these titles/);
    c.services = [
      { title: "Roof Repair", description: "Leaks, missing shingles and flashing fixed before they damage the house." },
      {
        title: "Gutters and Downspouts",
        description: "New gutters and downspouts sized to move water away from the foundation.",
      },
    ];
    expect(contentIssues(c, facts)).toEqual([]);
  });

  it("requires at least 4 generated services when the owner listed none", () => {
    const c = content();
    c.services = c.services.slice(0, 3);
    expect(contentIssues(c, base)).toContain("services: list at least 4 services");
  });

  it("is enforced by generateSiteContent with one retry", async () => {
    let n = 0;
    const callModel: CallModel = async () => {
      const c = content();
      if (++n === 1) c.headline = "Columbus builders since 1998";
      return JSON.stringify(c);
    };
    await expect(generateSiteContent(base, callModel)).resolves.toBeTruthy();
    expect(n).toBe(2);
  });
});

describe("fixture copy", () => {
  it("follows the specialty and the owner's list", () => {
    expect(fixtureContent({ ...base, name: "Peak Roofing" }).services[0].title).toBe("Roof Replacement");
    expect(fixtureContent({ ...base, services: ["Decks", "Fences"] }).services.map((s) => s.title)).toEqual([
      "Decks",
      "Fences",
    ]);
  });
});

describe("CSV services column", () => {
  it("splits on semicolons, pipes or commas and dedupes", () => {
    expect(splitServices("Roof repair; Gutters | roof repair")).toEqual(["Roof repair", "Gutters"]);
    expect(splitServices("Decks, Fences")).toEqual(["Decks", "Fences"]);
    expect(splitServices("  ")).toEqual([]);
  });

  it("is optional and attached to the row when filled in", () => {
    const parsed = parseImportCsv(
      'name,city,phone,Services\nPeak Roofing,Denver,303-555-0187,"Roof repair; Gutters"\nAce,Denver,303-555-0188,\n',
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.rows[0].input.services).toEqual(["Roof repair", "Gutters"]);
    expect(parsed.rows[1].input.services).toBeUndefined();
    expect(parsed.validCount).toBe(2);
  });

  it("rejects rows with too many or too long services", () => {
    const seven = Array.from({ length: 7 }, (_, i) => `Service ${i + 1}`).join("; ");
    const long = "x".repeat(41);
    const parsed = parseImportCsv(
      `name,city,phone,services\nA,Denver,303-555-0187,"${seven}"\nB,Denver,303-555-0188,${long}\n`,
    );
    expect(parsed.ok && parsed.rows.map((r) => r.error)).toEqual([
      "List at most 6 services",
      "Each service must be 40 characters or fewer",
    ]);
  });
});
