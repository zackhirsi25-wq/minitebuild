import type { ReactNode } from "react";
import { cx } from "./cx";

export type BadgeTone = "neutral" | "success" | "danger" | "muted";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line-strong text-fg",
  success: "border-success/40 text-success",
  danger: "border-danger/40 text-danger",
  muted: "border-line text-muted",
};

/** A small status label with a dot. Colour is never the only signal: the text says it. */
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-small font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
