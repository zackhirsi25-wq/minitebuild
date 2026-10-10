import type { ComponentProps } from "react";
import { cx } from "./cx";

/** A surface with a hairline border. `raised` adds the raised shadow (used sparingly). */
export function Card({ raised = false, className, ...props }: { raised?: boolean } & ComponentProps<"div">) {
  return (
    <div
      className={cx("rounded-card border border-line bg-surface", raised && "shadow-raised", className)}
      {...props}
    />
  );
}
