import type { Metadata } from "next";
import ServiceDetailClient from "./ServiceDetailClient";
import { BASE_URL } from "@/lib/site";
import { fetchServiceStaticParams } from "@/lib/static-params";

export async function generateStaticParams() {
  return fetchServiceStaticParams();
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/service-items/${id}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch service metadata");
    }

    const item = (await res.json()) as {
      title: string;
      content: string;
    };

    const description =
      item.content.replace(/\s+/g, " ").trim().slice(0, 120) ||
      "株式会社マウンテンの事業紹介詳細です。画像・動画・関連資料をご確認いただけます。";

    return {
      title: item.title,
      description,
      alternates: { canonical: `${BASE_URL}/services/${id}` },
      openGraph: {
        title: item.title,
        description,
        type: "article",
        url: `${BASE_URL}/services/${id}`,
      },
    };
  } catch {
    return {
      title: "事業詳細",
      description: "株式会社マウンテンの事業紹介詳細です。画像・動画・関連資料をご確認いただけます。",
      alternates: { canonical: `${BASE_URL}/services/${id}` },
    };
  }
}

export default function ServiceDetailPage() {
  return <ServiceDetailClient />;
}
