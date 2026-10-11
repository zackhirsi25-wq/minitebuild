"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PLAN_IDS, type PlanId } from "@/config/product";
import { getBillingProvider } from "@/lib/billing";
import { requestOrigin } from "@/lib/request-origin";
import { ipKey } from "@/lib/build/rate-limit";
import { LEGAL_DOCS } from "@/lib/legal";
import { supabaseAdmin } from "@/lib/supabase/admin";

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

async function recordAcceptance(businessId: string, plan: PlanId): Promise<boolean> {
  const documents = Object.fromEntries(Object.entries(LEGAL_DOCS).map(([id, text]) => [id, sha256(text)]));
  const { error } = await supabaseAdmin()
    .from("terms_acceptances")
    .insert({
      business_id: businessId,
      plan,
      documents,
      ip_hash: await ipKey(),
      user_agent: (await headers()).get("user-agent")?.slice(0, 300) ?? null,
    });
  if (error) console.error("Could not record policy acceptance", error.message);
  return !error;
}

export async function startCheckout(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const plan = String(formData.get("plan") ?? "") as PlanId;
  if (!PLAN_IDS.includes(plan)) redirect(`/p/${slug}/checkout?error=plan`);

  const { data: business } = await supabaseAdmin()
    .from("businesses")
    .select("id, slug, name, status")
    .eq("slug", slug)
    .maybeSingle();
  if (!business) redirect("/");
  if (business.status === "live") redirect(`/p/${slug}`);

  // Pressing the button is agreement to the policies shown above it; record
  // which version of each was shown, and from where. No record, no checkout.
  if (!(await recordAcceptance(business.id, plan))) redirect(`/p/${slug}/checkout?error=consent`);

  const result = await getBillingProvider().createCheckout({
    businessId: business.id,
    slug: business.slug,
    businessName: business.name,
    plan,
    origin: await requestOrigin(),
  });
  if (result.kind === "redirect") redirect(result.url);
  redirect(`/p/${slug}/checkout`);
}
