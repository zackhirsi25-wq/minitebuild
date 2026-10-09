import { describe, expect, it } from "vitest";
import { PLACES_FIELD_MASK } from "@/lib/places/client";
import { findBusiness } from "@/lib/places/match";
import type { PlaceResult, PlacesClient } from "@/lib/places/types";

const place = (id: string, phone: string, city: string, extra: Partial<PlaceResult> = {}): PlaceResult => ({
  id,
  displayName: { text: id },
  formattedAddress: `1 Main St, ${city}, USA`,
  addressComponents: [{ longText: city, types: ["locality"] }],
  nationalPhoneNumber: phone,
  ...extra,
});

function client(responses: Record<string, PlaceResult[]>): PlacesClient & { queries: string[] } {
  const queries: string[] = [];
  return {
    mode: "fixture",
    queries,
    async searchText(q) {
      queries.push(q);
      return responses[q] ?? [];
    },
  };
}

const input = { name: "Acme Builders", city: "Dallas", phone: "(214) 555-0100" };

describe("findBusiness", () => {
  it("prefers a phone match over the top result", async () => {
    const c = client({
      "Acme Builders Dallas": [place("other", "(214) 555-0999", "Dallas"), place("acme", "214-555-0100", "Dallas")],
    });
    const result = await findBusiness(input, c);
    expect(result).toMatchObject({ found: true, matchedBy: "phone", place: { placeId: "acme" } });
    expect(c.queries).toEqual(["Acme Builders Dallas"]);
  });

  it("searches by phone when the name search has no phone match", async () => {
    const c = client({
      "Acme Builders Dallas": [place("other", "(214) 555-0999", "Dallas")],
      "(214) 555-0100": [place("acme", "+1 214-555-0100", "Plano")],
    });
    expect(await findBusiness(input, c)).toMatchObject({ matchedBy: "phone", place: { placeId: "acme" } });
  });

  it("falls back to the top result in the city", async () => {
    const c = client({
      "Acme Builders Dallas": [place("elsewhere", "(512) 555-0000", "Austin"), place("in-city", "(214) 555-0999", "Dallas")],
    });
    expect(await findBusiness(input, c)).toMatchObject({ matchedBy: "city", place: { placeId: "in-city" } });
  });

  it("reports not found rather than guessing outside the city", async () => {
    const c = client({ "Acme Builders Dallas": [place("elsewhere", "(512) 555-0000", "Austin")] });
    expect(await findBusiness(input, c)).toEqual({ found: false });
  });

  it("keeps the website for the has-website tag", async () => {
    const c = client({
      "Acme Builders Dallas": [place("acme", "214-555-0100", "Dallas", { websiteUri: "https://acme.test" })],
    });
    expect(await findBusiness(input, c)).toMatchObject({ place: { websiteUrl: "https://acme.test" } });
  });

  it("never asks Google for photos or reviews", () => {
    expect(PLACES_FIELD_MASK).not.toMatch(/photo|review/i);
  });
});
