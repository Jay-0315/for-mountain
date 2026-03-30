import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { withTrailingSlash } from "@/lib/site";

export const metadata: Metadata = {
  title: "採用情報",
  description:
    "株式会社マウンテンの採用情報。ITエンジニア・営業・管理部門など各ポジションの求人情報をご確認ください。",
  alternates: { canonical: withTrailingSlash("/recruit") },
};
import Footer from "@/components/layout/Footer";
import RecruitSection from "@/components/sections/RecruitSection";

export default function RecruitPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <RecruitSection />
      </main>
      <Footer />
    </>
  );
}
