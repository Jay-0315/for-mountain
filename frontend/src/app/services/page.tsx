import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { withTrailingSlash } from "@/lib/site";

export const metadata: Metadata = {
  title: "事業内容",
  description:
    "株式会社マウンテンの事業内容。システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルなど幅広い事業をご紹介します。",
  alternates: { canonical: withTrailingSlash("/services") },
};

const serviceParagraphs = [
  "株式会社MOUNTAINは、お客様の課題やニーズに合わせた最適なITソリューションを提供し、システム開発からインフラ構築、AI活用、サイバーセキュリティまで幅広い技術領域で事業を展開しています。豊富な知識と経験、柔軟な対応力を活かし、企画・設計から構築、運用・保守まで一貫したサポートを提供することで、安心して利用できるIT環境の実現に取り組んでいます。",
  "近年、多くの企業では専門技術者の不足により、先進技術の導入やIT環境の構築・運用に課題を抱えています。そうした課題に対し、お客様ごとの状況やご要望を的確に把握し、最適なソリューションの提案から構築、運用まで一貫したサービスを提供することで、企業のIT活用を支援しています。",
  "また、システム開発における豊富な経験と高い技術力を活かし、お客様の要求に応じたIT環境を構築しています。要件定義から設計・開発・テスト、導入後の保守・運用、障害発生時の対応まで、一連のプロセスを一貫してサポートし、安全性・安定性・拡張性を備えたシステムを提供しています。",
  "さらに、AIやクラウド技術を活用した業務効率化、ネットワーク・インフラの最適化、サイバーセキュリティ対策など、企業のIT環境を支える幅広いソリューションを提供しています。最新技術を取り入れ、お客様のDX推進と持続可能なIT環境の実現を技術面から支援してまいります。",
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 pt-20">
        <section className="overflow-hidden py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-6">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">Services</p>
              <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">事業内容</h1>
              <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-slate-500">
                <span className="text-orange-500">株式会社マウンテン</span>
                <span> &gt; Services</span>
              </p>
            </div>

            <div className="border-y border-slate-200 bg-white/70 px-0 py-10 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:px-10">
              <div className="mx-auto max-w-4xl space-y-7 px-6 text-base leading-9 text-slate-700 sm:px-0 md:text-lg md:leading-10">
                {serviceParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                href="/services/list/"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-colors duration-200 hover:bg-orange-600"
              >
                詳しい事業分野を見る
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
