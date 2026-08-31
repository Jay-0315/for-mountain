import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RecruitSection from "@/components/sections/RecruitSection";

export const metadata: Metadata = {
  title: "中途採用",
  description: "株式会社MOUNTAINの中途採用情報です。",
  alternates: { canonical: "https://mountain-info.com/recruit/career/" },
};

export default function CareerRecruitPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <RecruitSection initialTab="中途採用" />
      </main>
      <Footer />
    </>
  );
}
