import { phoneKey } from "@/lib/content/phone";
import type { BusinessInput } from "@/lib/content/schema";
import type { PlaceDetails, PlaceMatch, PlaceResult, PlacesClient } from "./types";

/**
 * Finds a business in Google Places.
 *   1. Search "name city" and take a result whose phone matches the input.
 *   2. Otherwise search the phone number itself and look for a phone match.
 *   3. Otherwise take the top "name city" result that is in the input city and
 *      has a matching name (Google returns other businesses for unknown names).
 * Returns { found: false } when none of these match.
 */
export async function findBusiness(input: BusinessInput, client: PlacesClient): Promise<PlaceMatch> {
  const wantedPhone = phoneKey(input.phone);
  const byName = await client.searchText(`${input.name} ${input.city}`);

  const phoneHit = (results: PlaceResult[]) =>
    wantedPhone
      ? results.find(
          (r) =>
            phoneKey(r.nationalPhoneNumber) === wantedPhone || phoneKey(r.internationalPhoneNumber) === wantedPhone,
        )
      : undefined;

  let hit = phoneHit(byName);
  if (hit) return { found: true, matchedBy: "phone", place: toDetails(hit) };

  if (wantedPhone) {
    const byPhone = await client.searchText(input.phone);
    hit = phoneHit(byPhone);
    if (hit) return { found: true, matchedBy: "phone", place: toDetails(hit) };
  }

  hit = byName.find((r) => isInCity(r, input.city) && sameBusinessName(r.displayName?.text ?? "", input.name));
  if (hit) return { found: true, matchedBy: "city", place: toDetails(hit) };

  return { found: false };
}

// Words that say what kind of company it is, not which one.
const GENERIC_NAME_WORDS = new Set(
  (
    "the and of llc inc co corp company ltd group enterprises services service general " +
    "construction contracting contractor contractors builder builders building home homes " +
    "remodeling renovation renovations"
  ).split(" "),
);

function nameWords(name: string): string[] {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

/**
 * Whether a Google result is plausibly the business we were given: at least
 * half of the input's distinctive words appear in the result's name. A name
 * made only of generic words ("General Construction LLC") must match exactly.
 */
export function sameBusinessName(resultName: string, inputName: string): boolean {
  const all = nameWords(inputName);
  const resultWords = new Set(nameWords(resultName));
  const distinctive = all.filter((w) => !GENERIC_NAME_WORDS.has(w));
  if (distinctive.length === 0) return all.join(" ") === [...resultWords].join(" ");
  const shared = distinctive.filter((w) => resultWords.has(w)).length;
  return shared >= Math.ceil(distinctive.length / 2);
}

function sameCity(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\bst\.?\b/g, "saint")
      .replace(/[^a-z0-9]/g, "");
  return norm(a) === norm(b);
}

export function cityOf(result: PlaceResult): string | null {
  const component =
    result.addressComponents?.find((c) => c.types.includes("locality")) ??
    result.addressComponents?.find((c) => c.types.includes("postal_town")) ??
    result.addressComponents?.find((c) => c.types.includes("sublocality"));
  return component?.longText ?? null;
}

function isInCity(result: PlaceResult, city: string): boolean {
  const resultCity = cityOf(result);
  if (resultCity) return sameCity(resultCity, city);
  // No components: fall back to the address text, comma-separated parts.
  return (result.formattedAddress ?? "").split(",").some((part) => sameCity(part, city));
}

export function toDetails(result: PlaceResult): PlaceDetails {
  return {
    placeId: result.id,
    name: result.displayName?.text?.trim() || "",
    address: result.formattedAddress?.trim() || null,
    city: cityOf(result),
    phone: result.nationalPhoneNumber ?? result.internationalPhoneNumber ?? null,
    hours: result.regularOpeningHours?.weekdayDescriptions ?? [],
    category: result.primaryTypeDisplayName?.text ?? null,
    websiteUrl: result.websiteUri ?? null,
  };
}
