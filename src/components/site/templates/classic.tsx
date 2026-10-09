import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Image from "next/image";
import { CallLink, CheckIcon, ClockIcon, FaqList, HoursList, MapPinIcon, MobileCallBar, Paragraphs, PhoneIcon } from "../parts";
import type { TemplateProps } from "../types";

// Classic: light, calm and trust-focused. Serif headings, one deep-blue accent.

const serif = Source_Serif_4({ subsets: ["latin"], display: "swap", variable: "--font-classic-serif" });
const sans = Source_Sans_3({ subsets: ["latin"], display: "swap" });

const button =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-blue-800 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800";
const heading = "font-[family-name:var(--font-classic-serif)] font-semibold tracking-tight text-slate-900";

export function ClassicTemplate({ site, images }: TemplateProps) {
  const { content } = site;
  return (
    <div className={`${sans.className} ${serif.variable} bg-white pb-24 text-slate-700 antialiased md:pb-0`}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className={`${heading} text-xl sm:text-2xl`}>{site.name}</p>
          <div className="hidden items-center gap-5 md:flex">
            <span className="text-sm text-slate-600">Serving {site.city}</span>
            <CallLink phone={site.phone} className={button}>
              <PhoneIcon />
              {site.phone}
            </CallLink>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-slate-50">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-800">{site.category ?? "Local contractor"} · {site.city}</p>
              <h1 className={`${heading} mt-4 text-4xl leading-tight sm:text-5xl`}>{content.headline}</h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">{content.subheadline}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CallLink phone={site.phone} className={`${button} text-lg`}>
                  <PhoneIcon />
                  {content.cta.buttonLabel}
                </CallLink>
              </div>
              <ul className="mt-8 grid gap-3 text-slate-700 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-blue-800" />
                  Based in {site.city}
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-blue-800" />
                  Serving {content.serviceAreas.length} nearby areas
                </li>
              </ul>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-900/5">
              <Image
                src={images.hero.src}
                alt={images.hero.alt}
                fill
                preload
                sizes="(min-width: 1024px) 540px, 100vw"
                quality={70}
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <h2 className={`${heading} text-3xl sm:text-4xl`}>Our services</h2>
              <p className="mt-3 text-lg text-slate-600">What {site.name} can do for your home.</p>
            </div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((service) => (
                <li key={service.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-800">
                    <CheckIcon />
                  </div>
                  <h3 className={`${heading} mt-4 text-xl`}>{service.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{service.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <h2 className={`${heading} text-3xl sm:text-4xl`}>About {site.name}</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-700">
                <Paragraphs text={content.about} />
              </div>
            </div>
            <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-xl shadow-lg lg:order-2">
              <Image
                src={images.about.src}
                alt={images.about.alt}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                quality={70}
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className={`${heading} text-3xl sm:text-4xl`}>Service areas</h2>
            <p className="mt-3 text-lg text-slate-600">Homeowners in these communities call us for work.</p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
              {content.serviceAreas.map((area) => (
                <li key={area} className="flex items-center gap-2 border-b border-slate-200 py-2 font-medium text-slate-800">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-blue-800" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className={`${heading} text-center text-3xl sm:text-4xl`}>Frequently asked questions</h2>
            <div className="mt-10">
              <FaqList
                items={content.faq}
                itemClassName="rounded-lg border border-slate-200 bg-white"
                questionClassName="text-slate-900"
                answerClassName="text-slate-600"
                iconClassName="bg-blue-50 text-blue-800"
              />
            </div>
          </div>
        </section>

        <section className="bg-blue-800 text-white">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
            <h2 className="font-[family-name:var(--font-classic-serif)] text-3xl font-semibold tracking-tight sm:text-4xl">
              {content.cta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50">{content.cta.body}</p>
            <CallLink
              phone={site.phone}
              className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-white px-7 py-3 text-lg font-semibold text-blue-900 shadow transition hover:bg-blue-50"
            >
              <PhoneIcon />
              {content.cta.buttonLabel}
            </CallLink>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-3">
          <div>
            <p className="font-[family-name:var(--font-classic-serif)] text-xl font-semibold text-white">{site.name}</p>
            <CallLink phone={site.phone} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-white hover:underline">
              <PhoneIcon />
              {site.phone}
            </CallLink>
          </div>
          {site.address && (
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <MapPinIcon className="h-4 w-4" />
                Address
              </h2>
              <address className="mt-3 not-italic leading-relaxed">{site.address}</address>
            </div>
          )}
          {site.hours.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <ClockIcon className="h-4 w-4" />
                Hours
              </h2>
              <HoursList hours={site.hours} className="mt-3 text-sm" />
            </div>
          )}
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-5 text-sm text-slate-400 sm:px-8">
          © {new Date().getFullYear()} {site.name}
        </p>
      </footer>

      <MobileCallBar phone={site.phone} className="bg-blue-800 text-white" />
    </div>
  );
}
