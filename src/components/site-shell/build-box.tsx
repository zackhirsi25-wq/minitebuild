"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { startBuild, type DetailsState } from "@/app/(build)/build/actions";
import { Chip } from "@/components/ui/chip";
import { cx } from "@/components/ui/cx";
import { inputClass } from "@/components/ui/field";
import { PHONE_PLACEHOLDER, STARTERS } from "./starters";

/**
 * The build box: business name, city and phone. Posts to startBuild (so the
 * phone never appears in a URL), which looks the business up on Google and
 * opens the build flow. Used in the hero and again in the closing section.
 */
export function BuildBox({
  showStarters = true,
  starterTypes,
  className,
}: {
  showStarters?: boolean;
  /** Business types to offer as chips (those with stock photos). */
  starterTypes?: string[];
  className?: string;
}) {
  const starters = starterTypes ? STARTERS.filter((s) => starterTypes.includes(s.type)) : STARTERS;
  const [starter, setStarter] = useState<(typeof STARTERS)[number] | null>(null);
  const id = useId();
  const field = (name: string) => `${id}-${name}`;
  const [state, action, pending] = useActionState<DetailsState, FormData>(startBuild, {});

  return (
    <div className={cx("w-full", className)}>
      <form
        action={action}
        className="grid gap-2 rounded-[20px] border border-line-strong bg-surface p-2 shadow-raised"
      >
        {starter && <input type="hidden" name="type" value={starter.type} />}
        <div className="grid divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-canvas sm:grid-cols-[1.35fr_1fr_1fr] sm:divide-x sm:divide-y-0">
          <BoxInput
            id={field("name")}
            name="name"
            label="Business name"
            placeholder={starter?.name ?? "Your business name"}
            defaultValue={state.fields?.name}
            autoComplete="organization"
          />
          <BoxInput
            id={field("city")}
            name="city"
            label="City"
            placeholder={starter?.city ?? "City, state"}
            defaultValue={state.fields?.city}
            autoComplete="address-level2"
          />
          <BoxInput
            id={field("phone")}
            name="phone"
            label="Phone"
            type="tel"
            inputMode="tel"
            placeholder={PHONE_PLACEHOLDER}
            defaultValue={state.fields?.phone}
            autoComplete="tel"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-6 text-body font-semibold text-on-accent shadow-[0_10px_30px_-12px_var(--mb-accent)] transition-[background-color,transform] duration-150 ease-mb hover:bg-accent-hover active:scale-[0.98] disabled:opacity-70"
          >
            {pending ? "Looking you up…" : "Build my site"}
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {state.error && (
          <p role="alert" className="px-2 pb-1 text-left text-small text-danger">
            {state.error}
          </p>
        )}
      </form>

      {showStarters && (
        <div className="mt-5 grid justify-items-center gap-4">
          <div
            role="group"
            aria-label="Your kind of business"
            className="w-full overflow-x-auto [scrollbar-width:none]"
          >
            <div className="mx-auto flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
              {starters.map((s) => (
                <Chip
                  key={s.id}
                  pressed={starter?.id === s.id}
                  onClick={() => setStarter(starter?.id === s.id ? null : s)}
                >
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>
          <Link
            href="/templates"
            className="inline-flex min-h-11 items-center gap-1.5 text-small font-medium text-muted transition-colors hover:text-fg"
          >
            or choose a template
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function BoxInput({
  id,
  label,
  className,
  ...input
}: { id: string; label: string; className?: string } & React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <label htmlFor={id} className="pointer-events-none absolute top-2.5 left-4 text-[11px] font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        required
        className={cx(
          inputClass,
          "h-15 rounded-none border-0 bg-transparent pt-5 pl-4 text-body hover:bg-raised/50 focus-visible:-outline-offset-2",
          className,
        )}
        {...input}
      />
    </div>
  );
}
