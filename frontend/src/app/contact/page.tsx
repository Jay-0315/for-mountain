import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { BASE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "株式会社マウンテンへのお問い合わせはこちら。サービス・採用・その他ご不明な点はお気軽にご連絡ください。",
  alternates: { canonical: `${BASE_URL}/contact` },
};
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
