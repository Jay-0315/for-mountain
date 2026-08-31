import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { withTrailingSlash } from "@/lib/site";

export const metadata: Metadata = {
  title: "会社概要",
  description:
    "株式会社MOUNTAINの会社情報・沿革・代表挨拶をご紹介します。システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルを提供するIT総合カンパニーです。",
  alternates: { canonical: withTrailingSlash("/about") },
};
import Footer from "@/components/layout/Footer";
import AboutSection from "@/components/sections/AboutSection";
import SubpageVideoHero from "@/components/ui/SubpageVideoHero";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <SubpageVideoHero
          eyebrow="About Us"
          title="企業情報"
          subtitle="株式会社MOUNTAIN > About Us"
        />
        <AboutSection showHeader={false} />
      </main>
      <Footer />
    </>
  );
}
