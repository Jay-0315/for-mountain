import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { BASE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "会社概要",
  description:
    "株式会社マウンテンの会社情報・沿革・代表挨拶をご紹介します。ITエンジニアリングとネットワーク通信機器事業を展開するIT総合カンパニーです。",
  alternates: { canonical: `${BASE_URL}/about` },
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
