"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center">
      <h1 className="text-lg font-semibold text-slate-900">This page couldn&apos;t load</h1>
      <p className="mt-2 text-slate-600">
        {error.message && !error.digest ? error.message : "Something went wrong on our side. Your data is safe."} Try
        again, and if it keeps happening check that Supabase is reachable.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
