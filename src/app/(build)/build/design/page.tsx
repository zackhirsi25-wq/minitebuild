import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { product } from "@/config/product";
import { getDraft } from "@/lib/build/draft";
import { allTemplates, TEMPLATE_THUMBS } from "@/templates";
import { chooseDesign } from "../actions";
import { StepShell } from "../shell";

export const metadata: Metadata = { title: `Choose a design | ${product.name}`, robots: { index: false } };

const card =
  "group relative block cursor-pointer overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-fg/30 has-[:checked]:border-fg has-[:checked]:ring-2 has-[:checked]:ring-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2";

export default async function DesignStep() {
  const current = await getDraft();
  if (!current?.data.confirmed) redirect("/build");
  if (current.data.slug) redirect("/build");
  const chosen = current.data.template ?? "auto";
  const templates = allTemplates();

  return (
    <StepShell
      step={2}
      back={{ href: "/build/photos" }}
      title="Choose a design"
      intro="Let us choose one made for your kind of business, or pick it yourself. You can change it later."
    >
      <form action={chooseDesign}>
        <fieldset>
          <legend className="sr-only">Design</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${card} sm:col-span-2`}>
              <input type="radio" name="template" value="auto" defaultChecked={chosen === "auto"} className="sr-only" />
              <span className="flex items-center gap-4 p-5">
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 flex-none place-items-center rounded-[12px] bg-raised text-xl"
                >
                  ✦
                </span>
                <span>
                  <span className="block text-lead font-semibold">Let us choose</span>
                  <span className="block text-small text-muted">A design made with your kind of business in mind.</span>
                </span>
              </span>
            </label>
            {templates.map((t) => {
              const thumb = TEMPLATE_THUMBS[t.id];
              return (
                <label key={t.id} className={card}>
                  <input
                    type="radio"
                    name="template"
                    value={t.id}
                    defaultChecked={chosen === t.id}
                    className="sr-only"
                  />
                  <span className="relative block aspect-[16/10] bg-raised">
                    {thumb && (
                      <Image
                        src={thumb.desktop}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 320px, 90vw"
                        placeholder="blur"
                        className="object-cover object-top"
                      />
                    )}
                  </span>
                  <span className="block p-4">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="mt-0.5 line-clamp-2 block text-small text-muted">{t.concept}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="sticky bottom-0 -mx-[var(--mb-gutter)] mt-10 border-t border-line bg-canvas/90 px-[var(--mb-gutter)] py-4 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <button
            type="submit"
            className="inline-flex h-13 w-full items-center justify-center rounded-button bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98] sm:w-auto"
          >
            Build my site
          </button>
        </div>
      </form>
    </StepShell>
  );
}
