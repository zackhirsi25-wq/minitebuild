import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "./cx";

const chip =
  "inline-flex h-11 items-center gap-1.5 sm:h-9 whitespace-nowrap rounded-full border px-3.5 text-small font-medium transition-colors duration-150 ease-mb";
const off = "border-line-strong text-muted hover:border-fg/30 hover:text-fg";
const on = "border-fg bg-fg text-canvas";

/** A toggle chip. `pressed` marks the selected one. */
export function Chip({ pressed = false, className, ...props }: { pressed?: boolean } & ComponentProps<"button">) {
  return <button type="button" aria-pressed={pressed} className={cx(chip, pressed ? on : off, className)} {...props} />;
}

/** A chip that's a link (filters kept in the URL). */
export function ChipLink({
  selected = false,
  className,
  ...props
}: { selected?: boolean } & ComponentProps<typeof Link>) {
  return (
    <Link
      aria-current={selected ? "true" : undefined}
      className={cx(chip, selected ? on : off, className)}
      {...props}
    />
  );
}
