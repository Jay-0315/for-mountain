import { permanentRedirect } from "next/navigation";
import { BASE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
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

export default async function LegacyNoticeDetailPage({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/news/${id}`);
}
