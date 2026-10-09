"use client";

import { useToast } from "./toast";

/** Copies a URL and confirms with a "Copied" toast. */
export function CopyLinkButton({
  url,
  label = "Copy link",
  className = "",
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  const toast = useToast();
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.show("Copied");
    } catch {
      toast.show("Couldn't copy. Long-press the link to copy it instead.", "error");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
        <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
      </svg>
      {label}
    </button>
  );
}
