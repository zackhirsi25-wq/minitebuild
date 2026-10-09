import type { Metadata } from "next";
import Link from "next/link";
import { brandFont } from "@/components/brand-font";
import { annualSaving, formatPrice, product } from "@/config/product";
import { telHref } from "@/lib/content/phone";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `${product.name} | Websites for local contractors`,
  description: `A professional website for your contracting business, built and hosted for ${formatPrice(product.plans.monthly.price)} a month.`,
};

export default function HomePage() {
  const { monthly, annual } = product.plans;
  const salesPhone = env.salesPhone;
  return (
    <div className={`${brandFont.className} min-h-dvh bg-white text-slate-900`}>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <p className="text-lg font-bold tracking-tight">{product.name}</p>
        <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-medium text-slate-600 hover:text-slate-900">
          Sign in
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:pt-20">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          A website that gets your phone ringing.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          {product.name} builds and hosts a fast, mobile-friendly website for your contracting or remodeling business,
          with your services, service areas and a tap-to-call button on every screen.
        </p>
        <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{monthly.label}</p>
            <p className="mt-2 text-4xl font-bold">
              {formatPrice(monthly.price)}
              <span className="text-lg font-medium text-slate-500">/{monthly.short}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{annual.label}</p>
            <p className="mt-2 text-4xl font-bold">
              {formatPrice(annual.price)}
              <span className="text-lg font-medium text-slate-500">/{annual.short}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">Save {formatPrice(annualSaving)} a year</p>
          </div>
        </div>
        {salesPhone && (
          <a
            href={telHref(salesPhone)}
            className="mt-10 inline-flex min-h-12 items-center rounded-xl bg-brand-600 px-6 text-lg font-semibold text-white hover:bg-brand-700"
          >
            Call {salesPhone}
          </a>
        )}
      </main>
    </div>
  );
}
