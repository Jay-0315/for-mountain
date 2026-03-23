import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import PartnersSection from "@/components/sections/PartnerSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PartnersSection />
      </main>
      <Footer />
    </>
  );
}
