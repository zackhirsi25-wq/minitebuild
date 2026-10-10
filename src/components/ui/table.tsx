import type { ComponentProps } from "react";
import { cx } from "./cx";

// Plain table parts with the shared spacing and hairlines. The admin's sites
// table switches to cards on phones; these parts are for md and up.

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface">
      <table className={cx("w-full border-collapse text-left text-body", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cx("h-11 border-b border-line px-4 text-small font-medium whitespace-nowrap text-muted", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cx("h-14 border-b border-line px-4 align-middle", className)} {...props} />;
}
