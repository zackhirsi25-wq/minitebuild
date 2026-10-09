import type { ImageSlot } from "@/lib/content/schema";
import type { SiteImage } from "@/lib/images/stock";
import type { PublicSite } from "@/lib/sites/public";

export type TemplateProps = {
  site: PublicSite;
  images: Record<ImageSlot, SiteImage>;
};
