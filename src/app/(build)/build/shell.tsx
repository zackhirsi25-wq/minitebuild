import Link from "next/link";
import type { ReactNode } from "react";
import { Stepper } from "@/components/ui/stepper";

export const STEPS = ["Details", "Photos", "Design", "Preview"];

/** Frame for one build step: stepper, back link, title, one task. */
export function StepShell({
  step,
  back,
  title,
  intro,
  children,
}: {
  step: number;
  back?: { href: string; label?: string };
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] pt-8 pb-24">
      <Stepper steps={STEPS} current={step} />
      <div className="mt-10 max-w-2xl">
        {back && (
          <Link
            href={back.href}
            className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-button px-2 text-small font-medium text-muted transition-colors hover:text-fg"
          >
            <span aria-hidden="true">←</span> {back.label ?? "Back"}
          </Link>
        )}
        <h1 className="mt-2 text-heading font-semibold text-balance">{title}</h1>
        {intro && <div className="mt-3 text-lead text-muted text-pretty">{intro}</div>}
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
