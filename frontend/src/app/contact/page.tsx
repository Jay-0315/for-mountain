import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/sections/ContactSection";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-48 bg-gray-50">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
