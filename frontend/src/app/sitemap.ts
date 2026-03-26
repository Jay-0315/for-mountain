import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://mountain-info.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/recruit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const [newsRes, servicesRes] = await Promise.allSettled([
      fetch(`${BASE_URL}/api/v1/board?page=0&size=100`),
      fetch(`${BASE_URL}/api/v1/service-items`),
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [];

    if (newsRes.status === "fulfilled" && newsRes.value.ok) {
      const data = await newsRes.value.json();
      const posts: { id: number; createdAt: string }[] = data.posts ?? data.content ?? [];
      posts.forEach((post) => {
        dynamicRoutes.push({
          url: `${BASE_URL}/news/${post.id}`,
          lastModified: new Date(post.createdAt),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    }

    if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
      const items: { id: number; updatedAt?: string; createdAt: string }[] = await servicesRes.value.json();
      items.forEach((item) => {
        dynamicRoutes.push({
          url: `${BASE_URL}/services/${item.id}`,
          lastModified: new Date(item.updatedAt ?? item.createdAt),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
