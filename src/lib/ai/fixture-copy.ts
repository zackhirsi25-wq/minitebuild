import type { SiteContent } from "@/lib/content/schema";
import type { BusinessFacts, CallModel } from "./copy";

// Used when ANTHROPIC_API_KEY is not set. Produces copy that passes the same
// schema as Claude's output, written from the business facts, so every other
// part of the pipeline can be exercised without an API key.

const NEARBY_SUFFIXES = ["Downtown", "North", "South", "East", "West", "Heights", "Park"];

function areas(city: string): string[] {
  return [city, ...NEARBY_SUFFIXES.slice(0, 5).map((s) => `${s} ${city}`)].map((a) => a.slice(0, 40));
}

export function fixtureContent(facts: BusinessFacts): SiteContent {
  const { name, city, phone } = facts;
  const remodel = facts.trade === "remodeling";

  const services = remodel
    ? [
        { title: "Kitchen Remodeling", description: `Layouts, cabinets, counters and lighting planned around how your family actually cooks and gathers in ${city}.` },
        { title: "Bathroom Remodeling", description: "Walk-in showers, tile, vanities and ventilation, finished cleanly and built to handle daily use." },
        { title: "Basement Finishing", description: "Turn unused square footage into a family room, office or guest suite with proper framing and egress." },
        { title: "Flooring & Tile", description: "Hardwood, luxury vinyl and tile installed level, tight and ready for years of foot traffic." },
        { title: "Interior Updates", description: "Trim, doors, paint and fixtures that refresh a dated room without a full gut renovation." },
      ]
    : [
        { title: "Home Additions", description: `Extra bedrooms, sunrooms and second stories designed to fit your lot and permitted with ${city}.` },
        { title: "Renovations", description: "Whole-room and whole-home renovations managed from demolition through the final walkthrough." },
        { title: "Decks & Porches", description: "Solid framing, clean railings and durable decking for outdoor space you will actually use." },
        { title: "Roofing & Siding", description: "Repairs and replacements that keep weather out and give the outside of your home a fresh look." },
        { title: "Repairs & Punch Lists", description: "Drywall, doors, framing fixes and the small jobs that pile up, handled in a single visit where possible." },
      ];

  const content: SiteContent = {
    headline: (remodel ? `Remodeling done right in ${city}` : `Trusted contractor in ${city}`).slice(0, 70),
    subheadline: `${name} plans and builds ${remodel ? "kitchens, baths and living spaces" : "additions, renovations and repairs"} for homeowners in ${city} and nearby. Call for a straight answer and a clear quote.`.slice(0, 180),
    services,
    about: [
      `${name} is a ${remodel ? "remodeling" : "general contracting"} company serving homeowners in ${city} and the surrounding area. We handle the planning, the scheduling and the work itself, so you have one team to call from the first walkthrough to the final cleanup.`,
      `Every project starts with a visit to look at the space and talk through what you want. You get a written scope and quote before work begins, and we keep you updated as the job moves along.`,
    ].join("\n\n"),
    serviceAreas: areas(city),
    faq: [
      { question: "How do I get a quote?", answer: `Call ${phone} to set up a visit. We will look at the project, answer your questions and follow up with a written quote.` },
      { question: "How long does a typical project take?", answer: "It depends on the size of the job and material lead times. We give you a realistic schedule before work starts and keep you posted if anything changes." },
      { question: "Are you licensed and insured?", answer: "Ask us about licensing and insurance when you call. We are happy to share the details before you commit to anything." },
      { question: `What areas around ${city} do you serve?`.slice(0, 120), answer: `We work throughout ${city} and nearby communities. If you are not sure whether you are in our area, give us a call and ask.` },
      { question: "Do I need to be home while you work?", answer: "Not always. Many clients give us access and check in at the end of the day. We agree on what works for you before the job begins." },
    ],
    cta: {
      heading: (remodel ? "Ready to start your remodel?" : "Ready to start your project?"),
      body: `Talk to ${name} today about your project in ${city}.`.slice(0, 200),
      buttonLabel: "Call for a quote",
    },
  };
  return content;
}

export const fixtureCaller =
  (facts: BusinessFacts): CallModel =>
  async () =>
    JSON.stringify(fixtureContent(facts));
