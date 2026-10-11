import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { product } from "@/config/product";
import { demoTypeFor, photoReadyTypes } from "@/demo";
import { BUSINESS_TYPE_LABELS, isBusinessType } from "@/lib/business-type";
import { allTemplates, isTemplateId, TEMPLATE_DEMOS, templateMeta } from "@/templates";
import { PreviewFrame } from "./preview-frame";

export async function generateMetadata({ params }: PageProps<"/templates/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!isTemplateId(id)) return { title: "Template not found" };
  const meta = templateMeta(id);
  return { title: `${meta.name} template | ${product.name}`, description: meta.concept };
}

export function generateStaticParams() {
  return allTemplates().map((t) => ({ id: t.id }));
}

export default async function TemplatePreviewPage({ params, searchParams }: PageProps<"/templates/[id]">) {
  const { id } = await params;
  if (!isTemplateId(id)) notFound();
  const q = await searchParams;
  const meta = templateMeta(id);
  const ready = photoReadyTypes();
  const type = isBusinessType(q.type) && ready.includes(q.type) ? q.type : demoTypeFor(TEMPLATE_DEMOS[id].defaultType);
  const device = q.device === "mobile" ? "mobile" : "desktop";

  return (
    <PreviewFrame
      id={id}
      name={meta.name}
      type={type}
      device={device}
      types={ready.map((t) => ({ id: t, label: BUSINESS_TYPE_LABELS[t] }))}
    />
  );
}
