import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { product } from "@/config/product";

// Placeholder for the build flow (next stage): shows the first step with the
// details from the build box, so the home page has somewhere real to go.

export const metadata: Metadata = { title: `Build your site | ${product.name}`, robots: { index: false } };

const BUILD_STEPS = ["Details", "Photos", "Design", "Preview"];

export default async function BuildPage({ searchParams }: PageProps<"/build">) {
  const q = await searchParams;
  const value = (k: string) => (typeof q[k] === "string" ? (q[k] as string) : "");
  return (
    <div className="mx-auto max-w-[var(--mb-max)] px-[var(--mb-gutter)] py-12">
      <Stepper steps={BUILD_STEPS} current={0} />
      <div className="mt-12 max-w-xl">
        <h1 className="text-heading font-semibold">Your business details</h1>
        <p className="mt-3 text-lead text-muted">
          Next we look you up on Google so you can confirm your address and hours.
        </p>
        <form className="mt-10 grid gap-5" aria-describedby="build-soon">
          <Field label="Business name" name="name" defaultValue={value("name")} required />
          <Field label="City" name="city" defaultValue={value("city")} required />
          <Field label="Phone" name="phone" type="tel" defaultValue={value("phone")} required />
        </form>
        <p id="build-soon" className="mt-8 rounded-card border border-line bg-surface p-4 text-small text-muted">
          The rest of the build flow (Google lookup, photos, design and live progress) is the next stage of work.
        </p>
        <ButtonLink href="/" variant="ghost" className="mt-6 -ml-4">
          ← Back home
        </ButtonLink>
      </div>
    </div>
  );
}
