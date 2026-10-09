import { parsePhone, phoneKey } from "@/lib/content/phone";
import type { BusinessInput } from "@/lib/content/schema";
import type { PlaceResult, PlacesClient } from "./types";

// Used when GOOGLE_PLACES_API_KEY is not set. Responses follow the Places API
// (New) shape so the matching code runs exactly as it would against Google.
//
// Behaviour:
//   * The named businesses below are returned when the query mentions them
//     or their phone number. "Elite Remodeling" has a website, so it gets
//     tagged "has website".
//   * A business whose name contains "unlisted" is never found, so it is
//     generated from the input alone and tagged "unverified".
//   * Anything else is "found" with a plausible address in the input city
//     and the input phone number.

const known: PlaceResult[] = [
  {
    id: "fixture-elite-remodeling-austin",
    displayName: { text: "Elite Remodeling" },
    formattedAddress: "4410 Burnet Rd, Austin, TX 78756, USA",
    addressComponents: [
      { longText: "4410", types: ["street_number"] },
      { longText: "Burnet Road", shortText: "Burnet Rd", types: ["route"] },
      { longText: "Austin", types: ["locality", "political"] },
      { longText: "Texas", shortText: "TX", types: ["administrative_area_level_1", "political"] },
    ],
    nationalPhoneNumber: "(512) 555-0142",
    internationalPhoneNumber: "+1 512-555-0142",
    regularOpeningHours: {
      weekdayDescriptions: [
        "Monday: 7:30 AM – 5:30 PM",
        "Tuesday: 7:30 AM – 5:30 PM",
        "Wednesday: 7:30 AM – 5:30 PM",
        "Thursday: 7:30 AM – 5:30 PM",
        "Friday: 7:30 AM – 4:00 PM",
        "Saturday: Closed",
        "Sunday: Closed",
      ],
    },
    primaryTypeDisplayName: { text: "Remodeler" },
    websiteUri: "https://www.example.com/elite-remodeling",
  },
  {
    id: "fixture-jj-general-contractor-denver",
    displayName: { text: "JJ General Contractor" },
    formattedAddress: "1550 Larimer St, Denver, CO 80202, USA",
    addressComponents: [
      { longText: "1550", types: ["street_number"] },
      { longText: "Larimer Street", shortText: "Larimer St", types: ["route"] },
      { longText: "Denver", types: ["locality", "political"] },
      { longText: "Colorado", shortText: "CO", types: ["administrative_area_level_1", "political"] },
    ],
    nationalPhoneNumber: "(303) 555-0187",
    internationalPhoneNumber: "+1 303-555-0187",
    regularOpeningHours: {
      weekdayDescriptions: [
        "Monday: 7:00 AM – 6:00 PM",
        "Tuesday: 7:00 AM – 6:00 PM",
        "Wednesday: 7:00 AM – 6:00 PM",
        "Thursday: 7:00 AM – 6:00 PM",
        "Friday: 7:00 AM – 6:00 PM",
        "Saturday: 8:00 AM – 12:00 PM",
        "Sunday: Closed",
      ],
    },
    primaryTypeDisplayName: { text: "General Contractor" },
  },
];

const STREETS = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Elm St", "Pine Rd", "Commerce Blvd", "Industrial Way"];

function hash(value: string): number {
  let h = 2166136261;
  for (const ch of value) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A plausible Google result for any business the fixtures don't know. */
function synthesize(input: BusinessInput): PlaceResult[] {
  const h = hash(`${input.name}|${input.city}`.toLowerCase());
  const number = 100 + (h % 8900);
  const street = STREETS[h % STREETS.length];
  const phone = parsePhone(input.phone);
  const isRemodeler = /remodel|kitchen|bath|renovat/i.test(input.name);
  return [
    {
      id: `fixture-${h.toString(36)}`,
      displayName: { text: input.name.trim() },
      formattedAddress: `${number} ${street}, ${input.city.trim()}, USA`,
      addressComponents: [{ longText: input.city.trim(), types: ["locality", "political"] }],
      nationalPhoneNumber: phone?.display,
      regularOpeningHours: {
        weekdayDescriptions: [
          "Monday: 8:00 AM – 5:00 PM",
          "Tuesday: 8:00 AM – 5:00 PM",
          "Wednesday: 8:00 AM – 5:00 PM",
          "Thursday: 8:00 AM – 5:00 PM",
          "Friday: 8:00 AM – 5:00 PM",
          "Saturday: Closed",
          "Sunday: Closed",
        ],
      },
      primaryTypeDisplayName: { text: isRemodeler ? "Remodeler" : "General Contractor" },
    },
  ];
}

/** Fixture client for one lookup. It answers queries about `input` the way Google would. */
export function fixturePlacesFor(input: BusinessInput): PlacesClient {
  return {
    mode: "fixture",
    async searchText(query: string) {
      const q = query.toLowerCase();
      if (input.name.toLowerCase().includes("unlisted")) return [];

      const queryPhone = parsePhone(query);
      if (queryPhone) {
        const byPhone = known.filter((p) => phoneKey(p.nationalPhoneNumber) === queryPhone.key);
        if (byPhone.length) return byPhone;
        return synthesize(input).filter((p) => phoneKey(p.nationalPhoneNumber) === queryPhone.key);
      }

      const named = known.filter((p) => q.includes(p.displayName!.text.toLowerCase()));
      if (named.length) return named;
      return synthesize(input);
    },
  };
}
