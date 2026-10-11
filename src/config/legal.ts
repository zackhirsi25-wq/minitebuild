// Values for the placeholders in the legal pages (src/content/legal). A page
// is published (linked in the footer, indexable) only when every placeholder
// it uses has a value here; until then it shows "not published yet".
// The contact email comes from CONTACT_EMAIL.

export const legal = {
  /** The business's registered legal name, e.g. "Minitebuild LLC". */
  legalName: null as string | null,
  /** Postal address for legal notices. */
  registeredAddress: null as string | null,
  /** ISO date the policies take effect, e.g. "2026-11-01". */
  effectiveDate: null as string | null,
  /** Days a cancelled site's content is kept before it may be deleted. */
  retentionDays: null as number | null,
  /** e.g. "the State of Delaware, United States". */
  governingLaw: null as string | null,
  /** e.g. "Wilmington, Delaware". */
  courtsLocation: null as string | null,
};
