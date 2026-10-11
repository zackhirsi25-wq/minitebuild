"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui/cx";
import type { BuildEvent, BuildStepId } from "@/lib/build/run";

type StepState = { id: BuildStepId; label: string; status: "todo" | "running" | "done" };

/**
 * Starts the build and shows each step as the server reports it (a stream of
 * JSON lines from /api/build), then opens the preview.
 */
export function BuildProgress({ steps }: { steps: { id: BuildStepId; label: string }[] }) {
  const router = useRouter();
  const [state, setState] = useState<StepState[]>(steps.map((s) => ({ ...s, status: "todo" })));
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(-1);

  useEffect(() => {
    if (started.current === attempt) return;
    started.current = attempt;
    let cancelled = false;

    const apply = (event: BuildEvent) => {
      if (event.type === "step") {
        setState((list) =>
          list.map((s) => (s.id === event.step ? { ...s, status: event.status, label: event.label } : s)),
        );
      } else if (event.type === "done") {
        router.replace(`/p/${event.slug}`);
      } else {
        setError(event.message);
      }
    };

    (async () => {
      try {
        const res = await fetch("/api/build", { method: "POST" });
        if (!res.body) throw new Error("No response");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (line) apply(JSON.parse(line) as BuildEvent);
          }
        }
      } catch {
        if (!cancelled) setError("We lost the connection while building. Please try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  return (
    <div>
      <ol className="grid gap-4" aria-live="polite">
        {state.map((s) => (
          <li key={s.id} className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className={cx(
                "grid h-7 w-7 flex-none place-items-center rounded-full",
                s.status === "done" && "bg-fg text-canvas",
                s.status === "running" && "border-2 border-fg border-r-transparent motion-safe:animate-spin",
                s.status === "todo" && "border border-line-strong",
              )}
            >
              {s.status === "done" && (
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5">
                  <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </span>
            <span className={cx("text-lead", s.status === "todo" ? "text-muted" : "text-fg")}>
              {s.label}
              <span className="sr-only">
                {s.status === "done" ? " (done)" : s.status === "running" ? " (in progress)" : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>
      {error && (
        <div role="alert" className="mt-10 rounded-card border border-danger/40 p-5">
          <p className="font-semibold text-danger">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setState(steps.map((s) => ({ ...s, status: "todo" })));
              setAttempt((a) => a + 1);
            }}
            className="mt-4 inline-flex h-11 items-center rounded-button border border-line-strong bg-raised px-4 text-small font-semibold"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
