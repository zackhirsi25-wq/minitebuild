import type { Metadata } from "next";
import { Onest } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { product } from "@/config/product";
import { ownedBusiness } from "@/lib/build/owner";
import { getPublicSite } from "@/lib/sites/public";
import { allTemplates, resolveTemplateId, TEMPLATE_THUMBS, templateMeta } from "@/templates";
import { setDesign } from "./actions";

export const metadata: Metadata = { title: `Change design | ${product.name}`, robots: { index: false, follow: false } };

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

const card =
  "group relative block cursor-pointer overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-fg/30 has-[:checked]:border-fg has-[:checked]:ring-2 has-[:checked]:ring-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2";

/** For the person who built the preview: switch template (and colours) without losing any content. */
export default async function ChangeDesignPage({ params, searchParams }: PageProps<"/p/[slug]/design">) {
  const { slug } = await params;
  const q = await searchParams;
  const site = await getPublicSite(slug);
  const owned = site ? await ownedBusiness(slug) : null;
  if (!site || !owned) notFound();

  const current = resolveTemplateId(owned.template);
  const selected = typeof q.template === "string" && q.template ? resolveTemplateId(q.template) : current;
  const meta = templateMeta(selected);

  return (
    <div className={`mb ${onest.variable} min-h-dvh`} data-theme="dark">
      <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] pt-8 pb-24">
        <Link
          href={`/p/${slug}`}
          className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-button px-2 text-small font-medium text-muted hover:text-fg"
        >
          <span aria-hidden="true">←</span> Back to your preview
        </Link>
        <h1 className="mt-2 text-heading font-semibold">Change design</h1>
        <p className="mt-3 max-w-2xl text-lead text-muted">
          Your words and photos stay the same. Only the design and colours change.
        </p>

        <form action={setDesign} className="mt-10">
          <input type="hidden" name="slug" value={slug} />
          <fieldset>
            <legend className="text-lead font-semibold">Template</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allTemplates().map((t) => {
                const thumb = TEMPLATE_THUMBS[t.id];
                return (
                  <label key={t.id} className={card}>
                    <input
                      type="radio"
                      name="template"
                      value={t.id}
                      defaultChecked={t.id === selected}
                      className="sr-only"
                    />
                    <span className="relative block aspect-[16/10] bg-raised">
                      {thumb && (
                        <Image
                          src={thumb.desktop}
                          alt=""
                          fill
                          sizes="360px"
                          placeholder="blur"
                          className="object-cover object-top"
                        />
                      )}
                    </span>
                    <span className="block p-4">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{t.name}</span>
                        {t.id === current && <span className="text-small text-muted">Current</span>}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="text-lead font-semibold">Colours for {meta.name}</legend>
            <p className="mt-1 text-small text-muted">
              These colours are for {meta.name}. If you switch to another template, its colours start on automatic and
              you can change them here afterwards.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-4 text-small has-[:checked]:border-fg has-[:checked]:bg-raised">
                <input
                  type="radio"
                  name="palette"
                  value=""
                  defaultChecked={!owned.palette || selected !== current}
                  className="sr-only"
                />
                Automatic
              </label>
              {meta.palettes.map((p) => (
                <label
                  key={p.id}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-4 text-small has-[:checked]:border-fg has-[:checked]:bg-raised"
                >
                  <input
                    type="radio"
                    name="palette"
                    value={p.id}
                    defaultChecked={selected === current && owned.palette === p.id}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full border border-line-strong"
                    style={{ background: p.vars.accent }}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-13 items-center justify-center rounded-button bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Save design
            </button>
            <Link
              href={`/p/${slug}`}
              className="inline-flex min-h-11 items-center px-3 text-small font-medium text-muted hover:text-fg"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
