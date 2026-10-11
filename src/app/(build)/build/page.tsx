import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { product } from "@/config/product";
import { getDraft } from "@/lib/build/draft";
import { isTemplateId } from "@/templates";
import { confirmDetails, startOver } from "./actions";
import { DetailsForm } from "./details-form";
import { StepShell } from "./shell";

export const metadata: Metadata = { title: `Build your site | ${product.name}`, robots: { index: false } };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="text-body">{children}</dd>
    </div>
  );
}

export default async function DetailsStep({ searchParams }: PageProps<"/build">) {
  const q = await searchParams;
  const template = isTemplateId(q.template) ? q.template : undefined;
  const editing = q.edit === "1";
  const current = await getDraft();
  const draft = current?.data;

  // Already built in this browser: go to it, or start a new one.
  if (draft?.slug) {
    return (
      <StepShell step={3} title="Your site is ready" intro={`We built a preview for ${draft.name}.`}>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/p/${draft.slug}`} size="lg">
            Open your preview
          </ButtonLink>
          <form action={startOver}>
            <button type="submit" className={buttonClass("secondary", "lg")}>
              Build another site
            </button>
          </form>
        </div>
      </StepShell>
    );
  }

  if (!draft?.name || editing || draft.match === undefined) {
    return (
      <StepShell
        step={0}
        back={editing ? { href: "/build", label: "Back" } : undefined}
        title={editing ? "Edit your details" : "Tell us about your business"}
        intro="Name, city and phone. We look you up on Google to fill in the rest."
      >
        <DetailsForm initial={draft?.name ? draft : undefined} template={template ?? draft?.template} />
      </StepShell>
    );
  }

  const found = draft.match && draft.match.found ? draft.match.place : null;
  return (
    <StepShell
      step={0}
      title={found ? "Is this your business?" : `We couldn't find ${draft.name} on Google`}
      intro={
        found
          ? "We found this listing on Google. If it's right, we'll use it for your address and opening hours."
          : "That's fine: we'll build your site from the details you entered. You can check them below."
      }
    >
      <Card className="p-6">
        <p className="text-lead font-semibold">{found?.name ?? draft.name}</p>
        <dl className="mt-4">
          <Row label="City">{found?.city ?? draft.city}</Row>
          <Row label="Phone">
            {draft.match?.found && draft.match.matchedBy === "phone" && found?.phone ? found.phone : draft.phone}
          </Row>
          {found?.address && <Row label="Address">{found.address}</Row>}
          {found?.category && <Row label="Type">{found.category}</Row>}
          {found && found.hours.length > 0 && (
            <Row label="Hours">
              <ul className="grid gap-0.5 text-small text-muted">
                {found.hours.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </Row>
          )}
        </dl>
      </Card>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <form action={confirmDetails}>
          {template && <input type="hidden" name="template" value={template} />}
          <button
            type="submit"
            className="inline-flex h-13 items-center justify-center rounded-button bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98]"
          >
            {found ? "Yes, continue" : "Continue"}
          </button>
        </form>
        <Link
          href={`/build?edit=1${template ? `&template=${template}` : ""}`}
          className={buttonClass("secondary", "lg")}
        >
          {found ? "No, edit details" : "Edit details"}
        </Link>
      </div>
    </StepShell>
  );
}
