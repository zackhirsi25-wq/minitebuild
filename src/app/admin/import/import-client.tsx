"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { parseImportCsv, type ImportParseResult } from "@/lib/content/csv";
import type { BatchProgress } from "@/lib/admin/queries";
import { processImportChunk, getImportProgress, retryFailedRows, startImport } from "../actions";

type Selected = { name: string; text: string; result: ImportParseResult };

export function ImportClient({ initialProgress }: { initialProgress: BatchProgress | null }) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Selected | null>(null);
  const [dragging, setDragging] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [progress, setProgress] = useState<BatchProgress | null>(initialProgress);
  const [driveError, setDriveError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function readFile(file: File) {
    setStartError(null);
    if (!/\.(csv|txt)$/i.test(file.name) && file.type !== "text/csv") {
      setSelected({
        name: file.name,
        text: "",
        result: { ok: false, error: "That isn't a CSV file. Export your sheet as CSV and try again." },
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSelected({
        name: file.name,
        text: "",
        result: { ok: false, error: "That file is over 2 MB. Split it into smaller files." },
      });
      return;
    }
    const text = await file.text();
    setSelected({ name: file.name, text, result: parseImportCsv(text) });
  }

  async function start() {
    if (!selected?.result.ok) return;
    setStarting(true);
    setStartError(null);
    const result = await startImport(selected.text, selected.name).catch(() => ({
      ok: false as const,
      error: "Couldn't reach the server. Check your connection and try again.",
    }));
    setStarting(false);
    if (!result.ok) {
      setStartError(result.error);
      return;
    }
    router.replace(`/admin/import?batch=${result.batchId}`);
  }

  // While this page is open, keep the queue moving one small chunk at a time.
  const active = !!progress && progress.queued + progress.running > 0;
  useEffect(() => {
    if (!progress || !active) return;
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        try {
          const next = await processImportChunk(progress.id);
          if (cancelled || !next) return;
          setProgress(next);
          setDriveError(null);
          if (next.queued + next.running === 0) {
            router.refresh();
            return;
          }
          // Rows waiting on a retry back-off, or claimed by the background worker.
          if (next.running > 0 || next.queued > 0) await new Promise((r) => setTimeout(r, 1500));
        } catch {
          if (cancelled) return;
          setDriveError("Lost contact with the server. Retrying… (the import keeps going in the background)");
          await new Promise((r) => setTimeout(r, 5000));
          const latest = await getImportProgress(progress.id).catch(() => null);
          if (latest && !cancelled) setProgress(latest);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Restart the loop only when the batch changes or becomes active again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.id, active]);

  if (progress) {
    const finished = progress.done + progress.failed;
    const percent = progress.total ? Math.round((finished / progress.total) * 100) : 100;
    const retryable = progress.rows.some((r) => r.retryable);
    return (
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold">{progress.filename ?? "Import"}</p>
          <p className="text-sm text-slate-600">
            {finished} of {progress.total} rows · {progress.done} generated · {progress.failed} failed
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Import progress"
          className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600" aria-live="polite">
          {active ? (
            <>
              <Spinner /> Generating sites… you can leave this page; the rest finishes in the background.
            </>
          ) : (
            "Finished."
          )}
        </p>
        {driveError && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{driveError}</p>}

        <ul className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {progress.rows.map((row) => (
            <li key={row.id} className="flex items-start gap-3 px-4 py-3">
              <span className="w-10 shrink-0 pt-0.5 text-sm tabular-nums text-slate-500">#{row.rowNumber}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {row.name}
                  {row.city && <span className="font-normal text-slate-500"> · {row.city}</span>}
                </p>
                {row.status === "failed" && row.error && <p className="mt-0.5 text-sm text-red-700">{row.error}</p>}
                {row.status === "queued" && row.error && (
                  <p className="mt-0.5 text-sm text-amber-800">Will retry: {row.error}</p>
                )}
              </div>
              <RowStatus status={row.status} business={row.business} />
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          {!active && retryable && (
            <button
              type="button"
              onClick={async () => {
                const result = await retryFailedRows(progress.id);
                if (!result.ok) toast.show(result.error, "error");
                else {
                  toast.show(result.message ?? "Queued again");
                  const latest = await getImportProgress(progress.id);
                  if (latest) setProgress(latest);
                }
              }}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Retry failed rows
            </button>
          )}
          <Link
            href="/admin/import"
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50"
          >
            Import another file
          </Link>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700"
          >
            View businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) readFile(file);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? "border-brand-600 bg-brand-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-10 w-10 text-slate-400"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        <p className="mt-3 font-medium text-slate-800">Drag a CSV file here</p>
        <p className="text-sm text-slate-500">or</p>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50"
        >
          Choose a file
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-label="CSV file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {selected && (
        <div className="mt-5">
          <p className="font-medium">{selected.name}</p>
          {!selected.result.ok ? (
            <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-red-800">
              {selected.result.error}
            </p>
          ) : (
            <>
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">
                Columns look right. {selected.result.validCount} business{selected.result.validCount === 1 ? "" : "es"}{" "}
                ready
                {selected.result.invalidCount > 0 &&
                  `, ${selected.result.invalidCount} row${selected.result.invalidCount === 1 ? "" : "s"} can't be used (listed below)`}
                .
              </p>
              <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">
                        Row
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-2">
                        City
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Phone
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.result.rows.slice(0, 200).map((row) => (
                      <tr key={row.rowNumber} className={row.error ? "bg-red-50/60" : undefined}>
                        <td className="px-3 py-2 tabular-nums text-slate-500">{row.rowNumber}</td>
                        <td className="px-3 py-2">
                          {row.input.name}
                          {row.error && <span className="block text-xs text-red-700">{row.error}</span>}
                        </td>
                        <td className="px-3 py-2">{row.input.city}</td>
                        <td className="px-3 py-2">{row.input.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selected.result.rows.length > 200 && (
                <p className="mt-2 text-sm text-slate-500">
                  Showing the first 200 of {selected.result.rows.length} rows.
                </p>
              )}
              {startError && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-red-800">
                  {startError}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={start}
                  disabled={starting || selected.result.validCount === 0}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {starting && <Spinner />}
                  {starting
                    ? "Starting…"
                    : `Generate ${selected.result.validCount} site${selected.result.validCount === 1 ? "" : "s"}`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex min-h-11 items-center rounded-lg px-4 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Choose a different file
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RowStatus({
  status,
  business,
}: {
  status: BatchProgress["rows"][number]["status"];
  business: { id: string } | null;
}) {
  if (status === "done" && business) {
    return (
      <Link
        href={`/admin/businesses/${business.id}`}
        className="shrink-0 text-sm font-semibold text-emerald-700 hover:underline"
      >
        Generated
      </Link>
    );
  }
  if (status === "failed") return <span className="shrink-0 text-sm font-semibold text-red-700">Failed</span>;
  if (status === "running")
    return (
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand-700">
        <Spinner className="h-3.5 w-3.5" /> Working
      </span>
    );
  return <span className="shrink-0 text-sm text-slate-500">Waiting</span>;
}
