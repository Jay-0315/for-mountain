import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { BASE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "事業内容",
  description:
    "株式会社マウンテンの事業内容。ITエンジニアリング・アウトソーシング・ネットワーク通信機器の製品開発・販売など幅広い事業をご紹介します。",
  alternates: { canonical: `${BASE_URL}/services` },
};
import Footer from "@/components/layout/Footer";
import ServicesSection from "@/components/sections/ServicesSection";

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <ServicesSection />
      </main>
      <Footer />
    </>
  );
}
