import type { Metadata } from "next";
import { telHref } from "@/lib/content/phone";
import type { PublicSite } from "./public";

/** "<Name> | <Category> in <City>", trimmed to ~60 characters. */
export function siteTitle(site: PublicSite): string {
  const what = site.trade === "remodeling" ? "Remodeling" : "General Contractor";
  const full = `${site.name} | ${what} in ${site.city}`;
  return full.length <= 65 ? full : `${site.name} | ${site.city}`;
}

export function siteDescription(site: PublicSite): string {
  const withPhone = `${site.content.subheadline} Call ${site.phone}.`;
  if (withPhone.length <= 160) return withPhone;
  const sub = site.content.subheadline;
  return sub.length <= 160 ? sub : `${sub.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

export function siteMetadata(site: PublicSite, opts: { url: string; index: boolean }): Metadata {
  const title = siteTitle(site);
  const description = siteDescription(site);
  return {
    title,
    description,
    alternates: { canonical: opts.url },
    robots: opts.index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { title, description, url: opts.url, siteName: site.name, type: "website", locale: "en_US" },
    formatDetection: { telephone: true },
  };
}

const DAYS: Record<string, string> = {
  monday: "Mo",
  tuesday: "Tu",
  wednesday: "We",
  thursday: "Th",
  friday: "Fr",
  saturday: "Sa",
  sunday: "Su",
};

function to24h(time: string): string | null {
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/i);
  if (!m) return null;
  let hour = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${m[2] ?? "00"}`;
}

/** Google's "Monday: 8:00 AM – 5:00 PM" to schema.org "Mo 08:00-17:00". Unparseable lines are skipped. */
export function openingHoursSpec(hours: string[]): string[] {
  const out: string[] = [];
  for (const line of hours) {
    const [dayRaw, rangeRaw] = line.split(/:\s(.+)/);
    const day = DAYS[dayRaw?.trim().toLowerCase() ?? ""];
    if (!day || !rangeRaw) continue;
    for (const range of rangeRaw.split(",")) {
      const [open, close] = range.split(/\s*[–-]\s*/);
      const a = open && to24h(open.replace(/ /g, " "));
      const b = close && to24h(close.replace(/ /g, " "));
      if (a && b) out.push(`${day} ${a}-${b}`);
    }
  }
  return out;
}

export function localBusinessJsonLd(site: PublicSite, url: string, imageUrl: string) {
  const street = site.address?.split(",")[0]?.trim();
  return {
    "@context": "https://schema.org",
    "@type": site.trade === "remodeling" ? "HomeAndConstructionBusiness" : "GeneralContractor",
    name: site.name,
    url,
    telephone: telHref(site.phone).replace("tel:", ""),
    image: imageUrl,
    description: site.content.subheadline,
    address: {
      "@type": "PostalAddress",
      ...(street ? { streetAddress: street } : {}),
      addressLocality: site.city,
      addressCountry: "US",
    },
    areaServed: site.content.serviceAreas.map((name) => ({ "@type": "Place", name })),
    ...(site.hours.length ? { openingHours: openingHoursSpec(site.hours) } : {}),
  };
}
