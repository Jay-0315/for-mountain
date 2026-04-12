"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  COMPANY_FULL_ADDRESS,
  COMPANY_GOOGLE_MAPS_EMBED_URL,
  COMPANY_GOOGLE_MAPS_URL,
} from "@/lib/site";

// ── 데이터 ────────────────────────────────────────────────────
const companyInfo = [
  { label: "社名",         value: "株式会社 MOUNTAIN（Mountain Co.,Ltd）" },
  { label: "設立",         value: "2022年2月7日" },
  { label: "代表取締役",   value: "盧 鍾錫" },
  { label: "所在地",       value: "東京都千代田区岩本町二丁目１３番６号\nリアライズ岩本町ビル ５階" },
  { label: "電話・FAX",    value: "TEL：03-5829-6357\nFAX：03-5829-8032" },
  { label: "URL",          value: "mountain-info.co.jp" },
  { label: "主な取引銀行", value: "朝日信用金庫、ハナ銀行" },
  { label: "事業内容",     value: "製品開発、ITソリューション、コンサル事業等" },
  { label: "適格請求書",   value: "T3010001224503" },
  { label: "加入団体",     value: "東京商工会議所\n東京中小企業家同友会\n韓国企業連合会（KOBA）" },
];

const tabs = [
  {
    id: "philosophy",
    label: "企業理念",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    content: (
      <p className="text-slate-600 leading-relaxed text-[20px]">
        私たちはモノの価値を最大限生み出し、社会の変化と調和しながら
        <strong className="font-bold text-slate-800">便利で豊かな人間社会を実現するために</strong>
        、常に挑戦し人と社会に信頼される企業を目指します。
      </p>
    ),
  },
  {
    id: "goal",
    label: "企業目標",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    content: (
      <div className="space-y-3 text-[20px] text-slate-600 leading-relaxed">
        <p>
          弊社はITの総合サポート企業として、<strong className="font-normal text-slate-800">ソリューションと開発を通じて便利で豊かな社会を実現する</strong>
          ことを目標にしております。
        </p>
        <p>
          現在は、世の中が必要としているAI製品、セキュリティ製品、クラウド製品を提供し、
          構築・運用・保守までのマネージドサービスを展開しております。
        </p>
        <p>
          システム開発においては要件定義・設計・製造・テスト・保守の業務全盤を対応しており、
          高い技術力と特化したマネージドサービスを持つ<strong className="font-normal text-slate-800">MSP企業として成長</strong>
          してまいります。
        </p>
      </div>
    ),
  },
];

const companyValues = [
  {
    key: "VALUE",
    ja: "価値創造",
    color: "bg-yellow-100",
    icon: (
      <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "HARMONY",
    ja: "環境と変化との調和",
    color: "bg-green-100",
    icon: (
      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    key: "CHALLENGE",
    ja: "絶え間ない挑戦",
    color: "bg-red-100",
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    key: "TRUST",
    ja: "人と社会との信頼",
    color: "bg-orange-100",
    icon: (
      <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const accessCards = [
  {
    line: "都営新宿線",
    station: "岩本町駅",
    detail: "4番出口より徒歩3分",
  },
  {
    line: "日比谷線",
    station: "秋葉原駅",
    detail: "4番出口より徒歩5分",
  },
  {
    line: "JR",
    station: "秋葉原駅",
    detail: "駅より徒歩7分",
  },
];

// ── コンポーネント ─────────────────────────────────────────────
export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const tabPanelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("philosophy");

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      // 섹션 헤더
      gsap.from(".about-header > *", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-header",
          start: "top 80%",
          once: true,
        },
      });

      // 탭 패널 + 텍스트
      gsap.from(".about-tab-panel", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-tab-panel",
          start: "top 82%",
          once: true,
        },
      });

      // 기업 정보 테이블 행 stagger
      gsap.from(".about-table-row", {
        opacity: 0,
        x: -25,
        duration: 0.55,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-table",
          start: "top 80%",
          once: true,
        },
      });

      // 오른쪽 info 카드들
      gsap.from(".info-card", {
        opacity: 0,
        x: 45,
        duration: 0.7,
        stagger: 0.13,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".info-card",
          start: "top 82%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    if (!tabPanelRef.current) return;
    gsap.fromTo(
      tabPanelRef.current,
      { opacity: 0, y: 16, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }
    );
  }, [activeTab]);

  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <section ref={sectionRef} id="about" className="pt-44 pb-[32rem] bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-6">

        {/* 섹션 헤더 */}
        <div className="about-header text-center mb-24">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">
            About Us
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            企業情報
          </h2>
          <p className="mx-auto max-w-xl text-lg font-semibold text-slate-500">
            <span className="text-orange-500">株式会社マウンテン</span>
            <span> &gt; About Us</span>
          </p>
        </div>

        {/* 기업이념 / 기업목표 탭 */}
        <div className="about-tab-panel mb-24">
          {/* 탭 버튼 */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[15px] md:text-base font-semibold transition-all duration-200
                  ${activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-orange-200 hover:text-orange-500"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div ref={tabPanelRef} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm min-h-[140px]">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
              {activeTabData.label}
            </h3>
            {activeTabData.content}
            {activeTab === "philosophy" && (
              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-8 mt-8 md:grid-cols-4">
                {companyValues.map((value) => (
                  <div key={value.key} className="flex flex-col items-center text-center gap-3">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full shadow-md ${value.color}`}>
                      {value.icon}
                    </div>
                    <p className="text-sm font-extrabold tracking-widest text-slate-900">{value.key}</p>
                    <p className="text-base font-bold text-slate-600 md:text-[1.05rem]">{value.ja}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2컬럼: 회사개요 테이블 + 인포 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* 왼쪽: 회사개요 (3/5) */}
          <div className="lg:col-span-3">
            <h3 className="text-2xl md:text-[1.7rem] font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
              会社概要
            </h3>
            <div className="about-table bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {companyInfo.map((row, i) => (
                <div
                  key={row.label}
                  className={`about-table-row flex gap-0 ${i !== companyInfo.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <span className="text-[20px] font-semibold text-slate-500 bg-slate-50 w-40 shrink-0 px-5 py-4 flex items-start">
                    {row.label}
                  </span>
                  <span className="text-[20px] text-slate-800 px-6 py-4 leading-relaxed whitespace-pre-line flex-1">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 인포 카드 (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* 소재지 카드 */}
            <div className="info-card p-6 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="mb-1.5 text-[18px] font-semibold">所在地</p>
                  <p className="text-[18px] leading-relaxed text-orange-100">
                    東京都千代田区岩本町<br />
                    二丁目１３番６号<br />
                    リアライズ岩本町ビル ５階
                  </p>
                </div>
              </div>
            </div>

            {/* 연락처 카드 */}
            <div className="info-card p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="mb-1.5 text-[18px] font-semibold text-slate-800">お問い合わせ</p>
                  <p className="text-[18px] text-slate-500">TEL：03-5829-6357</p>
                  <p className="text-[18px] text-slate-500">FAX：03-5829-8032</p>
                </div>
              </div>
            </div>

            {/* 설립 / 대표 카드 */}
            <div className="info-card p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[18px] text-slate-500 font-semibold">設立</p>
                    <p className="text-[18px] font-semibold text-slate-800">2022年2月7日</p>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100" />
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[18px] text-slate-500 font-semibold">代表取締役社長</p>
                    <p className="text-[18px] font-semibold text-slate-800">盧 鍾錫</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500">
                Access
              </p>
              <p className="mt-1 text-base font-semibold text-slate-800">
                {COMPANY_FULL_ADDRESS}
              </p>
            </div>
            <Link
              href={COMPANY_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="min-w-[112px] whitespace-nowrap rounded-full bg-orange-500 px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              地図開き
            </Link>
          </div>
          <div className="h-[380px] bg-slate-100 md:h-[480px]">
            <iframe
              title="株式会社マウンテンの所在地マップ"
              src={COMPANY_GOOGLE_MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
              allowFullScreen
            />
          </div>
          <div className="grid gap-4 border-t border-slate-100 px-6 py-5 md:grid-cols-3">
            {accessCards.map((card) => (
              <div
                key={`${card.line}-${card.station}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  {card.line}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">{card.station}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
