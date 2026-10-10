import type { ReactNode } from "react";
import { cx } from "./cx";

/** What a screen shows when there's nothing yet, or when loading failed (tone="error"). */
export function EmptyState({
  title,
  children,
  action,
  tone = "empty",
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "empty" | "error";
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cx(
        "grid justify-items-center gap-3 rounded-card border border-dashed px-6 py-14 text-center",
        tone === "error" ? "border-danger/40" : "border-line-strong",
        className,
      )}
    >
      <p className={cx("text-lead font-semibold", tone === "error" ? "text-danger" : "text-fg")}>{title}</p>
      {children && <div className="max-w-md text-body text-muted">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
