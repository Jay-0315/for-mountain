import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { withTrailingSlash } from "@/lib/site";

export const metadata: Metadata = {
  title: "ニュース",
  description:
    "株式会社MOUNTAINからの最新情報・お知らせを掲載しています。新サービス・採用・製品情報など随時更新中です。",
  alternates: { canonical: withTrailingSlash("/news") },
};
import Footer from "@/components/layout/Footer";
import NewsSection from "@/components/sections/NewsSection";
import SubpageVideoHero from "@/components/ui/SubpageVideoHero";

export default function NewsPage() {
  return (
    <>
      <Header />
      <main>
        <SubpageVideoHero
          eyebrow="News"
          title="お知らせ"
          subtitle="株式会社MOUNTAIN > お知らせ"
        />
        <NewsSection showHeader={false} />
      </main>
      <Footer />
    </>
  );
}
