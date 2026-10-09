import { formatIssues, siteContentSchema, type SiteContent, type Trade } from "@/lib/content/schema";
import { inferSpecialty, serviceKey } from "@/lib/content/services";

/** Everything the copywriter is told about a business. */
export type BusinessFacts = {
  name: string;
  city: string;
  phone: string;
  address: string | null;
  category: string | null;
  trade: Trade;
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

export const SYSTEM_PROMPT = `You write the text for one-page websites for local trade businesses in the United States. Visitors are homeowners, mostly on phones, deciding whether to call.

Write in plain, confident, specific language a good local contractor would use. Mention the city and the kind of work naturally. Every service, area and answer must be something this business could plausibly offer given its trade.

Only state facts you were given. Never invent years in business, license or insurance numbers, awards, ratings, reviews, testimonials or review quotes, prices, guarantees or warranties, team size or number of employees, team names, certifications, or promises about results, response times or cleanup. Where a detail would help (licensing, estimates, timelines), describe it in general terms the owner can confirm, for example "Ask us about licensing and insurance when you call."

Output plain text only: no HTML, no Markdown, no emoji, no square-bracket placeholders. Respect every length limit in the schema.`;

function tradeLabel(trade: Trade): string {
  return trade === "remodeling" ? "home remodeling" : "general contracting";
}

export function buildUserPrompt(facts: BusinessFacts): string {
  const lines = [
    `Write the website copy for this business.`,
    ``,
    `Business name: ${facts.name}`,
    `City: ${facts.city}`,
    `Phone: ${facts.phone}`,
    `Trade: ${tradeLabel(facts.trade)}`,
  ];
  if (facts.category) lines.push(`Google category: ${facts.category}`);
  if (facts.address) lines.push(`Address: ${facts.address}`);
  if (facts.hours.length) lines.push(`Hours: ${facts.hours.join("; ")}`);
  lines.push(``, servicesInstruction(facts));
  lines.push(
    `Service areas: start with ${facts.city}, then nearby towns and neighborhoods a business there would realistically serve.`,
    `The call-to-action button calls ${facts.phone}, so its label should invite a phone call.`,
  );
  return lines.join("\n");
}

function servicesInstruction(facts: BusinessFacts): string {
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
  return `Services: nothing in the name or category points to a specialty, so list ${MIN_GENERATED_SERVICES} to 6 common ${tradeLabel(facts.trade)} services.`;
}

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
