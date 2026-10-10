// Generates one business through the real pipeline (Places lookup, Claude
// copy, insert) without going through the admin UI. For local design work.
//
//   npx tsx --conditions=react-server --env-file=.env.local scripts/dev-generate.ts "Name" "City" "Phone"
//   npx tsx --conditions=react-server --env-file=.env.local scripts/dev-generate.ts --search "roofer in Denver, CO"
//
// --search takes the first Google Places result for the query and uses its
// own name, city and phone.

import { generateBusiness } from "@/lib/generation/generate";
import { generationDeps, insertBusiness } from "@/lib/generation/runner";

async function fromSearch(query: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("--search needs GOOGLE_PLACES_API_KEY");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.displayName,places.nationalPhoneNumber,places.addressComponents",
    },
    body: JSON.stringify({ textQuery: query, pageSize: 5 }),
  });
  const json = (await res.json()) as {
    places?: {
      displayName?: { text: string };
      nationalPhoneNumber?: string;
      addressComponents?: { longText: string; types: string[] }[];
    }[];
  };
  const place = json.places?.find((p) => p.nationalPhoneNumber && p.displayName);
  if (!place) throw new Error(`No result with a phone number for "${query}"`);
  const city = place.addressComponents?.find((c) => c.types.includes("locality"))?.longText ?? "";
  return { name: place.displayName!.text, city, phone: place.nationalPhoneNumber! };
}

async function main() {
  const args = process.argv.slice(2);
  const input =
    args[0] === "--search" ? await fromSearch(args[1]) : { name: args[0], city: args[1], phone: args[2] };
  console.log(`Generating ${input.name} (${input.city})…`);
  const generated = await generateBusiness(input, generationDeps(input));
  const { id, slug } = await insertBusiness(generated);
  console.log(JSON.stringify({ id, slug, headline: generated.content.headline, template: generated.template }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
