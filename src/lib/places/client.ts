import type { PlaceResult, PlacesClient } from "./types";
import type { BusinessInput } from "@/lib/content/schema";
import { fixturePlacesFor } from "./fixtures";

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

/**
 * Fields requested from Google. Photos and reviews are deliberately absent:
 * we never request or store Google photos or review text.
 */
export const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.primaryTypeDisplayName",
  "places.websiteUri",
].join(",");

export class PlacesApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PlacesApiError";
  }
}

/**
 * Google Places client, or a fixture client when no API key is set. The
 * fixture needs the business being looked up so it can answer like Google.
 */
export function createPlacesClient(apiKey: string | undefined, input: BusinessInput): PlacesClient {
  if (!apiKey) return fixturePlacesFor(input);

  return {
    mode: "live",
    async searchText(query: string): Promise<PlaceResult[]> {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": PLACES_FIELD_MASK,
        },
        body: JSON.stringify({ textQuery: query, pageSize: 10, languageCode: "en" }),
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      });
      if (!response.ok) {
        let detail = "";
        try {
          const body = (await response.json()) as { error?: { message?: string } };
          detail = body.error?.message ?? "";
        } catch {
          // ignore unreadable error bodies
        }
        throw new PlacesApiError(
          `Google Places lookup failed (HTTP ${response.status})${detail ? `: ${detail}` : ""}`,
          response.status,
        );
      }
      const body = (await response.json()) as { places?: PlaceResult[] };
      return body.places ?? [];
    },
  };
}
