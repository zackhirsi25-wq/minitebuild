import { planPriceLabel } from "@/config/product";

/**
 * Slim banner on preview pages. It is sticky but stays in the page flow, so it
 * takes its own space at the top instead of covering the site's header.
 */
export function PreviewBanner({ name, slug }: { name: string; slug: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950 font-sans text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <p className="text-sm leading-snug sm:text-[15px]">
          This site was built for <strong className="font-semibold">{name}</strong>.{" "}
          <span className="whitespace-nowrap">Go live for {planPriceLabel("monthly")}</span>
        </p>
        <a
          href={`/p/${slug}/checkout`}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Go live
        </a>
      </div>
    </div>
  );
}
