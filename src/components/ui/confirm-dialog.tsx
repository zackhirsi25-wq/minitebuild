"use client";

import { useRef, useState, type ReactNode } from "react";
import { Spinner } from "./spinner";

/**
 * A button that asks for confirmation in a modal <dialog> before running an
 * action. The action returns an error message, or null on success.
 */
export function ConfirmButton({
  label,
  title,
  description,
  confirmLabel,
  onConfirm,
  tone = "primary",
  buttonClassName = "",
  children,
}: {
  label: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<string | null>;
  tone?: "primary" | "danger";
  buttonClassName?: string;
  /** Extra form fields shown inside the dialog. */
  children?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      const message = await onConfirm();
      if (message) setError(message);
      else dialog.current?.close();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const confirmColor = tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          dialog.current?.showModal();
        }}
        className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${buttonClassName}`}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/50"
        onClose={() => setError(null)}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <div className="mt-2 text-slate-600">{description}</div>
          {children && <div className="mt-4">{children}</div>}
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={pending}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-semibold text-white disabled:opacity-60 ${confirmColor}`}
            >
              {pending && <Spinner />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
