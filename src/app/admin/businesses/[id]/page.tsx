import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getBusiness } from "@/lib/admin/queries";
import {
  siteContentSchema,
  type BusinessStatus,
  type ImageSlot,
  type Tag,
  type TemplateId,
  type Trade,
} from "@/lib/content/schema";
import { env } from "@/lib/env";
import { siteImage } from "@/lib/images/stock";
import { appUrl, liveSiteUrl } from "@/lib/routing/hostname";
import { imageOverridesSchema } from "@/lib/content/schema";
import { BusinessActions } from "./business-actions";
import { Editor } from "./editor";
import { NotesAndTags } from "./notes-tags";
import { Photos } from "./photos";

export const metadata = { title: "Business" };

function when(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : null;
}

export default async function BusinessPage({ params, searchParams }: PageProps<"/admin/businesses/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  const result = await getBusiness(id);
  if (!result) notFound();
  const { business: b, subscriptions, events } = result;

  const previewUrl = appUrl(`/p/${b.slug}`, env.rootDomain);
  const liveUrl = liveSiteUrl(b.slug, env.rootDomain);
  const shareUrl = b.status === "live" ? liveUrl : previewUrl;
  const content = siteContentSchema.safeParse(b.content);
  const images = imageOverridesSchema.parse(b.images);
  const site = { slug: b.slug, trade: b.trade as Trade, images };
  const slots = (["hero", "about"] as ImageSlot[]).map((slot) => ({
    slot,
    image: siteImage(site, slot, env.supabaseUrl),
    uploaded: !!images[slot],
  }));

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← All businesses
      </Link>

      {created === "1" && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-900">
          Site generated. Check the details against Google and the copy, then save.
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{b.name}</h1>
            <StatusBadge status={b.status as BusinessStatus} />
          </div>
          <p className="mt-1 text-slate-600">
            {b.city} · created {when(b.created_at)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {b.status === "live" ? "Open live site" : "Open preview"} ↗
            </a>
            <CopyLinkButton url={shareUrl} />
            <span className="break-all text-sm text-slate-500">{shareUrl.replace(/^https?:\/\//, "")}</span>
          </div>
        </div>
        <BusinessActions id={b.id} status={b.status as BusinessStatus} />
      </div>

      {!b.details_confirmed_at && (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {b.place_id
            ? "These details came from Google. Check them and save to confirm."
            : "Google had no listing for this business, so the details come from what was entered. Check them and save to confirm."}
        </p>
      )}

      <div className="mt-6">
        {content.success ? (
          <Editor
            id={b.id}
            slug={b.slug}
            initial={{
              details: {
                name: b.name,
                city: b.city,
                phone: b.phone,
                address: b.address ?? "",
                category: b.category ?? "",
                hours: b.hours,
                websiteUrl: b.website_url ?? "",
                trade: b.trade as Trade,
                template: b.template as TemplateId,
              },
              content: content.data,
            }}
            savedAt={b.updated_at}
            servicesConfirmed={!!b.services_confirmed_at}
          />
        ) : (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">
            The stored copy for this site is incomplete. Use “Regenerate copy” to write it again.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Photos id={b.id} name={b.name} city={b.city} slots={slots} />
        <NotesAndTags id={b.id} notes={b.notes} tags={b.tags as Tag[]} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Google data</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-500">Entered as</dt>
            <dd>
              {b.input_name}, {b.input_city}, {b.input_phone}
            </dd>
            <dt className="text-slate-500">Google listing</dt>
            <dd>{b.place_id ? <span className="break-all">{b.place_id}</span> : "Not found (unverified)"}</dd>
            <dt className="text-slate-500">Website</dt>
            <dd>
              {b.website_url ? (
                <a
                  href={b.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-brand-700 hover:underline"
                >
                  {b.website_url}
                </a>
              ) : (
                "None listed"
              )}
            </dd>
            <dt className="text-slate-500">Fetched</dt>
            <dd>{when(b.places_fetched_at) ?? "Never"}</dd>
            <dt className="text-slate-500">Confirmed</dt>
            <dd>{when(b.details_confirmed_at) ?? "Not yet"}</dd>
            <dt className="text-slate-500">Owner confirmed</dt>
            <dd>{when(b.owner_confirmed_at) ?? "Not yet (confirmed when they pay)"}</dd>
          </dl>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Billing</h2>
          {subscriptions.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No subscription yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {subscriptions.map((s) => (
                <li key={s.id} className="flex flex-wrap justify-between gap-2">
                  <span>
                    {s.plan === "annual" ? "Annual" : "Monthly"} via {s.provider}
                  </span>
                  <span className="font-medium">{s.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
          {events.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold text-slate-700">Recent events</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {events.map((e) => (
                  <li key={e.id}>
                    {e.type.replace(/_/g, " ")} · {e.provider} · {when(e.received_at)}
                    {e.error && <span className="text-red-700"> · {e.error}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
