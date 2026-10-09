// Phone helpers. Numbers are assumed to be North American unless they start
// with "+" and a country code.

export type ParsedPhone = {
  /** E.164, e.g. +15125550142 */
  e164: string;
  /** Display form, e.g. (512) 555-0142 */
  display: string;
  /** Last 10 digits, used to compare numbers from different sources. */
  key: string;
};

export function parsePhone(raw: string | null | undefined): ParsedPhone | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  // Drop extensions: "ext 2", "x2", "#2"
  const withoutExt = trimmed.replace(/\s*(ext\.?|extension|x|#)\s*\d+\s*$/i, "");
  const digits = withoutExt.replace(/\D/g, "");

  if (digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))) {
    const national = digits.slice(-10);
    // NANP area codes and exchanges never start with 0 or 1.
    if (/^[01]/.test(national) || /^[01]/.test(national.slice(3))) return null;
    return {
      e164: `+1${national}`,
      display: `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`,
      key: national,
    };
  }

  if (withoutExt.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return { e164: `+${digits}`, display: withoutExt.replace(/\s+/g, " "), key: digits.slice(-10) };
  }

  return null;
}

/** Comparable key for any phone string, or null if it has too few digits. */
export function phoneKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 ? digits.slice(-10) : null;
}

export function telHref(phone: string): string {
  const parsed = parsePhone(phone);
  return `tel:${parsed ? parsed.e164 : phone.replace(/[^\d+]/g, "")}`;
}
