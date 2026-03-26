import type { Metadata } from "next";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: { absolute: "株式会社MOUNTAIN" },
  description:
    "株式会社マウンテンの公式サイト。ITエンジニアリング・ネットワーク通信機器事業を通じ、お客様のビジネスを支えるIT総合カンパニーです。",
  alternates: { canonical: "https://mountain-info.com" },
};
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import PartnersSection from "@/components/sections/PartnerSection";
import ValuesStrip from "@/components/sections/ValuesStrip";
import DarkCanvasBg from "@/components/ui/DarkCanvasBg";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* 히어로 ~ 파트너를 하나의 다크 캔버스로 통합 */}
        <div className="relative bg-[radial-gradient(circle_at_top,#09111f_0%,#03070f_60%,#010309_100%)]">
          <DarkCanvasBg />
          <HeroSection />
          <ValuesStrip />
          <PartnersSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
