import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { product } from "@/config/product";
import { env } from "@/lib/env";
import { LEGAL_TITLES, resolveLegalDoc, type LegalDocId } from "@/lib/legal";

// /privacy, /terms and /refunds show the owner's text (src/content/legal) with
// [CONTACT EMAIL] filled from CONTACT_EMAIL. Without it a page says it isn't
// published, isn't indexed and isn't linked from the footer.

export function legalDoc(id: LegalDocId) {
  return resolveLegalDoc(id, { contactEmail: env.contactEmail ?? null });
}

export function isLegalPublished(id: LegalDocId): boolean {
  return legalDoc(id).missing.length === 0;
}

export function legalMetadata(id: LegalDocId): Metadata {
  const title = `${LEGAL_TITLES[id]} | ${product.name}`;
  return isLegalPublished(id) ? { title } : { title, robots: { index: false, follow: false } };
}

export function LegalPage({ id }: { id: LegalDocId }) {
  const { markdown, missing } = legalDoc(id);
  if (missing.length) {
    return (
      <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] py-[var(--mb-section)]">
        <h1 className="text-heading font-semibold">{LEGAL_TITLES[id]}</h1>
        <p className="mt-4 text-lead text-muted">This page hasn&apos;t been published yet.</p>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-8 max-w-xl rounded-card border border-line bg-surface p-4 text-small text-muted">
            Development only: set CONTACT_EMAIL in .env.local to publish it.
          </p>
        )}
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] pt-14 pb-[var(--mb-section)]">
      <Markdown
        source={markdown}
        className="max-w-[68ch] text-body text-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-4 hover:[&_a]:decoration-fg [&_h1]:mb-3 [&_h1]:text-heading [&_h1]:font-semibold [&_h1]:text-fg [&_h1+p]:mb-10 [&_h1+p]:text-small [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-lead [&_h2]:font-semibold [&_h2]:text-fg [&_li]:mt-1.5 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-fg [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </article>
  );
}
