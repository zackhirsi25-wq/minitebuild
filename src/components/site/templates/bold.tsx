import { Archivo } from "next/font/google";
import Image from "next/image";
import {
  CallLink,
  CheckIcon,
  ClockIcon,
  FaqList,
  HoursList,
  MapPinIcon,
  MobileCallBar,
  Paragraphs,
  PhoneIcon,
} from "../parts";
import type { TemplateProps } from "../types";

// Bold: dark hero, heavy type, one amber accent.

const font = Archivo({ subsets: ["latin"], display: "swap" });

const accentButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-extrabold text-neutral-950 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300";

export function BoldTemplate({ site, images }: TemplateProps) {
  const { content } = site;
  return (
    <div className={`${font.className} bg-neutral-950 pb-24 text-neutral-100 antialiased md:pb-0`}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-lg font-extrabold uppercase tracking-wide sm:text-xl">{site.name}</p>
          <div className="hidden md:block">
            <CallLink phone={site.phone} className={accentButton}>
              <PhoneIcon />
              {site.phone}
            </CallLink>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <Image
            src={images.hero.src}
            alt={images.hero.alt}
            fill
            preload
            sizes="100vw"
            quality={70}
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/55" />
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:pb-32 lg:pt-36">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
              <MapPinIcon className="h-4 w-4" />
              {site.city}
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {content.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-200 sm:text-xl">{content.subheadline}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CallLink phone={site.phone} className={`${accentButton} text-lg`}>
                <PhoneIcon />
                {content.cta.buttonLabel}
              </CallLink>
              <a
                href="#services"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:border-white/60"
              >
                See our services
              </a>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-4 border-t border-white/10 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">What we do</h2>
            <div className="mt-3 h-1 w-16 rounded bg-amber-400" />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((service, i) => (
                <li key={service.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <span className="text-sm font-bold text-amber-400">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-xl font-bold text-white">{service.title}</h3>
                  <p className="mt-2 leading-relaxed text-neutral-300">{service.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-neutral-900 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={images.about.src}
                alt={images.about.alt}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                quality={70}
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">About {site.name}</h2>
              <div className="mt-3 h-1 w-16 rounded bg-amber-400" />
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-neutral-300">
                <Paragraphs text={content.about} />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Areas we serve</h2>
            <div className="mt-3 h-1 w-16 rounded bg-amber-400" />
            <ul className="mt-8 flex flex-wrap gap-3">
              {content.serviceAreas.map((area) => (
                <li
                  key={area}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-medium text-neutral-100"
                >
                  <CheckIcon className="h-4 w-4 text-amber-400" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-white/10 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Common questions</h2>
            <div className="mt-3 h-1 w-16 rounded bg-amber-400" />
            <div className="mt-8">
              <FaqList
                items={content.faq}
                itemClassName="rounded-xl border border-white/10 bg-white/[0.04]"
                questionClassName="text-white"
                answerClassName="text-neutral-300"
                iconClassName="bg-amber-400 text-neutral-950"
              />
            </div>
          </div>
        </section>

        <section className="bg-amber-400 text-neutral-950">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{content.cta.heading}</h2>
              <p className="mt-3 text-lg font-medium">{content.cta.body}</p>
            </div>
            <CallLink
              phone={site.phone}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-7 py-3 text-lg font-extrabold text-white transition hover:bg-neutral-800"
            >
              <PhoneIcon />
              {content.cta.buttonLabel}
            </CallLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 text-neutral-300">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-extrabold uppercase tracking-wide text-white">{site.name}</p>
            <CallLink
              phone={site.phone}
              className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-amber-400 hover:underline"
            >
              <PhoneIcon />
              {site.phone}
            </CallLink>
          </div>
          {site.address && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                <MapPinIcon className="h-4 w-4 text-amber-400" />
                Address
              </h2>
              <address className="mt-3 not-italic leading-relaxed">{site.address}</address>
            </div>
          )}
          {site.hours.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                <ClockIcon className="h-4 w-4 text-amber-400" />
                Hours
              </h2>
              <HoursList hours={site.hours} className="mt-3 text-sm" />
            </div>
          )}
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-5 text-sm text-neutral-400 sm:px-8">
          © {new Date().getFullYear()} {site.name}. Serving {site.city} and nearby.
        </p>
      </footer>

      <MobileCallBar phone={site.phone} className="bg-amber-400 text-neutral-950" />
    </div>
  );
}
