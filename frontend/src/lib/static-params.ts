import { BASE_URL } from "@/lib/site";

type StaticParam = { id: string };

export async function fetchNewsStaticParams(): Promise<StaticParam[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/board?page=0&size=1000`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch news static params");
    }

    const data = (await res.json()) as {
      posts?: Array<{ id: number }>;
    };

    return (data.posts ?? []).map((post) => ({ id: String(post.id) }));
  } catch {
    return [];
  }
}

export async function fetchServiceStaticParams(): Promise<StaticParam[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/service-items`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch service static params");
    }

    const items = (await res.json()) as Array<{ id: number }>;
    return items.map((item) => ({ id: String(item.id) }));
  } catch {
    return [];
  }
}
