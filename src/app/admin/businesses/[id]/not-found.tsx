import Link from "next/link";

export default function BusinessNotFound() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <h1 className="text-lg font-semibold">Business not found</h1>
      <p className="mt-2 text-slate-600">It may have been deleted, or the link is wrong.</p>
      <Link href="/admin" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-700 hover:underline">
        Back to businesses
      </Link>
    </div>
  );
}
