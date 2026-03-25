import type { Metadata } from "next";
import NewsDetailClient from "./NewsDetailClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "ニュース詳細",
    description: "株式会社マウンテンからのお知らせ・最新情報の詳細ページです。",
  };
}

export default function NewsDetailPage() {
  return <NewsDetailClient />;
}
