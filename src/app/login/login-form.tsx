"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ initialError }: { initialError: string | null }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { error: initialError, email: "" });
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          className="mt-1 block min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
