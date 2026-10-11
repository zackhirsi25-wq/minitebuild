import type { ReactNode } from "react";
import { planPriceLabel } from "@/config/product";
import { brandFont } from "./brand-font";

/** Height of the preview banner; templates offset their sticky headers by it (--site-offset). */
export const PREVIEW_BANNER_HEIGHT = 52;

/**
 * Slim bar on preview pages. Fixed height and sticky, so a template's sticky
 * header sits directly under it instead of sliding beneath it. Neutral glass
 * so it sits on any template's palette.
 */
export function PreviewBanner({ name, slug, owner = false }: { name: string; slug: string; owner?: boolean }) {
  return (
    <div
      className={`${brandFont.className} sticky top-0 z-[60] flex items-center border-b border-white/10 bg-neutral-950/90 text-white backdrop-blur-xl`}
      style={{ height: PREVIEW_BANNER_HEIGHT }}
    >
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6">
        <p className="flex min-w-0 items-center gap-2.5 text-[13px] leading-tight sm:text-sm">
          <span aria-hidden="true" className="relative flex h-2 w-2 flex-none">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 motion-reduce:hidden" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="truncate">
            <span className="hidden text-white/60 sm:inline">Preview · </span>
            Built for <strong className="font-semibold">{name}</strong>
          </span>
        </p>
        <div className="flex flex-none items-center gap-1 sm:gap-2">
          {owner && (
            <a
              href={`/p/${slug}/design`}
              className="inline-flex h-11 items-center rounded-full px-3 text-[13px] font-medium text-white/80 transition hover:text-white sm:text-sm"
            >
              Change design
            </a>
          )}
          <a
            href={`/p/${slug}/checkout`}
            className="group inline-flex h-9 flex-none items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-neutral-950 transition hover:bg-white/90 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm"
          >
            Go live
            <span className="hidden font-normal text-neutral-500 sm:inline">{planPriceLabel("monthly")}</span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

/** Wraps a previewed site so its sticky header clears the banner. */
export function PreviewFrame({ children }: { children: ReactNode }) {
  return <div style={{ ["--site-offset" as string]: `${PREVIEW_BANNER_HEIGHT}px` }}>{children}</div>;
}
