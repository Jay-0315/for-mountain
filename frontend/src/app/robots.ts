import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/api/v1/board",
        "/api/v1/partner-cards",
        "/api/v1/service-items",
        "/api/v1/service-categories",
      ],
      disallow: [
        "/admin/",
        "/api/v1/auth/",
        "/api/v1/admin/",
        "/api/v1/employees",
        "/api/v1/groups",
        "/api/v1/leaves",
        "/api/v1/uploads",
        "/api/v1/announcements",
        "/api/v1/dept-notices",
        "/api/v1/contact",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
