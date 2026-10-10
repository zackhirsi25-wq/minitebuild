import type { BusinessType } from "@/lib/business-type";
import { formatIssues, LIMITS, siteContentSchema, type SiteContent, type Trade } from "@/lib/content/schema";
import { inferSpecialty, serviceKey } from "@/lib/content/services";

/** Everything the copywriter is told about a business. */
export type BusinessFacts = {
  name: string;
  city: string;
  phone: string;
  address: string | null;
  category: string | null;
  trade: Trade;
  /** Defaults to contractor wording when absent. */
  businessType?: BusinessType;
  hours: string[];
  /** Services the owner listed (CSV "services" column). Used as the exact titles. */
  services?: string[];
};

/** Generated copy lists at least this many services unless the owner listed fewer. */
export const MIN_GENERATED_SERVICES = 4;

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Sends the conversation to the model and returns its raw text reply (JSON). */
export type CallModel = (messages: ChatMessage[], system: string) => Promise<string>;

export class CopyValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(
      `Claude's site copy failed validation twice: ${issues.slice(0, 4).join("; ")}${issues.length > 4 ? "; …" : ""}`,
    );
    this.name = "CopyValidationError";
  }
}

export const SYSTEM_PROMPT = `You write the text for one-page websites for local businesses in the United States. Visitors are mostly on phones, deciding whether to call. The site is designed like a studio made it by hand, so the words have to be as sharp as the design.

Voice: plain, confident and specific, the way a good owner talks about their own work. Short sentences. Concrete nouns over adjectives. Sentence case everywhere.

Headline: at most 8 words. Say something specific to this business: what it does, and where or for whom. Name the city or a real detail of the work. It should only make sense for this kind of business in this place, never for any business anywhere. No question headlines, no puns, no exclamation marks. Good: "Roofs built for Denver hail." Bad: "Your trusted roofing partner."

Never use these or anything like them: trusted partner, quality you can count on, second to none, look no further, one-stop shop, we've got you covered, your satisfaction, top-notch, unmatched, best in town, family owned (unless given), passion for excellence, elevate, seamless, state of the art, nestled.

Buttons say exactly what happens when tapped. The call-to-action button dials the phone, so its label is "Call now" or "Call for a quote".

How it works: three steps a customer goes through, starting with getting in touch. Describe only what any customer of this kind of business does (call, describe what they need, a visit or appointment, the work). Never promise prices, free estimates, timings or response times.

Only state facts you were given. Never invent years in business, license or insurance numbers, awards, ratings, reviews, testimonials or review quotes, prices, guarantees or warranties, team size or number of employees, team names, certifications, or promises about results, response times or cleanup. Where a detail would help (licensing, estimates, timelines), describe it in general terms the owner can confirm, for example "Ask us about licensing and insurance when you call."

Output plain text only: no HTML, no Markdown, no emoji, no square-bracket placeholders. Respect every length limit in the schema.`;

const BUSINESS_DESCRIPTIONS: Record<BusinessType, string> = {
  contractor: "a contractor or home-services trade",
  restaurant: "a restaurant, cafe or food business",
  salon: "a salon, barber or beauty business",
  clinic: "a health or medical clinic",
  "real-estate": "a real estate business",
  shop: "a local shop",
  professional: "a professional services firm",
};

function tradeLabel(facts: BusinessFacts): string {
  if (facts.businessType && facts.businessType !== "contractor") return BUSINESS_DESCRIPTIONS[facts.businessType];
  return facts.trade === "remodeling" ? "home remodeling" : "general contracting";
}

export function buildUserPrompt(facts: BusinessFacts): string {
  const lines = [
    `Write the website copy for this business.`,
    ``,
    `Business name: ${facts.name}`,
    `City: ${facts.city}`,
    `Phone: ${facts.phone}`,
    `Kind of business: ${tradeLabel(facts)}`,
  ];
  if (facts.category) lines.push(`Google category: ${facts.category}`);
  if (facts.address) lines.push(`Address: ${facts.address}`);
  if (facts.hours.length) lines.push(`Hours: ${facts.hours.join("; ")}`);
  lines.push(``, servicesInstruction(facts));
  lines.push(
    `Service areas: start with ${facts.city}, then nearby towns and neighborhoods a business there would realistically serve.`,
    `The call-to-action button calls ${facts.phone}.`,
  );
  return lines.join("\n");
}

function servicesInstruction(facts: BusinessFacts): string {
  if (facts.businessType && facts.businessType !== "contractor" && !facts.services?.length) {
    return `Services: list ${MIN_GENERATED_SERVICES} to 6 things ${tradeLabel(facts)} like this one offers, guided by the Google category. Keep them specific (for a barber: "Skin fades", not "Hair services").`;
  }
  if (facts.services?.length) {
    return [
      `Services: the owner lists exactly these: ${facts.services.join("; ")}.`,
      `Use them as the service titles, in this order, with a description for each. Do not add, drop or rename services (fixing capitalization is fine).`,
    ].join(" ");
  }
  const specialty = inferSpecialty(facts.name, facts.category);
  if (specialty) {
    return [
      `Services: the business name and Google category point to ${specialty.label}.`,
      `List ${MIN_GENERATED_SERVICES} to 6 ${specialty.label} services only. Do not list unrelated work (for example kitchens or additions for a roofer).`,
    ].join(" ");
  }
  return `Services: nothing in the name or category points to a specialty, so list ${MIN_GENERATED_SERVICES} to 6 common ${tradeLabel(facts)} services.`;
}

/** Stock phrases the prompt bans; checked in headlines, sublines and the closing section. */
const CLICHES =
  /\btrusted (?:local )?partner|\bquality you can (?:count|rely|trust)|\bsecond to none|\blook no further|\bone[- ]stop[- ]shop|\b(?:we'?ve|we have) got you covered|\btop[- ]notch|\bunmatched|\bbest in (?:town|the business)|\bpassion for excellence|\belevate|\bseamless|\bstate[- ]of[- ]the[- ]art|\bnestled/i;

/**
 * Wording that can only be an invented fact: the facts we send never include
 * years in business, license numbers, awards, team size, guarantees or reviews.
 */
const INVENTED_CLAIMS: [RegExp, string][] = [
  [
    /\b\d+\+?\s*(?:years?|yrs?)\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty)\s+years?\b|\bsince\s+(?:19|20)\d\d\b/i,
    "years in business",
  ],
  [/\blicen[cs]e\s*(?:no\.?|number|#)|\b(?:lic|license|licence)\s*#\s*\w/i, "a license number"],
  [/\baward|\bcertified\b|\baccredit|\bbbb\b|\ba\+ rat/i, "awards or certifications"],
  [/\b\d+\s+(?:employees|crew members|craftsmen|carpenters|team members|people)\b|\bteam of\s+\d+/i, "team size"],
  [/\bguarantee|\bwarrant(?:y|ies|ied)\b|\b100%\s+satisf|\bsatisfaction\b/i, "a guarantee or warranty"],
  [
    /[“"][^”"]{12,}[”"]|\b\d(?:\.\d)?\s*stars?\b|\b5-star\b|\b(?:customer|client|online|google|yelp|our|great|glowing)\s+reviews?\b|\btestimonial/i,
    "reviews or quotes",
  ],
];

/** Problems found in otherwise valid copy, as validation lines sent back to the model. */
export function contentIssues(content: SiteContent, facts: BusinessFacts): string[] {
  const issues: string[] = [];
  if (facts.services?.length) {
    const want = facts.services.map(serviceKey);
    const got = content.services.map((s) => serviceKey(s.title));
    if (want.length !== got.length || want.some((key, i) => key !== got[i])) {
      issues.push(`services: use exactly these titles in this order: ${facts.services.join("; ")}`);
    }
  } else if (content.services.length < MIN_GENERATED_SERVICES) {
    issues.push(`services: list at least ${MIN_GENERATED_SERVICES} services`);
  }

  const words = content.headline.trim().split(/\s+/).length;
  if (words > LIMITS.headlineWords) {
    issues.push(`headline: has ${words} words; use at most ${LIMITS.headlineWords}`);
  }
  for (const [path, value] of [
    ["headline", content.headline],
    ["subheadline", content.subheadline],
    ["cta.heading", content.cta.heading],
    ["cta.body", content.cta.body],
  ] as const) {
    const hit = value.match(CLICHES);
    if (hit) issues.push(`${path}: "${hit[0]}" is a stock phrase. Say something specific to this business instead.`);
  }

  const texts: [string, string][] = [
    ["headline", content.headline],
    ["subheadline", content.subheadline],
    ["about", content.about],
    ...content.services.flatMap((s, i): [string, string][] => [
      [`services[${i}].title`, s.title],
      [`services[${i}].description`, s.description],
    ]),
    ...content.faq.flatMap((f, i): [string, string][] => [
      [`faq[${i}].question`, f.question],
      [`faq[${i}].answer`, f.answer],
    ]),
    ["cta.heading", content.cta.heading],
    ["cta.body", content.cta.body],
    ...(content.process ?? []).flatMap((p, i): [string, string][] => [
      [`process[${i}].title`, p.title],
      [`process[${i}].body`, p.body],
    ]),
  ];
  // The business's own name ("5 Star Roofing") and the owner's services are facts.
  const given = [facts.name, ...(facts.services ?? [])].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const [path, value] of texts) {
    const checked = given.reduce((text, fact) => text.split(fact).join(" "), value);
    for (const [pattern, what] of INVENTED_CLAIMS) {
      const hit = checked.match(pattern);
      if (hit) issues.push(`${path}: mentions ${what} ("${hit[0]}"), which was not in the facts. Remove it.`);
    }
  }
  return issues;
}

function parseJson(raw: string): unknown {
  // Structured outputs return bare JSON; tolerate a stray code fence anyway.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function validate(
  raw: string,
  facts: BusinessFacts,
): { ok: true; content: SiteContent } | { ok: false; issues: string[] } {
  let json: unknown;
  try {
    json = parseJson(raw);
  } catch {
    return { ok: false, issues: ["The reply was not valid JSON."] };
  }
  const result = siteContentSchema.safeParse(json);
  if (!result.success) return { ok: false, issues: formatIssues(result.error) };
  const issues = contentIssues(result.data, facts);
  return issues.length ? { ok: false, issues } : { ok: true, content: result.data };
}

/**
 * Asks the model for site copy and validates it. On failure the validation
 * errors are sent back once and the model gets a second try.
 */
export async function generateSiteContent(facts: BusinessFacts, callModel: CallModel): Promise<SiteContent> {
  const messages: ChatMessage[] = [{ role: "user", content: buildUserPrompt(facts) }];

  const first = await callModel(messages, SYSTEM_PROMPT);
  const firstResult = validate(first, facts);
  if (firstResult.ok) return firstResult.content;

  messages.push(
    { role: "assistant", content: first },
    {
      role: "user",
      content: [
        "That copy did not pass validation:",
        ...firstResult.issues.map((issue) => `- ${issue}`),
        "",
        "Return the complete corrected JSON, fixing every item above and keeping everything else.",
      ].join("\n"),
    },
  );

  const second = await callModel(messages, SYSTEM_PROMPT);
  const secondResult = validate(second, facts);
  if (secondResult.ok) return secondResult.content;
  throw new CopyValidationError(secondResult.issues);
}
