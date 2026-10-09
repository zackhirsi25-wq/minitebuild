import Link from "next/link";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { StatusBadge, TagBadge } from "@/components/ui/status-badge";
import { listBusinesses, PAGE_SIZE, parseFilters } from "@/lib/admin/queries";
import { STATUSES, TAGS, type BusinessStatus } from "@/lib/content/schema";
import { env } from "@/lib/env";
import { appUrl, liveSiteUrl } from "@/lib/routing/hostname";

export const metadata = { title: "Businesses" };

const TEMPLATE_LABELS: Record<string, string> = { bold: "Bold", classic: "Classic", split: "Split" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BusinessesPage({ searchParams }: PageProps<"/admin">) {
  const filters = parseFilters(await searchParams);
  const { rows, total } = await listBusinesses(filters);
  const filtered = !!(filters.q || filters.status || filters.tag);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.tag) params.set("tag", filters.tag);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  const linkFor = (row: { slug: string; status: string }) =>
    row.status === "live" ? liveSiteUrl(row.slug, env.rootDomain) : appUrl(`/p/${row.slug}`, env.rootDomain);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Businesses</h1>
          <p className="mt-1 text-slate-600">
            {total} {filtered ? "matching" : "in total"}
          </p>
        </div>
        <Link
          href="/admin/import"
          className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700"
        >
          Add businesses
        </Link>
      </div>

      <form
        className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto]"
        role="search"
      >
        <label className="sr-only" htmlFor="q">
          Search by name
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Search by name"
          className="min-h-11 rounded-lg border border-slate-300 px-3 text-base"
        />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status ?? ""}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="tag">
          Tag
        </label>
        <select
          id="tag"
          name="tag"
          defaultValue={filters.tag ?? ""}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
        >
          <option value="">All tags</option>
          {TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="min-h-11 flex-1 rounded-lg bg-slate-900 px-4 font-semibold text-white hover:bg-slate-800"
          >
            Filter
          </button>
          {filtered && (
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-slate-600 hover:bg-slate-100"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          {filtered ? (
            <>
              <h2 className="text-lg font-semibold">No businesses match</h2>
              <p className="mt-2 text-slate-600">Try a different name, status or tag.</p>
              <Link
                href="/admin"
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-700 hover:underline"
              >
                Show all businesses
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">No businesses yet</h2>
              <p className="mt-2 text-slate-600">
                Add one by name, city and phone, or import a CSV to generate sites in bulk.
              </p>
              <Link
                href="/admin/import"
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700"
              >
                Add your first business
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="mt-6 space-y-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/admin/businesses/${row.id}`}
                    className="min-h-11 font-semibold text-slate-900 hover:underline"
                  >
                    {row.name}
                    <span className="block text-sm font-normal text-slate-500">{row.city}</span>
                  </Link>
                  <StatusBadge status={row.status as BusinessStatus} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <TagBadge tag={TEMPLATE_LABELS[row.template]} />
                  {row.tags.map((t) => (
                    <TagBadge key={t} tag={t} />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-500">{formatDate(row.created_at)}</span>
                  <div className="flex gap-2">
                    <a
                      href={linkFor(row)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700"
                    >
                      Open
                    </a>
                    <CopyLinkButton url={linkFor(row)} label="Copy" />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Business
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Template
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tags
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Link
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/businesses/${row.id}`}
                        className="font-semibold text-slate-900 hover:underline"
                      >
                        {row.name}
                      </Link>
                      <span className="block text-slate-500">{row.city}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status as BusinessStatus} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{TEMPLATE_LABELS[row.template]}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.tags.length ? (
                          row.tags.map((t) => <TagBadge key={t} tag={t} />)
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={linkFor(row)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-brand-700 hover:underline"
                        >
                          {row.status === "live" ? "Live site" : "Preview"}
                        </a>
                        <CopyLinkButton url={linkFor(row)} label="Copy" />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <nav aria-label="Pages" className="mt-6 flex items-center justify-between">
              {filters.page > 1 ? (
                <Link
                  href={pageHref(filters.page - 1)}
                  className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 font-medium"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-slate-600">
                Page {filters.page} of {pages}
              </span>
              {filters.page < pages ? (
                <Link
                  href={pageHref(filters.page + 1)}
                  className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 font-medium"
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
