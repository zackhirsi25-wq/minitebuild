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

/**
 * A document with [CONTACT EMAIL] filled in. `missing` lists placeholders
 * without a value (and any unknown ones); the page stays unpublished until it
 * is empty, so placeholder text never reaches the public.
 */
export function resolveLegalDoc(
  id: LegalDocId,
  values: { contactEmail: string | null },
): { markdown: string; missing: string[] } {
  const map: Record<string, string | null> = { "[CONTACT EMAIL]": values.contactEmail };
  const missing = new Set<string>();
  const markdown = LEGAL_DOCS[id].replace(/\[[A-Z0-9 ]+\]/g, (token) => {
    const value = map[token];
    if (!value) {
      missing.add(token);
      return token;
    }
    return value;
  });
  return { markdown, missing: [...missing] };
}
