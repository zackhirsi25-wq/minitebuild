import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BuildBox } from "@/components/site-shell/build-box";
import { photoReadyTypes } from "@/demo";
import { ButtonLink } from "@/components/ui/button";
import { annualSaving, formatPrice, product } from "@/config/product";
import { allTemplates, TEMPLATE_THUMBS } from "@/templates";

export const metadata: Metadata = {
  title: `${product.name} | A website for your business, built while you wait`,
  description: `Enter your business name, city and phone and get a finished website to preview right away. ${formatPrice(product.plans.monthly.price)} a month when you go live.`,
};

function Section({
  id,
  title,
  intro,
  children,
  className = "",
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-16 py-[var(--mb-section)] ${className}`}>
      <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)]">
        <div className="max-w-2xl">
          <h2 id={`${id}-title`} className="text-heading font-semibold text-balance">
            {title}
          </h2>
          {intro && <p className="mt-4 text-lead text-muted text-pretty">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Tell us who you are",
    body: "Enter your business name, city and phone. We look you up on Google to fill in your address and opening hours.",
    visual: "details",
  },
  {
    title: "We build it",
    body: "We write your headline, services and answers to common questions, and choose photos for your kind of business.",
    visual: "build",
  },
  {
    title: "Go live",
    body: "See the whole site first. When you're happy, choose a plan and we switch it on at its own address.",
    visual: "live",
  },
] as const;

function StepVisual({ kind }: { kind: (typeof STEPS)[number]["visual"] }) {
  if (kind === "details") {
    return (
      <div className="grid gap-2" aria-hidden="true">
        {[
          ["Business name", "Ridgeline Roofing"],
          ["City", "Denver, CO"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[10px] border border-line bg-canvas px-3 py-2">
            <p className="text-[10px] text-muted">{label}</p>
            <p className="text-small text-fg">{value}</p>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "build") {
    return (
      <ul className="grid gap-2.5 text-small" aria-hidden="true">
        {[
          ["done", "Found on Google"],
          ["done", "Wrote your headline"],
          ["now", "Choosing photos"],
          ["todo", "Building the page"],
        ].map(([state, label]) => (
          <li key={label} className="flex items-center gap-2.5">
            <span
              className={
                state === "done"
                  ? "grid h-4 w-4 place-items-center rounded-full bg-fg text-canvas"
                  : state === "now"
                    ? "h-4 w-4 rounded-full border-2 border-fg border-r-transparent motion-safe:animate-spin"
                    : "h-4 w-4 rounded-full border border-line-strong"
              }
            >
              {state === "done" && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                  <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </span>
            <span className={state === "todo" ? "text-muted" : "text-fg"}>{label}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div aria-hidden="true" className="rounded-[10px] border border-line bg-canvas">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="h-2 w-2 flex-none rounded-full bg-success" />
        <span className="min-w-0 truncate text-small text-fg">ridgeline-roofing.minitebuild.com</span>
      </div>
      <div className="grid gap-1.5 p-3">
        <span className="h-2 w-3/4 rounded-full bg-raised" />
        <span className="h-2 w-1/2 rounded-full bg-raised" />
        <span className="mt-2 h-6 w-24 rounded-md border border-line-strong" />
      </div>
    </div>
  );
}

const INCLUDED = [
  { title: "Hosting included", body: "Your site is hosted and kept online for you, at its own address." },
  {
    title: "Made for phones",
    body: "Most customers find a local business on a phone, so every page is built for one first.",
  },
  {
    title: "Tap to call",
    body: "Your number is on every screen. Calling you is one tap, wherever someone is on the page.",
  },
  {
    title: "Changes when you need them",
    body: "Email us what to update, from opening hours to services, and we change it on your site.",
  },
];

const QUESTIONS = [
  {
    q: "Do I pay before I see my site?",
    a: "No. You see the whole site first and only pay when you choose to go live.",
  },
  {
    q: "How long does it take?",
    a: "Usually a minute or two once you've confirmed your details. You can watch each step as it happens.",
  },
  {
    q: "What if my business isn't on Google?",
    a: "We build the site from the details you type in.",
  },
  {
    q: "Can I use my own photos?",
    a: "Yes. Add up to 10 photos while you build. Anywhere you don't, we use photos chosen for your kind of business. Add your logo too and we match your site's colours to it.",
  },
  {
    q: "Can I change the design later?",
    a: "Yes. While you're looking at your preview, choose Change design to switch templates and colours. Your words and photos come with you.",
  },
  {
    q: "How long does a preview stay up?",
    a: "Previews you build here are kept for 14 days. Choose a plan before then to keep yours.",
  },
];

export default function HomePage() {
  const { monthly, annual } = product.plans;
  const templates = allTemplates().filter((t) => TEMPLATE_THUMBS[t.id]);

  return (
    <>
      {/* Hero: the product. One headline, one line, the build box. */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[880px] bg-[radial-gradient(56%_46%_at_50%_42%,rgb(255_255_255/0.055),transparent_78%)]"
        />
        <div className="relative mx-auto grid max-w-[var(--mb-max)] justify-items-center px-[var(--mb-gutter)] pt-[clamp(56px,4rem+6vw,152px)] pb-[clamp(64px,4rem+4vw,128px)] text-center">
          <h1 id="hero-title" className="max-w-[16ch] text-display font-semibold text-balance">
            A website for your business, built while you wait.
          </h1>
          <p className="mt-5 text-lead text-muted">Name, city and phone. We do the rest.</p>
          <BuildBox className="mt-10 max-w-2xl" starterTypes={photoReadyTypes()} />
        </div>
      </section>

      <Section
        id="how-it-works"
        title="How it works"
        intro="Three steps, and you see the finished site before you decide anything."
        className="border-t border-line"
      >
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="grid min-w-0 grid-cols-1 content-start gap-6 rounded-card border border-line bg-surface p-6"
            >
              <div className="min-h-[124px]">
                <StepVisual kind={step.visual} />
              </div>
              <div>
                <p className="text-small text-muted">Step {i + 1}</p>
                <h3 className="mt-1 text-lead font-semibold">{step.title}</h3>
                <p className="mt-2 text-body text-muted text-pretty">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {templates.length > 0 && (
        <Section
          id="templates"
          title="Designs that look made by hand"
          intro="Every template works for any business. Yours is chosen for you, or pick one yourself."
          className="border-t border-line"
        >
          <ul className="-mx-[var(--mb-gutter)] mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--mb-gutter)] pb-4 [scrollbar-width:thin]">
            {templates.map((t) => {
              const thumb = TEMPLATE_THUMBS[t.id];
              return (
                <li key={t.id} className="w-[min(84vw,640px)] flex-none snap-start">
                  <Link href={`/templates/${t.id}`} className="group block">
                    <div className="relative pr-10 pb-8">
                      <div className="overflow-hidden rounded-card border border-line">
                        <Image
                          src={thumb.desktop}
                          alt={`${t.name} template, desktop view`}
                          sizes="(min-width: 768px) 600px, 80vw"
                          placeholder="blur"
                          className="w-full transition-transform duration-500 ease-mb group-hover:scale-[1.015]"
                        />
                      </div>
                      <div className="absolute right-0 bottom-0 w-[22%] overflow-hidden rounded-[14px] border border-line-strong shadow-overlay">
                        <Image src={thumb.mobile} alt="" sizes="140px" placeholder="blur" className="w-full" />
                      </div>
                    </div>
                    <p className="mt-2 text-lead font-semibold">{t.name}</p>
                    <p className="text-small text-muted">{t.concept}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/templates" variant="secondary" className="mt-6">
            See all templates
          </ButtonLink>
        </Section>
      )}

      <Section id="included" title="Everything a local business site needs" className="border-t border-line">
        <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map((item) => (
            <li key={item.title} className="border-t border-line-strong pt-5">
              <h3 className="text-lead font-semibold">{item.title}</h3>
              <p className="mt-2 text-body text-muted text-pretty">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="pricing"
        title="One price, everything included"
        intro="Build and preview for free. Pay only when you go live."
        className="border-t border-line"
      >
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:max-w-4xl">
          {[
            { plan: monthly, note: "Billed every month." },
            { plan: annual, note: `Billed once a year. Save ${formatPrice(annualSaving)} compared with monthly.` },
          ].map(({ plan, note }) => (
            <div key={plan.id} className="rounded-card border border-line bg-surface p-7">
              <p className="text-body font-medium">{plan.label}</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-heading font-semibold">{formatPrice(plan.price)}</span>
                <span className="text-body text-muted">/ {plan.interval}</span>
              </p>
              <p className="mt-3 text-small text-muted">{note}</p>
              <ul className="mt-6 grid gap-2 border-t border-line pt-6 text-body">
                {INCLUDED.map((i) => (
                  <li key={i.title} className="flex gap-2.5">
                    <svg viewBox="0 0 16 16" className="mt-1 h-4 w-4 flex-none text-muted" aria-hidden="true">
                      <path d="M3.5 8.4 6.5 11 12.5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    {i.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/build" size="lg">
            Build my site
          </ButtonLink>
          <p className="text-small text-muted">You choose a plan after you see your site.</p>
        </div>
      </Section>

      <Section id="questions" title="Questions" className="border-t border-line">
        <div className="mt-12 max-w-3xl divide-y divide-line border-y border-line">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lead font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="relative h-3.5 w-3.5 flex-none text-muted">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                  <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-200 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-body text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <section aria-labelledby="closing-title" className="border-t border-line py-[var(--mb-section)]">
        <div className="mx-auto grid max-w-[var(--mb-max)] justify-items-center px-[var(--mb-gutter)] text-center">
          <h2 id="closing-title" className="text-heading font-semibold">
            Ready when you are.
          </h2>
          <p className="mt-4 text-lead text-muted">Your site is a minute or two away.</p>
          <BuildBox showStarters={false} className="mt-10 max-w-2xl" />
        </div>
      </section>
    </>
  );
}
