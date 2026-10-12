"use server";

import { redirect } from "next/navigation";
import { ownedBusiness } from "@/lib/build/owner";
import { revalidateSite } from "@/lib/sites/revalidate";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isTemplateId, templateMeta } from "@/templates";

/** Switches template and palette for a preview this browser built. Content and photos stay. */
export async function setDesign(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const template = String(formData.get("template") ?? "");
  const owned = await ownedBusiness(slug);
  if (!owned || !isTemplateId(template)) redirect(`/p/${slug}`);
  // Each template has its own colour group in the form (palette-<template>).
  const palette = String(formData.get(`palette-${template}`) ?? "");
  const validPalette = templateMeta(template).palettes.some((p) => p.id === palette) ? palette : null;
  const { error } = await supabaseAdmin()
    .from("businesses")
    .update({ template, palette: validPalette })
    .eq("id", owned.id);
  if (error) throw new Error(`Could not change the design: ${error.message}`);
  revalidateSite(slug);
  redirect(`/p/${slug}`);
}
