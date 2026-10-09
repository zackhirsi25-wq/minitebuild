import type { Metadata } from "next";
import Link from "next/link";
import { brandFont } from "@/components/brand-font";
import { env } from "@/lib/env";
import { liveSiteUrl } from "@/lib/routing/hostname";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default async function BillingDonePage({ searchParams }: PageProps<"/billing/done">) {
  const { business: businessId, event, ok } = await searchParams;
  const { data: business } =
    typeof businessId === "string" && /^[0-9a-f-]{36}$/.test(businessId)
      ? await supabaseAdmin().from("businesses").select("name, slug, status").eq("id", businessId).maybeSingle()
      : { data: null };

  let title = "Something went wrong";
  let body = "We couldn't confirm the payment. Nothing has changed. Please try again.";
  if (ok === "1" && business) {
    if (event === "payment_succeeded") {
      title = `${business.name} is live`;
      body = "Payment received. The website is online now.";
    } else if (event === "payment_failed") {
      title = "Payment failed";
      body = "The card was declined, so the website is paused.";
    } else {
      title = "Subscription cancelled";
      body = "The website is paused.";
    }
  }

  return (
    <main className={`${brandFont.className} grid min-h-dvh place-items-center bg-slate-50 px-4 text-slate-900`}>
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-lg text-slate-600">{body}</p>
        {business && (
          <div className="mt-8 flex flex-col gap-3">
            {business.status === "live" ? (
              <a
                href={liveSiteUrl(business.slug, env.rootDomain)}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
              >
                Open the live website
              </a>
            ) : (
              <Link
                href={`/p/${business.slug}`}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
              >
                Back to the preview
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
