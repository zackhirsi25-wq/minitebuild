import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { brandFont } from "@/components/brand-font";
import { SubmitButton } from "@/components/ui/submit-button";
import { annualSaving, formatPrice, product } from "@/config/product";
import { getBillingProvider } from "@/lib/billing";
import { telHref } from "@/lib/content/phone";
import { env } from "@/lib/env";
import { liveSiteUrl } from "@/lib/routing/hostname";
import { getPublicSite } from "@/lib/sites/public";
import { startCheckout } from "./actions";

export const metadata: Metadata = {
  title: `Go live | ${product.name}`,
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ params, searchParams }: PageProps<"/p/[slug]/checkout">) {
  const { slug } = await params;
  const { error } = await searchParams;
  const site = await getPublicSite(slug);
  if (!site) notFound();
  if (site.status === "live") redirect(liveSiteUrl(site.slug, env.rootDomain));

  const provider = getBillingProvider();
  const { monthly, annual } = product.plans;
  const salesPhone = env.salesPhone;

  return (
    <main className={`${brandFont.className} min-h-dvh bg-slate-50 px-4 py-10 text-slate-900 sm:py-16`}>
      <div className="mx-auto max-w-2xl">
        <Link href={`/p/${slug}`} className="inline-flex min-h-11 items-center text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to the preview
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Put {site.name} online</h1>
        <p className="mt-3 text-lg text-slate-600">
          Your site goes live at{" "}
          <span className="font-semibold text-slate-900">{liveSiteUrl(site.slug, env.rootDomain).replace(/^https?:\/\//, "")}</span>{" "}
          with hosting and updates included. Cancel any time.
        </p>

        <form action={startCheckout} className="mt-8">
          <input type="hidden" name="slug" value={site.slug} />
          <fieldset>
            <legend className="sr-only">Choose a plan</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="relative flex cursor-pointer flex-col rounded-2xl border-2 border-slate-200 bg-white p-5 transition has-[:checked]:border-brand-600 has-[:checked]:ring-4 has-[:checked]:ring-brand-100 has-[:focus-visible]:outline has-[:focus-visible]:outline-2">
                <input type="radio" name="plan" value="monthly" defaultChecked className="peer sr-only" />
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">{monthly.label}</span>
                <span className="mt-2 text-4xl font-bold">
                  {formatPrice(monthly.price)}
                  <span className="text-lg font-medium text-slate-500">/{monthly.short}</span>
                </span>
                <span className="mt-2 text-slate-600">Billed every month.</span>
              </label>
              <label className="relative flex cursor-pointer flex-col rounded-2xl border-2 border-slate-200 bg-white p-5 transition has-[:checked]:border-brand-600 has-[:checked]:ring-4 has-[:checked]:ring-brand-100 has-[:focus-visible]:outline has-[:focus-visible]:outline-2">
                <input type="radio" name="plan" value="annual" className="peer sr-only" />
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">{annual.label}</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    Save {formatPrice(annualSaving)}
                  </span>
                </span>
                <span className="mt-2 text-4xl font-bold">
                  {formatPrice(annual.price)}
                  <span className="text-lg font-medium text-slate-500">/{annual.short}</span>
                </span>
                <span className="mt-2 text-slate-600">
                  One payment a year. {formatPrice(monthly.price * 12)} if paid monthly.
                </span>
              </label>
            </div>
          </fieldset>

          {error === "plan" && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-800">
              Pick a plan to continue.
            </p>
          )}

          <div className="mt-8">
            {provider.online ? (
              <SubmitButton className="w-full text-lg" pendingLabel="Opening checkout…">
                Continue to payment
              </SubmitButton>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-lg font-semibold">Contact us to activate</p>
                <p className="mt-1 text-slate-600">We&apos;ll set up billing and switch your site on over the phone.</p>
                {salesPhone ? (
                  <a
                    href={telHref(salesPhone)}
                    className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-6 text-lg font-semibold text-white hover:bg-brand-700 sm:w-auto"
                  >
                    Call {salesPhone}
                  </a>
                ) : (
                  <p className="mt-4 text-slate-600">Reply to the message we sent you and we&apos;ll get you set up.</p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
