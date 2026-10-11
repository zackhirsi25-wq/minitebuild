import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { product } from "@/config/product";
import { getDraft } from "@/lib/build/draft";
import { MAX_PHOTOS } from "@/lib/build/uploads";
import { env } from "@/lib/env";
import { StepShell } from "../shell";
import { Uploader } from "./uploader";

export const metadata: Metadata = { title: `Add photos | ${product.name}`, robots: { index: false } };

export default async function PhotosStep() {
  const current = await getDraft();
  if (!current?.data.confirmed) redirect("/build");
  if (current.data.slug) redirect("/build");
  const { photos, logo } = current.data;

  return (
    <StepShell
      step={1}
      back={{ href: "/build" }}
      title="Add your photos"
      intro="Optional. Anywhere you don't add one, we use photos chosen for your kind of business."
    >
      <Uploader
        photos={photos}
        logo={logo}
        max={MAX_PHOTOS}
        publicUrl={`${env.supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/site-images`}
      />
      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Link
          href="/build/design"
          className="inline-flex h-13 items-center justify-center rounded-button bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98]"
        >
          Continue
        </Link>
        {photos.length === 0 && !logo && (
          <Link href="/build/design" className={buttonClass("ghost", "lg")}>
            Skip photos
          </Link>
        )}
      </div>
    </StepShell>
  );
}
