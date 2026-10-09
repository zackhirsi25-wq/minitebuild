import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/site-renderer";
import { requireAdmin } from "@/lib/auth";
import { TEMPLATES, type TemplateId } from "@/lib/content/schema";
import { getPublicSiteFresh } from "@/lib/sites/public";
import { supabaseAdmin } from "@/lib/supabase/admin";

// The admin's live preview (shown in an iframe on the business page). Always
// reads fresh data and can show another template before it is saved.

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function AdminPreviewPage({ params, searchParams }: PageProps<"/admin-preview/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { template } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabaseAdmin().from("businesses").select("slug").eq("id", id).maybeSingle();
  if (!data) notFound();
  const site = await getPublicSiteFresh(data.slug);
  if (!site) notFound();
  const override = TEMPLATES.includes(template as TemplateId) ? (template as TemplateId) : undefined;
  return <SiteRenderer site={site} template={override} />;
}
