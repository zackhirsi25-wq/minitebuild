import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { product } from "@/config/product";
import { getDraft } from "@/lib/build/draft";
import { BUILD_STEPS } from "@/lib/build/run";
import { StepShell } from "../shell";
import { BuildProgress } from "./progress";

export const metadata: Metadata = { title: `Building your site | ${product.name}`, robots: { index: false } };

export default async function PreviewStep() {
  const current = await getDraft();
  if (!current?.data.confirmed) redirect("/build");
  if (!current.data.designChosen) redirect("/build/design");
  if (current.data.slug) redirect(`/p/${current.data.slug}`);

  return (
    <StepShell
      step={3}
      title={`Building ${current.data.name}`}
      intro="This usually takes about a minute. Keep this page open."
    >
      <BuildProgress steps={BUILD_STEPS.map((s) => ({ id: s.id, label: s.label }))} />
    </StepShell>
  );
}
