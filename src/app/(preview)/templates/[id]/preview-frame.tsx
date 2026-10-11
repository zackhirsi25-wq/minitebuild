"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";

/**
 * Top bar and live demo for one template. Business type and device are kept
 * in the URL (?type=salon&device=mobile) so a preview can be shared or reloaded.
 */
export function PreviewFrame({
  id,
  name,
  type,
  device,
  types,
}: {
  id: string;
  name: string;
  type: string;
  device: "desktop" | "mobile";
  types: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const go = (next: { type?: string; device?: string }) => {
    const q = new URLSearchParams({ type, device, ...next });
    if (q.get("device") === "desktop") q.delete("device");
    // Only a new business type reloads the iframe; switching device just resizes it.
    if (next.type && next.type !== type) setLoading(true);
    router.replace(`/templates/${id}?${q}`, { scroll: false });
  };
  const src = `/demo/${id}?type=${type}`;

  return (
    <>
      <header className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-canvas px-3 py-2.5 sm:px-4">
        <Link
          href="/templates"
          className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-button px-2 text-small font-medium text-muted transition-colors hover:text-fg"
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">Templates</span>
        </Link>
        <p className="text-body font-semibold">{name}</p>

        {types.length > 1 ? (
          <label className="ml-auto flex items-center gap-2 text-small text-muted">
            <span className="sr-only sm:not-sr-only">Business</span>
            <select
              value={type}
              onChange={(e) => go({ type: e.target.value })}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-small text-fg"
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="ml-auto" />
        )}

        <div role="group" aria-label="Device" className="hidden rounded-button border border-line-strong p-0.5 md:flex">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={device === d}
              onClick={() => go({ device: d })}
              className={cx(
                "h-9 rounded-[8px] px-3 text-small font-medium capitalize transition-colors",
                device === d ? "bg-raised text-fg" : "text-muted hover:text-fg",
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <ButtonLink href={`/build?template=${id}`} className="h-11 md:ml-2">
          Use this template
        </ButtonLink>
      </header>

      <div className="relative min-h-0 flex-1 bg-raised">
        {loading && (
          <div className="absolute inset-0 grid place-items-center" aria-live="polite">
            <p className="text-small text-muted">Loading preview…</p>
          </div>
        )}
        <div
          className={cx(
            "mx-auto h-full transition-[width] duration-300 ease-mb",
            device === "mobile" ? "w-[390px] py-6 md:py-8" : "w-full",
          )}
        >
          <iframe
            key={src}
            src={src}
            title={`${name} template with demo content`}
            onLoad={() => setLoading(false)}
            className={cx(
              "h-full w-full bg-canvas",
              device === "mobile" && "rounded-[28px] border border-line-strong shadow-overlay",
              loading && "opacity-0",
            )}
          />
        </div>
      </div>
    </>
  );
}
