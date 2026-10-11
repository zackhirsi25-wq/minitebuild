import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { appUrl } from "@/lib/routing/hostname";

// robots.txt for the app domain. Customer sites get their own (see /s/[slug]/robots.txt).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/p/", "/admin", "/admin-preview", "/login", "/billing", "/api/", "/build", "/demo/"],
    },
    sitemap: appUrl("/sitemap.xml", env.rootDomain),
  };
}
