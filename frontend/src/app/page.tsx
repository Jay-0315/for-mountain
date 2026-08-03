import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { COMPANY_NAME_EN, COMPANY_NAME_JA, withTrailingSlash } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${COMPANY_NAME_JA} | ${COMPANY_NAME_EN} | ITエンジニアリング・ネットワーク通信機器`,
  },
  description:
    "株式会社マウンテンの公式サイト。東京都千代田区岩本町を拠点に、ITエンジニアリング・ネットワーク通信機器事業を通じ、お客様のビジネスを支えるIT総合カンパニーです。",
  alternates: { canonical: withTrailingSlash("/") },
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
