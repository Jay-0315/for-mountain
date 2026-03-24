import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsSection from "@/components/sections/NewsSection";

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
