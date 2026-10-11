import { generateSiteContent, type BusinessFacts, type CallModel } from "@/lib/ai/copy";
import { chooseTemplate } from "@/lib/build/design";
import { inferBusinessType, type BusinessType } from "@/lib/business-type";
import { allTemplates } from "@/templates";
import { parsePhone } from "@/lib/content/phone";
import {
  businessInputSchema,
  type BusinessInput,
  type SiteContent,
  type Tag,
  type TemplateId,
  type Trade,
} from "@/lib/content/schema";
import { findBusiness } from "@/lib/places/match";
import type { PlaceMatch, PlacesClient } from "@/lib/places/types";

/** Everything needed to insert a business, minus the slug. */
export type GeneratedBusiness = {
  input: BusinessInput;
  name: string;
  city: string;
  phone: string;
  address: string | null;
  hours: string[];
  category: string | null;
  websiteUrl: string | null;
  placeId: string | null;
  placesFetchedAt: string;
  trade: Trade;
  template: TemplateId;
  tags: Tag[];
  content: SiteContent;
  match: PlaceMatch;
};

export type GenerateDeps = {
  places: PlacesClient;
  /** Builds the model caller for a business (the fixture caller needs the facts). */
  callModelFor: (facts: BusinessFacts) => CallModel;
  now?: () => Date;
};

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}

export function inferTrade(name: string, category: string | null): Trade {
  return /remodel|renovat|kitchen|bath/i.test(`${name} ${category ?? ""}`) ? "remodeling" : "general_contractor";
}

/** A template designed with the business type in mind, stable for the same name and city. */
export function pickTemplate(seed: string, type: BusinessType): TemplateId {
  return chooseTemplate(allTemplates(), type, seed).id;
}

/** Places details used to refresh a business; shared with "Refresh from Google". */
export function detailsFromMatch(input: BusinessInput, match: PlaceMatch) {
  const phone = parsePhone(input.phone)!;
  if (!match.found) {
    return {
      name: input.name,
      city: input.city,
      phone: phone.display,
      address: null,
      hours: [] as string[],
      category: null,
      websiteUrl: null,
      placeId: null,
    };
  }
  const place = match.place;
  return {
    name: place.name || input.name,
    city: place.city || input.city,
    // Matched by phone: Google's number is the same one. Matched by city: keep
    // the number we were given, which is the one the admin wants called.
    phone:
      match.matchedBy === "phone" && place.phone ? (parsePhone(place.phone)?.display ?? place.phone) : phone.display,
    address: place.address,
    hours: place.hours,
    category: place.category,
    websiteUrl: place.websiteUrl,
    placeId: place.placeId,
  };
}

/**
 * Generates a business from a name, city and phone. Never skips: a business
 * with a website is tagged "has website", one Google can't find is generated
 * from the input alone and tagged "unverified".
 */
export async function generateBusiness(rawInput: BusinessInput, deps: GenerateDeps): Promise<GeneratedBusiness> {
  const parsed = businessInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new InvalidInputError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const input = parsed.data;
  const now = deps.now ?? (() => new Date());

  const match = await findBusiness(input, deps.places);
  const details = detailsFromMatch(input, match);

  const tags: Tag[] = [];
  if (details.websiteUrl) tags.push("has website");
  if (!match.found) tags.push("unverified");

  const trade = inferTrade(details.name, details.category);
  const businessType = inferBusinessType(details.name, details.category);
  const facts: BusinessFacts = {
    name: details.name,
    city: details.city,
    phone: details.phone,
    address: details.address,
    category: details.category,
    trade,
    businessType,
    hours: details.hours,
    services: input.services,
  };
  const content = await generateSiteContent(facts, deps.callModelFor(facts));

  return {
    input,
    ...details,
    placesFetchedAt: now().toISOString(),
    trade,
    template: pickTemplate(`${input.name}|${input.city}`.toLowerCase(), businessType),
    tags,
    content,
    match,
  };
}
