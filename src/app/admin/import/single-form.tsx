"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { createSingleBusiness, type CreateSingleState } from "../actions";

const input =
  "mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function SingleBusinessForm() {
  const [state, action, pending] = useActionState<CreateSingleState, FormData>(createSingleBusiness, {
    error: null,
    values: { name: "", city: "", phone: "" },
  });
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[2fr_1.2fr_1.2fr_auto] sm:items-end">
      <div>
        <label htmlFor="single-name" className="text-sm font-medium text-slate-700">
          Business name
        </label>
        <input id="single-name" name="name" required defaultValue={state.values.name} className={input} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="single-city" className="text-sm font-medium text-slate-700">
          City
        </label>
        <input id="single-city" name="city" required defaultValue={state.values.city} className={input} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="single-phone" className="text-sm font-medium text-slate-700">
          Phone
        </label>
        <input
          id="single-phone"
          name="phone"
          type="tel"
          required
          defaultValue={state.values.phone}
          className={input}
          autoComplete="off"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Generating…" : "Generate site"}
      </button>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-4">
          {state.error}
        </p>
      )}
      {pending && (
        <p aria-live="polite" className="text-sm text-slate-600 sm:col-span-4">
          Looking the business up on Google and writing the copy…
        </p>
      )}
    </form>
  );
}
