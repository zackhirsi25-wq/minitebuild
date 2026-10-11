import { legal } from "@/config/legal";
import privacy from "@/content/legal/privacy";
import refunds from "@/content/legal/refunds";
import terms from "@/content/legal/terms";

export const LEGAL_DOCS = { privacy, terms, refunds } as const;
export type LegalDocId = keyof typeof LEGAL_DOCS;

export const LEGAL_TITLES: Record<LegalDocId, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  refunds: "Refund Policy",
};

export type LegalValues = typeof legal & { contactEmail: string | null };

function formatDate(iso: string): string | null {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** Placeholder text in the documents -> its value, or null when not set yet. */
function placeholderValues(v: LegalValues): Record<string, string | null> {
  return {
    "[LEGAL NAME]": v.legalName,
    "[REGISTERED ADDRESS]": v.registeredAddress,
    "[CONTACT EMAIL]": v.contactEmail,
    "[EFFECTIVE DATE]": v.effectiveDate ? formatDate(v.effectiveDate) : null,
    "[90 DAYS]": v.retentionDays ? `${v.retentionDays} days` : null,
    "[GOVERNING LAW]": v.governingLaw,
    "[COURTS LOCATION]": v.courtsLocation,
  };
}

/**
 * A document with its placeholders filled in. `missing` lists placeholders
 * without a value (and any unknown ones); the page stays unpublished until it
 * is empty, so placeholder text never reaches the public.
 */
export function resolveLegalDoc(id: LegalDocId, values: LegalValues): { markdown: string; missing: string[] } {
  const map = placeholderValues(values);
  const missing = new Set<string>();
  const markdown = LEGAL_DOCS[id].replace(/\[[A-Z0-9 ]+\]/g, (token) => {
    const value = map[token];
    if (value == null || value === "") {
      missing.add(token);
      return token;
    }
    return value;
  });
  return { markdown, missing: [...missing] };
}
