import type { MetadataRoute } from "next";

// robots.txt for the app domain. Customer sites get their own (see /s/[slug]/robots.txt).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/p/", "/admin", "/login", "/billing", "/api/"] },
  };
}
