import type { BusinessType } from "@/lib/business-type";
import type { PublicSite } from "@/lib/sites/public";
import { MORE_DEMOS } from "./more";

// Invented demo businesses for the template gallery and home page showcase.
// Shown only on Minitebuild's own pages, always labelled as a demo. Phone
// numbers use the 555-01xx range reserved for fiction; addresses are omitted.

type Demo = Omit<PublicSite, "slug" | "template" | "status" | "updatedAt" | "images" | "palette">;

const contractor: Demo = {
  name: "Ridgeline Roofing",
  city: "Denver",
  phone: "(303) 555-0142",
  address: null,
  hours: [
    "Monday: 7:00 AM – 6:00 PM",
    "Tuesday: 7:00 AM – 6:00 PM",
    "Wednesday: 7:00 AM – 6:00 PM",
    "Thursday: 7:00 AM – 6:00 PM",
    "Friday: 7:00 AM – 6:00 PM",
    "Saturday: 8:00 AM – 12:00 PM",
    "Sunday: Closed",
  ],
  category: "Roofing contractor",
  trade: "general_contractor",
  content: {
    headline: "Roofs built for Denver hail",
    subheadline:
      "Repairs, full replacements and storm damage for homes across the Front Range. Call and talk to a roofer, not a call centre.",
    services: [
      {
        title: "Roof replacement",
        description:
          "Tear-off and new roof when the old one has reached the end of its life, with materials chosen for Colorado weather.",
      },
      {
        title: "Storm and hail repair",
        description:
          "Dented, cracked and missing shingles found and fixed after a storm, before a small leak becomes a ceiling stain.",
      },
      {
        title: "Leak repair",
        description:
          "We trace water back to where it gets in, around chimneys, valleys, skylights and vents, and fix the source.",
      },
      {
        title: "Roof inspections",
        description:
          "A close look at shingles, flashing and ventilation, useful before buying a home or after a rough season.",
      },
    ],
    about:
      "Ridgeline Roofing works on homes in Denver and the towns around it. Every job starts on the roof, not on the phone: we look at what is there, show you what we find and explain the options in plain words.\n\nWhether it is a few lifted shingles or a full replacement, you know what is happening and when. Ask us about licensing and insurance when you call.",
    serviceAreas: ["Denver", "Aurora", "Lakewood", "Englewood", "Littleton", "Arvada", "Wheat Ridge", "Centennial"],
    faq: [
      {
        question: "How do I know if I need a repair or a new roof?",
        answer:
          "We look at the age of the roof, how widespread the damage is and the decking underneath, then walk you through both options before you decide.",
      },
      {
        question: "Do you work on hail damage?",
        answer: "Yes. Call after a storm and we will check the roof, gutters and vents and tell you what we find.",
      },
      {
        question: "Are you licensed and insured?",
        answer:
          "Ask us about licensing and insurance when you call. We are happy to share the details before any work starts.",
      },
      {
        question: "Which areas do you cover?",
        answer:
          "Denver and the surrounding towns. If you are not sure whether you are in our area, give us a call and ask.",
      },
    ],
    cta: {
      heading: "Got a roof question in Denver?",
      body: "Call Ridgeline Roofing and talk it through with a roofer.",
      buttonLabel: "Call now",
    },
    process: [
      { title: "Call us", body: "Tell us what you are seeing: a leak, storm damage or a roof that is getting old." },
      {
        title: "We look at the roof",
        body: "We set a time to come out, inspect the roof and walk you through what we find.",
      },
      { title: "We do the work", body: "Once you decide how to go ahead, we schedule the job and get it done." },
    ],
  },
};

const DEMOS: Partial<Record<BusinessType, Demo>> = { contractor, ...MORE_DEMOS };

/** A demo site for a business type, shaped like a real one so templates render it unchanged. */
export function demoSite(type: BusinessType, templateId: string): PublicSite {
  const demo = DEMOS[type] ?? contractor;
  return {
    ...demo,
    slug: `demo-${type}`,
    template: templateId,
    palette: null,
    status: "preview",
    images: {},
    updatedAt: new Date(0).toISOString(),
  };
}

export function hasDemo(type: BusinessType): boolean {
  return type in DEMOS;
}
