import type { SiteContent } from "@/lib/content/schema";

/**
 * "How it works" steps. Sites generated before steps existed get these, which
 * only describe what every customer does and promise nothing.
 */
export function processSteps(content: SiteContent, phone: string) {
  return (
    content.process ?? [
      { title: "Call", body: `Call ${phone} and tell us what you need.` },
      { title: "Talk it through", body: "We go over the details with you and agree on the next steps together." },
      {
        title: "Get it done",
        body: "The work happens on the schedule you agreed to, with a call if anything changes.",
      },
    ]
  );
}

/** Splits text into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
