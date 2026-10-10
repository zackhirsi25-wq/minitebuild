import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

// primary is the one main action on a screen (the only place the accent is
// used); secondary and ghost are everything else.
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold select-none transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-mb active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover shadow-[0_8px_24px_-12px_var(--mb-accent)]",
  secondary: "border border-line-strong bg-raised text-fg hover:border-fg/30",
  ghost: "text-fg hover:bg-raised",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-4 text-body rounded-button",
  lg: "h-13 px-6 text-body rounded-button",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cx(base, variants[variant], sizes[size], className);
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; className?: string; children: ReactNode };

export function Button({ variant, size, className, ...props }: Common & ComponentProps<"button">) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
