"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { startBuild, type DetailsState } from "./actions";

/** Name, city and phone. Posts to startBuild, which looks the business up on Google. */
export function DetailsForm({
  initial,
  template,
  submitLabel = "Find my business",
}: {
  initial?: { name: string; city: string; phone: string };
  template?: string;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState<DetailsState, FormData>(startBuild, {});
  const values = state.fields ?? initial;
  return (
    <form action={action} className="grid gap-5" noValidate>
      {template && <input type="hidden" name="template" value={template} />}
      <Field label="Business name" name="name" defaultValue={values?.name} autoComplete="organization" required />
      <Field
        label="City"
        name="city"
        defaultValue={values?.city}
        autoComplete="address-level2"
        hint="City and state, e.g. Denver, CO"
        required
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        inputMode="tel"
        defaultValue={values?.phone}
        autoComplete="tel"
        required
      />
      {state.error && (
        <p role="alert" className="rounded-control border border-danger/40 px-4 py-3 text-small text-danger">
          {state.error}
        </p>
      )}
      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-13 items-center justify-center gap-2 rounded-button bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Looking you up…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
