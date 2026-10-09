/** The subset of a Google Places (New) result we request and store. */
export type PlaceResult = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  addressComponents?: { longText: string; shortText?: string; types: string[] }[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  primaryTypeDisplayName?: { text: string };
  websiteUri?: string;
};

export interface PlacesClient {
  readonly mode: "live" | "fixture";
  searchText(query: string): Promise<PlaceResult[]>;
}

/** What we keep from a matched place. */
export type PlaceDetails = {
  placeId: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  hours: string[];
  category: string | null;
  websiteUrl: string | null;
};

export type PlaceMatch =
  | { found: true; matchedBy: "phone" | "city"; place: PlaceDetails }
  | { found: false };
