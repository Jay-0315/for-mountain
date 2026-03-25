import type { Metadata } from "next";
import ServiceDetailClient from "./ServiceDetailClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "事業詳細",
    description: "株式会社マウンテンの事業紹介詳細です。画像・動画・関連資料をご確認いただけます。",
  };
}

export default function ServiceDetailPage() {
  return <ServiceDetailClient />;
}
