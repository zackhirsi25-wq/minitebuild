import { phoneKey } from "@/lib/content/phone";
import type { BusinessInput } from "@/lib/content/schema";
import type { PlaceDetails, PlaceMatch, PlaceResult, PlacesClient } from "./types";

/**
 * Finds a business in Google Places.
 *   1. Search "name city" and take a result whose phone matches the input.
 *   2. Otherwise search the phone number itself and look for a phone match.
 *   3. Otherwise take the top "name city" result that is in the input city.
 * Returns { found: false } when none of these match.
 */
export async function findBusiness(input: BusinessInput, client: PlacesClient): Promise<PlaceMatch> {
  const wantedPhone = phoneKey(input.phone);
  const byName = await client.searchText(`${input.name} ${input.city}`);

  const phoneHit = (results: PlaceResult[]) =>
    wantedPhone
      ? results.find(
          (r) => phoneKey(r.nationalPhoneNumber) === wantedPhone || phoneKey(r.internationalPhoneNumber) === wantedPhone,
        )
      : undefined;

  let hit = phoneHit(byName);
  if (hit) return { found: true, matchedBy: "phone", place: toDetails(hit) };

  if (wantedPhone) {
    const byPhone = await client.searchText(input.phone);
    hit = phoneHit(byPhone);
    if (hit) return { found: true, matchedBy: "phone", place: toDetails(hit) };
  }

  hit = byName.find((r) => isInCity(r, input.city));
  if (hit) return { found: true, matchedBy: "city", place: toDetails(hit) };

  return { found: false };
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
