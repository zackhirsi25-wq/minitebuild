import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brandFont } from "@/components/brand-font";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatPrice, PLAN_IDS, product, type PlanId } from "@/config/product";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fireStubEvent } from "./actions";

export const metadata: Metadata = { title: "Test payment", robots: { index: false } };

// Development only: stands in for the provider's hosted checkout page.

export default async function StubPaymentPage({ searchParams }: PageProps<"/billing/stub">) {
  if (env.isProduction) notFound();
  const { business: businessId, plan: planParam } = await searchParams;
  const plan = (PLAN_IDS.includes(planParam as PlanId) ? planParam : "monthly") as PlanId;
  if (typeof businessId !== "string" || !/^[0-9a-f-]{36}$/.test(businessId)) notFound();

  const { data: business } = await supabaseAdmin()
    .from("businesses")
    .select("id, name, status")
    .eq("id", businessId)
    .maybeSingle();
  if (!business) notFound();
  const { price, label, short } = product.plans[plan];

  return (
    <main className={`${brandFont.className} min-h-dvh bg-slate-100 px-4 py-10 text-slate-900 sm:py-16`}>
      <div className="mx-auto max-w-md">
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Test mode.</strong> This page stands in for the payment provider. No card is charged.
        </p>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">{product.name} · {label} plan</p>
          <h1 className="mt-1 text-2xl font-bold">{business.name}</h1>
          <p className="mt-4 text-4xl font-bold">
            {formatPrice(price)}
            <span className="text-lg font-medium text-slate-500">/{short}</span>
          </p>
          <div className="mt-6 space-y-3" aria-hidden="true">
            <div className="rounded-lg border border-slate-300 px-3 py-3 text-slate-500">4242 4242 4242 4242</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-300 px-3 py-3 text-slate-500">12 / 34</div>
              <div className="rounded-lg border border-slate-300 px-3 py-3 text-slate-500">123</div>
            </div>
          </div>
          <form action={fireStubEvent} className="mt-6 space-y-3">
            <input type="hidden" name="businessId" value={business.id} />
            <input type="hidden" name="plan" value={plan} />
            <SubmitButton name="type" value="payment_succeeded" className="w-full text-lg" pendingLabel="Processing…">
              Pay {formatPrice(price)}
            </SubmitButton>
            <SubmitButton name="type" value="payment_failed" variant="secondary" className="w-full">
              Simulate a failed payment
            </SubmitButton>
            <SubmitButton name="type" value="subscription_canceled" variant="secondary" className="w-full">
              Simulate a cancellation
            </SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
