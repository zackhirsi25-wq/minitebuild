import type { Metadata } from "next";

// Shown for unknown addresses, unknown site paths and unpublished sites. Kept
// neutral because it can appear on any customer's domain.

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-6 font-sans text-slate-900">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          There&apos;s nothing at this address. Check the link for typos, or go back to the page you came from.
        </p>
      </div>
    </main>
  );
}
