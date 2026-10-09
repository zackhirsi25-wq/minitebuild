import { z } from "zod";
import { parsePhone } from "./phone";
import { MAX_INPUT_SERVICES } from "./services";

// ---------------------------------------------------------------------------
// Text rules shared by every copy field
// ---------------------------------------------------------------------------

/** Anything that looks like an HTML/XML tag, comment or doctype. */
const HTML_TAG = /<\s*[a-zA-Z/!?][^>]*>?/;
/** Template leftovers such as "[Your City]", "{{name}}" or lorem ipsum. */
const PLACEHOLDER = /\[[^\]]*\]|\{\{|\}\}|lorem ipsum|\bTODO\b|\bTBD\b|\bXXX\b/i;

export function containsHtml(value: string): boolean {
  return HTML_TAG.test(value);
}

export function containsPlaceholder(value: string): boolean {
  return PLACEHOLDER.test(value);
}

function text(min: number, max: number, opts: { multiline?: boolean } = {}) {
  let schema = z
    .string()
    .trim()
    .min(min, { message: `must be at least ${min} characters` })
    .max(max, { message: `must be at most ${max} characters` })
    .refine((v) => !containsHtml(v), { message: "must be plain text without HTML tags" })
    .refine((v) => !containsPlaceholder(v), { message: "contains placeholder text" });
  if (!opts.multiline) {
    schema = schema.refine((v) => !/[\r\n]/.test(v), { message: "must be a single line" });
  }
  return schema;
}

// ---------------------------------------------------------------------------
// Site copy
// ---------------------------------------------------------------------------

export const LIMITS = {
  headline: [10, 70],
  subheadline: [30, 180],
  serviceTitle: [3, 40],
  serviceDescription: [30, 220],
  // Generated copy has at least 4 (checked in generateSiteContent) unless the
  // owner listed fewer; the admin can trim down to 1.
  services: [1, 6],
  about: [150, 1000],
  serviceArea: [2, 40],
  serviceAreas: [3, 12],
  faqQuestion: [10, 120],
  faqAnswer: [30, 420],
  faq: [4, 5],
  ctaHeading: [10, 70],
  ctaBody: [20, 200],
  ctaButton: [4, 28],
} as const;

export const serviceSchema = z
  .object({
    title: text(...LIMITS.serviceTitle),
    description: text(...LIMITS.serviceDescription),
  })
  .strict();

export const faqSchema = z
  .object({
    question: text(...LIMITS.faqQuestion),
    answer: text(...LIMITS.faqAnswer),
  })
  .strict();

export const siteContentSchema = z
  .object({
    headline: text(...LIMITS.headline),
    subheadline: text(...LIMITS.subheadline),
    services: z
      .array(serviceSchema)
      .min(LIMITS.services[0], { message: `needs ${LIMITS.services[0]} to ${LIMITS.services[1]} services` })
      .max(LIMITS.services[1], { message: `needs ${LIMITS.services[0]} to ${LIMITS.services[1]} services` }),
    about: text(...LIMITS.about, { multiline: true }),
    serviceAreas: z
      .array(text(...LIMITS.serviceArea))
      .min(LIMITS.serviceAreas[0], { message: `needs at least ${LIMITS.serviceAreas[0]} service areas` })
      .max(LIMITS.serviceAreas[1], { message: `allows at most ${LIMITS.serviceAreas[1]} service areas` }),
    faq: z
      .array(faqSchema)
      .min(LIMITS.faq[0], { message: `needs ${LIMITS.faq[0]} to ${LIMITS.faq[1]} questions` })
      .max(LIMITS.faq[1], { message: `needs ${LIMITS.faq[0]} to ${LIMITS.faq[1]} questions` }),
    cta: z
      .object({
        heading: text(...LIMITS.ctaHeading),
        body: text(...LIMITS.ctaBody),
        buttonLabel: text(...LIMITS.ctaButton),
      })
      .strict(),
  })
  .strict();

export type SiteContent = z.infer<typeof siteContentSchema>;

/**
 * JSON Schema sent to Claude as the structured-output format. It fixes the
 * shape; lengths are given as descriptions because structured outputs do not
 * enforce string or array length. siteContentSchema enforces them afterwards.
 */
export const siteContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "subheadline", "services", "about", "serviceAreas", "faq", "cta"],
  properties: {
    headline: { type: "string", description: "Hero headline, 10-70 characters, one line." },
    subheadline: { type: "string", description: "Supporting sentence under the headline, 30-180 characters." },
    services: {
      type: "array",
      description: "The services the business offers. How many and which ones are given in the prompt.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string", description: "Service name, 3-40 characters." },
          description: { type: "string", description: "One or two sentences, 30-220 characters." },
        },
      },
    },
    about: {
      type: "string",
      description: "About the business, 150-1000 characters. Paragraphs separated by a blank line.",
    },
    serviceAreas: {
      type: "array",
      description: "3 to 12 towns or neighborhoods served, starting with the business's own city.",
      items: { type: "string", description: "Place name, 2-40 characters." },
    },
    faq: {
      type: "array",
      description: "4 or 5 questions customers ask before hiring.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer"],
        properties: {
          question: { type: "string", description: "10-120 characters." },
          answer: { type: "string", description: "30-420 characters." },
        },
      },
    },
    cta: {
      type: "object",
      additionalProperties: false,
      required: ["heading", "body", "buttonLabel"],
      properties: {
        heading: { type: "string", description: "Closing call-to-action heading, 10-70 characters." },
        body: { type: "string", description: "One sentence, 20-200 characters." },
        buttonLabel: { type: "string", description: "Call button text, 4-28 characters, e.g. 'Call for a quote'." },
      },
    },
  },
} as const;

/** Turns Zod issues into lines like "services[2].description: must be at most 220 characters". */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path
      .map((part, i) => (typeof part === "number" ? `[${part}]` : i === 0 ? String(part) : `.${String(part)}`))
      .join("");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

// ---------------------------------------------------------------------------
// Business input (single entry or a CSV row)
// ---------------------------------------------------------------------------

export const businessInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Business name is empty" })
    .max(120, { message: "Business name is longer than 120 characters" }),
  city: z
    .string()
    .trim()
    .min(1, { message: "City is empty" })
    .max(80, { message: "City is longer than 80 characters" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Phone number is empty" })
    .refine((v) => v === "" || parsePhone(v) !== null, { message: "Phone number doesn't look valid" }),
  /** Optional list from the CSV "services" column. Used as the exact service titles. */
  services: z
    .array(
      z
        .string()
        .trim()
        .min(LIMITS.serviceTitle[0], { message: `Each service needs at least ${LIMITS.serviceTitle[0]} characters` })
        .max(LIMITS.serviceTitle[1], { message: `Each service must be ${LIMITS.serviceTitle[1]} characters or fewer` }),
    )
    .max(MAX_INPUT_SERVICES, { message: `List at most ${MAX_INPUT_SERVICES} services` })
    .optional(),
});

export type BusinessInput = z.infer<typeof businessInputSchema>;

// ---------------------------------------------------------------------------
// Tags, statuses, templates
// ---------------------------------------------------------------------------

export const TAGS = ["called", "texted", "paid", "has website", "unverified"] as const;
export type Tag = (typeof TAGS)[number];

export const STATUSES = ["preview", "live", "paused"] as const;
export type BusinessStatus = (typeof STATUSES)[number];

export const TEMPLATES = ["bold", "classic", "split"] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export const TRADES = ["general_contractor", "remodeling"] as const;
export type Trade = (typeof TRADES)[number];

export const IMAGE_SLOTS = ["hero", "about"] as const;
export type ImageSlot = (typeof IMAGE_SLOTS)[number];

export const imageOverridesSchema = z
  .object({
    hero: z.object({ path: z.string(), alt: z.string() }).optional(),
    about: z.object({ path: z.string(), alt: z.string() }).optional(),
  })
  .catch({});

export type ImageOverrides = z.infer<typeof imageOverridesSchema>;
