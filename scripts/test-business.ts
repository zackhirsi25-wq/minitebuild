// Creates, or resets, a clearly fictional business for testing checkout:
//   npx tsx --conditions=react-server --env-file=.env.local scripts/test-business.ts
// (or: npm run test-business)
//
// Its preview is /p/minitebuild-test. Running the script again deletes the old
// record (with its subscriptions and policy acceptances) and makes a fresh
// one, so "Continue to payment" can be pressed any number of times without
// touching a real business.

import { demoSite } from "@/demo";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const TEST_SLUG = "minitebuild-test";

async function main() {
  const db = supabaseAdmin();
  await db.from("businesses").delete().eq("slug", TEST_SLUG);

  const demo = demoSite("contractor", "cinematic");
  const name = "Minitebuild Test Business";
  const content = {
    ...demo.content,
    about:
      "This is a test business for trying Minitebuild's checkout. It is not a real company, and nothing here describes real work.\n\nUse it to press Go live and Continue to payment as often as you like.",
    cta: { ...demo.content.cta, body: "This is a test site. Calling the number does nothing." },
  };
  const { data, error } = await db
    .from("businesses")
    .insert({
      slug: TEST_SLUG,
      template: "cinematic",
      trade: "general_contractor",
      input_name: name,
      input_city: "Denver",
      input_phone: "(303) 555-0100",
      name,
      city: "Denver",
      phone: "(303) 555-0100",
      address: null,
      hours: demo.hours,
      category: "Roofing contractor",
      content,
      tags: ["unverified"],
      notes: "Test record for checkout. Safe to reset with npm run test-business.",
    })
    .select("id, slug")
    .single();
  if (error) throw new Error(`Could not create the test business: ${error.message}`);
  console.log(`Test business ready: /p/${data.slug} (id ${data.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
