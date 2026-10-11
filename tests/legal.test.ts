import { describe, expect, it } from "vitest";
import { LEGAL_DOCS, resolveLegalDoc, type LegalDocId } from "@/lib/legal";

describe("legal documents", () => {
  for (const id of Object.keys(LEGAL_DOCS) as LegalDocId[]) {
    it(`${id} is published only with a contact email, and then has no placeholders`, () => {
      expect(resolveLegalDoc(id, { contactEmail: null }).missing).toEqual(["[CONTACT EMAIL]"]);
      const done = resolveLegalDoc(id, { contactEmail: "hello@example.com" });
      expect(done.missing).toEqual([]);
      expect(done.markdown).not.toMatch(/\[[A-Z0-9 ]+\]/);
      expect(done.markdown).toContain("hello@example.com");
    });
  }
});
