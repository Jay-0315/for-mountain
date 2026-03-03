import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import NewsSection from "@/components/sections/NewsSection";
import RecruitSection from "@/components/sections/RecruitSection";
import ContactSection from "@/components/sections/ContactSection";
import PartnersSection from "@/components/sections/PartnerSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <NewsSection />
        <RecruitSection />
        <ContactSection />
          <PartnersSection />

      </main>
      <Footer />
    </>
  );
}
