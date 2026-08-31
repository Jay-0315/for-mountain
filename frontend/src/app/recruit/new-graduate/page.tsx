import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RecruitSection from "@/components/sections/RecruitSection";

export const metadata: Metadata = {
  title: "新卒採用",
  description: "株式会社MOUNTAINの新卒採用情報です。",
  alternates: { canonical: "https://mountain-info.com/recruit/new-graduate/" },
};

export default function NewGraduateRecruitPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <RecruitSection initialTab="新卒採用" />
      </main>
      <Footer />
    </>
  );
}
