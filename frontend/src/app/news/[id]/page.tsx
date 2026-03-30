import type { Metadata } from "next";
import NewsDetailClient from "./NewsDetailClient";
import { BASE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

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

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/board/${id}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch news metadata");
    }

    const post = (await res.json()) as {
      title: string;
      content: string;
      category: string;
    };

    const description =
      post.content.replace(/\s+/g, " ").trim().slice(0, 120) ||
      "株式会社マウンテンからのお知らせ・最新情報の詳細ページです。";

    return {
      title: post.title,
      description,
      alternates: { canonical: `${BASE_URL}/news/${id}` },
      openGraph: {
        title: post.title,
        description,
        type: "article",
        url: `${BASE_URL}/news/${id}`,
      },
    };
  } catch {
    return {
      title: "ニュース詳細",
      description: "株式会社マウンテンからのお知らせ・最新情報の詳細ページです。",
      alternates: { canonical: `${BASE_URL}/news/${id}` },
    };
  }
}

export default function NewsDetailPage() {
  return <NewsDetailClient />;
}
