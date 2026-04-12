import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { withTrailingSlash } from "@/lib/site";

export const metadata: Metadata = {
  title: "会社概要",
  description:
    "株式会社マウンテンの会社情報・沿革・代表挨拶をご紹介します。システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルを対応するIT総合カンパニーです。",
  alternates: { canonical: withTrailingSlash("/about") },
};
import Footer from "@/components/layout/Footer";
import AboutSection from "@/components/sections/AboutSection";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
