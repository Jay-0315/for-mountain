import type { Metadata } from "next";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "ニュース",
  description:
    "株式会社マウンテンからの最新情報・お知らせを掲載しています。新サービス・採用・製品情報など随時更新中です。",
  alternates: { canonical: "http://13.239.33.235/news" },
};
import Footer from "@/components/layout/Footer";
import NewsSection from "@/components/sections/NewsSection";

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
