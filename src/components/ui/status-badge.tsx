import type { BusinessStatus } from "@/lib/content/schema";

const styles: Record<BusinessStatus, string> = {
  preview: "bg-amber-100 text-amber-900 ring-amber-200",
  live: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  paused: "bg-slate-200 text-slate-800 ring-slate-300",
};

const labels: Record<BusinessStatus, string> = { preview: "Preview", live: "Live", paused: "Paused" };

export function StatusBadge({ status }: { status: BusinessStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${status === "live" ? "bg-emerald-600" : status === "preview" ? "bg-amber-500" : "bg-slate-500"}`}
      />
      {labels[status]}
    </span>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {tag}
    </span>
  );
}
