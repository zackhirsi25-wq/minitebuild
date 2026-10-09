import { Manrope } from "next/font/google";
import Image from "next/image";
import { CallLink, ClockIcon, FaqList, HoursList, MapPinIcon, MobileCallBar, Paragraphs, PhoneIcon } from "../parts";
import type { TemplateProps } from "../types";

// Split: two-column hero (copy left, full-height photo right), warm neutral
// palette with one terracotta accent.

const font = Manrope({ subsets: ["latin"], display: "swap" });

const button =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-700 px-6 py-3 font-bold text-white transition hover:bg-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700";

export function SplitTemplate({ site, images }: TemplateProps) {
  const { content } = site;
  return (
    <div className={`${font.className} bg-[#fbf8f3] pb-24 text-stone-800 antialiased md:pb-0`}>
      <header className="border-b border-stone-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
            <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-orange-700" />
            {site.name}
          </p>
          <div className="hidden md:block">
            <CallLink phone={site.phone} className={button}>
              <PhoneIcon />
              {site.phone}
            </CallLink>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl lg:min-h-[600px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 sm:py-20 lg:py-24 lg:pr-14">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-700">{site.city}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl">
              {content.headline}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone-600 sm:text-xl">{content.subheadline}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CallLink phone={site.phone} className={`${button} text-lg`}>
                <PhoneIcon />
                {content.cta.buttonLabel}
              </CallLink>
              <span className="text-center text-stone-600 sm:text-left">or call {site.phone}</span>
            </div>
          </div>
          <div className="relative aspect-[3/2] lg:aspect-auto">
            <Image
              src={images.hero.src}
              alt={images.hero.alt}
              fill
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={70}
              className="object-cover lg:rounded-bl-[3rem]"
            />
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Services</h2>
                <p className="mt-3 text-lg text-stone-600">Work we take on in {site.city} and nearby.</p>
              </div>
              <ul className="grid gap-x-10 sm:grid-cols-2">
                {content.services.map((service) => (
                  <li key={service.title} className="border-t-2 border-stone-200 py-6">
                    <h3 className="text-lg font-bold text-stone-900">{service.title}</h3>
                    <p className="mt-2 leading-relaxed text-stone-600">{service.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src={images.about.src}
                alt={images.about.alt}
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                quality={70}
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">About us</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-stone-700">
                <Paragraphs text={content.about} />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Where we work</h2>
            <ul className="mt-8 flex flex-wrap gap-3">
              {content.serviceAreas.map((area) => (
                <li key={area} className="rounded-full bg-orange-50 px-4 py-2 font-semibold text-orange-900 ring-1 ring-orange-200">
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Questions, answered</h2>
            <FaqList
              items={content.faq}
              itemClassName="rounded-2xl bg-[#fbf8f3]"
              questionClassName="text-stone-900"
              answerClassName="text-stone-600"
              iconClassName="bg-orange-700 text-white"
            />
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-3xl bg-stone-900 px-6 py-12 text-white sm:px-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{content.cta.heading}</h2>
              <p className="mt-3 text-lg text-stone-300">{content.cta.body}</p>
            </div>
            <CallLink phone={site.phone} className={`${button} min-h-14 px-7 text-lg`}>
              <PhoneIcon />
              {content.cta.buttonLabel}
            </CallLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-extrabold text-stone-900">{site.name}</p>
            <CallLink phone={site.phone} className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-orange-800 hover:underline">
              <PhoneIcon />
              {site.phone}
            </CallLink>
          </div>
          {site.address && (
            <div>
              <h2 className="flex items-center gap-2 font-bold text-stone-900">
                <MapPinIcon className="h-4 w-4 text-orange-700" />
                Address
              </h2>
              <address className="mt-3 not-italic leading-relaxed text-stone-700">{site.address}</address>
            </div>
          )}
          {site.hours.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 font-bold text-stone-900">
                <ClockIcon className="h-4 w-4 text-orange-700" />
                Hours
              </h2>
              <HoursList hours={site.hours} className="mt-3 text-sm text-stone-700" />
            </div>
          )}
        </div>
        <p className="mx-auto mt-10 max-w-7xl px-5 text-sm text-stone-600 sm:px-8">
          © {new Date().getFullYear()} {site.name}
        </p>
      </footer>

      <MobileCallBar phone={site.phone} className="bg-orange-700 text-white" />
    </div>
  );
}
