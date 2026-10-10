import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

export const inputClass =
  "block h-12 w-full rounded-control border border-line-strong bg-surface px-3.5 text-body text-fg placeholder:text-muted/80 transition-colors duration-150 hover:border-fg/30 focus:border-fg/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-danger";

/** A labelled text input with optional hint and error. */
export function Field({
  label,
  hint,
  error,
  hideLabel = false,
  className,
  id,
  name,
  ...input
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Keep the label for screen readers only (inline forms). */
  hideLabel?: boolean;
  className?: string;
} & ComponentProps<"input">) {
  const inputId = id ?? `field-${name}`;
  const describedBy = [hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("grid gap-1.5", className)}>
      <label htmlFor={inputId} className={cx("text-small font-medium text-fg", hideLabel && "sr-only")}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClass}
        {...input}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-small text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
