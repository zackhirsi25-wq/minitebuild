import { formatIssues, siteContentSchema, type SiteContent, type Trade } from "@/lib/content/schema";

/** Everything the copywriter is told about a business. */
export type BusinessFacts = {
  name: string;
  city: string;
  phone: string;
  address: string | null;
  category: string | null;
  trade: Trade;
  hours: string[];
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Sends the conversation to the model and returns its raw text reply (JSON). */
export type CallModel = (messages: ChatMessage[], system: string) => Promise<string>;

export class CopyValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Claude's site copy failed validation twice: ${issues.slice(0, 4).join("; ")}${issues.length > 4 ? "; …" : ""}`);
    this.name = "CopyValidationError";
  }
}

export const SYSTEM_PROMPT = `You write the text for one-page websites for local trade businesses in the United States. Visitors are homeowners, mostly on phones, deciding whether to call.

Write in plain, confident, specific language a good local contractor would use. Mention the city and the kind of work naturally. Every service, area and answer must be something this business could plausibly offer given its trade.

Only state facts you were given. Do not invent years in business, license or insurance numbers, awards, ratings, reviews, testimonials, prices, warranties, team names or certifications. Where a detail would help (licensing, estimates, timelines), describe it in general terms the owner can confirm, for example "Ask us about licensing and insurance when you call."

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
  lines.push(
    ``,
    `Service areas: start with ${facts.city}, then nearby towns and neighborhoods a business there would realistically serve.`,
    `The call-to-action button calls ${facts.phone}, so its label should invite a phone call.`,
  );
  return lines.join("\n");
}

function parseJson(raw: string): unknown {
  // Structured outputs return bare JSON; tolerate a stray code fence anyway.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function validate(raw: string): { ok: true; content: SiteContent } | { ok: false; issues: string[] } {
  let json: unknown;
  try {
    json = parseJson(raw);
  } catch {
    return { ok: false, issues: ["The reply was not valid JSON."] };
  }
  const result = siteContentSchema.safeParse(json);
  if (result.success) return { ok: true, content: result.data };
  return { ok: false, issues: formatIssues(result.error) };
}

/**
 * Asks the model for site copy and validates it. On failure the validation
 * errors are sent back once and the model gets a second try.
 */
export async function generateSiteContent(facts: BusinessFacts, callModel: CallModel): Promise<SiteContent> {
  const messages: ChatMessage[] = [{ role: "user", content: buildUserPrompt(facts) }];

  const first = await callModel(messages, SYSTEM_PROMPT);
  const firstResult = validate(first);
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
  const secondResult = validate(second);
  if (secondResult.ok) return secondResult.content;
  throw new CopyValidationError(secondResult.issues);
}
