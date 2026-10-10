"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Modal built on <dialog>: the browser handles focus trapping, Escape and the
 * backdrop. Controlled with `open`/`onClose`.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line-strong bg-surface p-0 text-fg shadow-overlay backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="grid gap-4 p-6">
        <h2 id="dialog-title" className="text-lead font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
