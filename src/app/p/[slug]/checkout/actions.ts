"use server";

import { redirect } from "next/navigation";
import { PLAN_IDS, type PlanId } from "@/config/product";
import { getBillingProvider } from "@/lib/billing";
import { requestOrigin } from "@/lib/request-origin";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
