import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/site-renderer";
import { demoSite, demoTypeFor } from "@/demo";
import { isBusinessType } from "@/lib/business-type";
import { isTemplateId, TEMPLATE_DEMOS, templateMeta } from "@/templates";

// A template rendered with demo content, on its own (no Minitebuild chrome).
// Shown inside the gallery preview and used to render thumbnails.
//   /demo/cinematic?type=salon&palette=sage

export async function generateMetadata({ params }: PageProps<"/demo/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: isTemplateId(id) ? `${templateMeta(id).name} template demo` : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({ params, searchParams }: PageProps<"/demo/[id]">) {
  const { id } = await params;
  const { type, palette } = await searchParams;
  if (!isTemplateId(id)) notFound();
  const businessType = isBusinessType(type) ? type : demoTypeFor(TEMPLATE_DEMOS[id].defaultType);
  return (
    <SiteRenderer
      site={demoSite(businessType, id)}
      template={id}
      palette={typeof palette === "string" ? palette : undefined}
      demo
    />
  );
}
