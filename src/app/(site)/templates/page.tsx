import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChipLink } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { product } from "@/config/product";
import { photoReadyTypes } from "@/demo";
import { BUSINESS_TYPE_LABELS, isBusinessType, type BusinessType } from "@/lib/business-type";
import { allTemplates, TEMPLATE_THUMBS } from "@/templates";
import { isStyleTag, STYLE_LABELS, STYLE_TAGS } from "@/templates/labels";
import type { StyleTag } from "@/templates";

export const metadata: Metadata = {
  title: `Templates | ${product.name}`,
  description: "Website designs for local businesses. Every template works for any kind of business.",
};

function href(type: BusinessType | null, style: StyleTag | null) {
  const q = new URLSearchParams();
  if (type) q.set("type", type);
  if (style) q.set("style", style);
  const s = q.toString();
  return s ? `/templates?${s}` : "/templates";
}

export default async function TemplatesPage({ searchParams }: PageProps<"/templates">) {
  const q = await searchParams;
  // Only business types with stock photos are offered (see photoReadyTypes).
  const readyTypes = photoReadyTypes();
  const type = isBusinessType(q.type) && readyTypes.includes(q.type) ? q.type : null;
  const style = isStyleTag(q.style) ? q.style : null;

  // Every template works for any business; the type filter shows the ones
  // designed with that business in mind first, and the rest after.
  const all = allTemplates().filter((t) => !style || t.styles.includes(style));
  const list = type
    ? [...all.filter((t) => t.suits.includes(type)), ...all.filter((t) => !t.suits.includes(type))]
    : all;
  const previewQuery = type ? `?type=${type}` : "";

  return (
    <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] pt-14 pb-[var(--mb-section)]">
      <div className="max-w-2xl">
        <h1 className="text-heading font-semibold">Templates</h1>
        <p className="mt-3 text-lead text-muted text-pretty">
          Every design works for any kind of business. Pick one, or let us choose when you build.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4">
        {readyTypes.length > 1 && (
          <FilterRow label="Business">
            <ChipLink href={href(null, style)} selected={!type} scroll={false}>
              All
            </ChipLink>
            {readyTypes.map((t) => (
              <ChipLink key={t} href={href(t, style)} selected={type === t} scroll={false}>
                {BUSINESS_TYPE_LABELS[t]}
              </ChipLink>
            ))}
          </FilterRow>
        )}
        <FilterRow label="Style">
          <ChipLink href={href(type, null)} selected={!style} scroll={false}>
            All
          </ChipLink>
          {STYLE_TAGS.map((s) => (
            <ChipLink key={s} href={href(type, s)} selected={style === s} scroll={false}>
              {STYLE_LABELS[s]}
            </ChipLink>
          ))}
        </FilterRow>
      </div>

      {list.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No templates match"
          action={
            <ButtonLink href="/templates" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        >
          Try another style, or show all templates.
        </EmptyState>
      ) : (
        <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {list.map((t) => {
            const thumb = TEMPLATE_THUMBS[t.id];
            return (
              <li key={t.id}>
                <Link href={`/templates/${t.id}${previewQuery}`} className="group block">
                  <div className="relative pr-[12%] pb-[9%]">
                    <div className="aspect-[16/10] overflow-hidden rounded-card border border-line bg-surface">
                      {thumb ? (
                        <Image
                          src={thumb.desktop}
                          alt={`${t.name} template, desktop view`}
                          sizes="(min-width: 768px) 520px, 88vw"
                          placeholder="blur"
                          className="h-full w-full object-cover object-top transition-transform duration-500 ease-mb group-hover:scale-[1.015]"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-small text-muted">Preview coming soon</div>
                      )}
                    </div>
                    {thumb && (
                      <div className="absolute right-0 bottom-0 w-[24%] overflow-hidden rounded-[14px] border border-line-strong shadow-overlay">
                        <Image src={thumb.mobile} alt="" sizes="140px" placeholder="blur" className="w-full" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-lead font-semibold">{t.name}</p>
                    <p className="text-small text-muted">{t.styles.map((s) => STYLE_LABELS[s]).join(" · ")}</p>
                  </div>
                  <p className="mt-1 max-w-[52ch] text-body text-muted">{t.concept}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="w-16 flex-none text-small text-muted">{label}</p>
      <div role="group" aria-label={label} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
        <div className="flex w-max gap-2 md:w-auto md:flex-wrap">{children}</div>
      </div>
    </div>
  );
}
