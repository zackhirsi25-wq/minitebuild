import { Skeleton } from "@/components/admin/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-4 h-8 w-64" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-[70vh]" />
      </div>
    </div>
  );
}
