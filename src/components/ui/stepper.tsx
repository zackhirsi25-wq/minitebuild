import { cx } from "./cx";

/**
 * Where someone is in a multi-step flow. Desktop shows every step; phones show
 * "Step 2 of 4 · Photos" with a progress bar.
 */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <nav aria-label="Progress">
      <ol className="hidden items-center gap-2 md:flex">
        {steps.map((step, i) => {
          const state = i < current ? "done" : i === current ? "current" : "todo";
          return (
            <li key={step} className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
              <span
                className={cx(
                  "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold",
                  state === "done" && "bg-fg text-canvas",
                  state === "current" && "border border-fg text-fg",
                  state === "todo" && "border border-line-strong text-muted",
                )}
              >
                {state === "done" ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                    <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={cx("text-small font-medium", state === "todo" ? "text-muted" : "text-fg")}>
                {step}
                {state === "done" && <span className="sr-only"> (done)</span>}
              </span>
              {i < steps.length - 1 && <span aria-hidden="true" className="mx-1 h-px w-8 bg-line-strong" />}
            </li>
          );
        })}
      </ol>
      <div className="md:hidden">
        <p className="text-small text-muted">
          Step {current + 1} of {steps.length} · <span className="font-medium text-fg">{steps[current]}</span>
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-raised" aria-hidden="true">
          <div className="h-full rounded-full bg-fg" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
    </nav>
  );
}
