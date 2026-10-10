import type { Metadata } from "next";

// /privacy, /terms and /refunds exist but are unlinked, out of the sitemap and
// not indexed until the owner provides the text. No legal wording is written
// here on their behalf.

export const unpublishedMetadata = (title: string): Metadata => ({
  title,
  robots: { index: false, follow: false },
});

export function Unpublished({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] py-[var(--mb-section)]">
      <h1 className="text-heading font-semibold">{title}</h1>
      <p className="mt-4 text-lead text-muted">This page hasn&apos;t been published yet.</p>
    </div>
  );
}
