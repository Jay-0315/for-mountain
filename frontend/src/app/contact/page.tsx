import type { Metadata } from "next";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "株式会社MOUNTAINへのお問い合わせはこちら。サービス・採用・その他ご不明な点はお気軽にご連絡ください。",
  alternates: { canonical: "https://mountain-info.com/contact/" },
  openGraph: {
    url: "https://mountain-info.com/contact/",
  },
};
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/sections/ContactSection";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
