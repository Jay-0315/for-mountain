import Header from "@/components/layout/Header";
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
