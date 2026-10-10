import { cx } from "./cx";

/** Loading placeholder. Pulses gently; still under reduced motion. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("animate-pulse rounded-control bg-raised", className)} />;
}
