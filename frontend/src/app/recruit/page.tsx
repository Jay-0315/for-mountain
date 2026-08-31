import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "採用情報",
  description:
    "株式会社MOUNTAINの採用情報。ITエンジニア・営業・管理部門など各ポジションの求人情報をご確認ください。",
  alternates: { canonical: "https://mountain-info.com/recruit/" },
  openGraph: {
    url: "https://mountain-info.com/recruit/",
  },
};
import Footer from "@/components/layout/Footer";

export default function RecruitPage() {
  return (
    <>
      <Header />
      <main>
        <section
          data-transparent-header
          className="relative isolate flex min-h-screen items-end overflow-hidden bg-slate-950 px-6 pb-24 pt-24 text-white sm:px-10 md:pb-32"
        >
          <Image
            src="/images/recruit-hero.png"
            alt="採用情報"
            fill
            priority
            className="absolute inset-0 -z-20 object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-slate-950/12" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.14)_48%,rgba(2,6,23,0.34)_100%)]" />
          <div className="absolute inset-0 z-10 grid grid-cols-1 sm:grid-cols-2">
            <div className="relative flex items-end justify-center overflow-hidden px-6 pb-24 text-center md:pb-32">
              <div className="group mb-2 flex flex-col items-center gap-3 opacity-95 transition-transform duration-300 hover:scale-105">
                <span className="text-xs font-semibold tracking-[0.28em] text-white/80">NEW GRADUATE</span>
                <span className="text-2xl font-bold text-white drop-shadow-lg transition-colors duration-300 group-hover:text-orange-400 md:text-4xl">新卒採用</span>
                <Link
                  href="/recruit/new-graduate/"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-orange-600 shadow-lg shadow-slate-950/20 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white"
                  aria-label="新卒採用はこちら"
                >
                  <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">
                    &larr;
                  </span>
                  こちら
                </Link>
              </div>
            </div>
            <div className="relative flex items-end justify-center overflow-hidden px-6 pb-24 text-center md:pb-32">
              <div className="group mb-2 flex flex-col items-center gap-3 opacity-95 transition-transform duration-300 hover:scale-105">
                <span className="text-xs font-semibold tracking-[0.28em] text-white/80">CAREER</span>
                <span className="text-2xl font-bold text-white drop-shadow-lg transition-colors duration-300 group-hover:text-orange-400 md:text-4xl">中途採用</span>
                <Link
                  href="/recruit/career/"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-orange-600 shadow-lg shadow-slate-950/20 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white"
                  aria-label="中途採用はこちら"
                >
                  こちら
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
