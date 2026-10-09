import Link from "next/link";
import { getBatchProgress, listRecentBatches } from "@/lib/admin/queries";
import { ImportClient } from "./import-client";
import { SingleBusinessForm } from "./single-form";

export const metadata = { title: "Import" };

export default async function ImportPage({ searchParams }: PageProps<"/admin/import">) {
  const { batch } = await searchParams;
  const batchId = typeof batch === "string" ? batch : null;
  const [initialProgress, recent] = await Promise.all([
    batchId ? getBatchProgress(batchId) : Promise.resolve(null),
    listRecentBatches(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import</h1>
        <p className="mt-1 text-slate-600">Generate a site for one business, or for every row in a CSV file.</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Add one business</h2>
        <p className="mt-1 text-sm text-slate-600">
          Takes up to a minute. You&apos;ll land on the new site when it&apos;s ready.
        </p>
        <div className="mt-4">
          <SingleBusinessForm />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Import a CSV</h2>
        <p className="mt-1 text-sm text-slate-600">
          One business per row, with columns <strong>name</strong>, <strong>city</strong> and <strong>phone</strong>. An
          optional <strong>services</strong> column (separated by semicolons) sets the exact services listed. Sites keep
          generating in the background if you close this tab.
        </p>
        <div className="mt-4">
          <ImportClient key={batchId ?? "new"} initialProgress={initialProgress} />
        </div>
        {batchId && !initialProgress && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            That import wasn&apos;t found. It may have been removed.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recent imports</h2>
        {recent.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-slate-600">
            No CSV imports yet. Your imports will be listed here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {recent.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/import?batch=${b.id}`}
                  className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
                >
                  <span>
                    <span className="font-medium text-slate-900">{b.filename ?? "Import"}</span>
                    <span className="block text-sm text-slate-500">
                      {b.total_rows} rows ·{" "}
                      {new Date(b.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </span>
                  <span className={`text-sm font-semibold ${b.completed_at ? "text-emerald-700" : "text-amber-700"}`}>
                    {b.completed_at ? "Finished" : "In progress"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
