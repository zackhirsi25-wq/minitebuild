import { describe, expect, it } from "vitest";
import { LEGAL_DOCS, resolveLegalDoc, type LegalDocId } from "@/lib/legal";

const empty = {
  legalName: null,
  registeredAddress: null,
  effectiveDate: null,
  retentionDays: null,
  governingLaw: null,
  courtsLocation: null,
  contactEmail: null,
};
const full = {
  legalName: "Example LLC",
  registeredAddress: "1 Main St",
  effectiveDate: "2026-11-01",
  retentionDays: 90,
  governingLaw: "the State of Delaware",
  courtsLocation: "Wilmington, Delaware",
  contactEmail: "hello@example.com",
};

describe("legal documents", () => {
  for (const id of Object.keys(LEGAL_DOCS) as LegalDocId[]) {
    it(`${id} stays unpublished until every placeholder has a value`, () => {
      expect(resolveLegalDoc(id, empty).missing.length).toBeGreaterThan(0);
      const done = resolveLegalDoc(id, full);
      expect(done.missing).toEqual([]);
      expect(done.markdown).not.toMatch(/\[[A-Z0-9 ]+\]/);
    });
  }

  it("fills dates and retention in words", () => {
    const { markdown } = resolveLegalDoc("terms", full);
    expect(markdown).toContain("Effective date: November 1, 2026");
    expect(markdown).toContain("for 90 days so you can come back");
  });
});
