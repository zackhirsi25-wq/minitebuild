"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "./spinner";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/60",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/60",
} as const;

/** Form submit button that shows a spinner while the form's server action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  className = "",
  variant = "primary",
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: keyof typeof variants;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {pending && <Spinner />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
