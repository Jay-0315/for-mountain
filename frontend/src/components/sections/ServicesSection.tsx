"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── 데이터 ────────────────────────────────────────────────────

const solutionProducts = [
  {
    id: "ai",
    badge: "AI",
    badgeColor: "bg-yellow-100 text-yellow-600",
    icon: (
      <svg className="w-6 h-6 service-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI マモリージ",
    subtitle: "AI統合管理プラットフォーム",
    bullets: [
      "AI活用で統合管理・業務効率化向上とセキュリティ強化を同時に実現",
      "安心できるガバナンス運用で、組織の未来を支援",
    ],
    href: "http://mountain-info.co.jp/wp-content/uploads/2025/09/Wiseon-AI%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88-%E6%B7%BB%E4%BB%98%E8%B3%87%E6%96%99.pdf",
    hrefLabel: "資料を見る",
  },
  {
    id: "wiseon",
    badge: "Cloud",
    badgeColor: "bg-green-100 text-green-600",
    icon: (
        <svg className="w-6 h-6 service-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
          <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
    ),
    title: "Wise on Cloud",
    subtitle: "クラウド自動化プラットフォーム",
    bullets: [
      "No-Code基盤の簡単で便利なクラウド自動化管理",
      "多様なクラウド環境の構成、変更、管理が簡素化できるソリューション",
    ],
    href: "http://www.wiseon.cloud/",
    hrefLabel: "詳しく見る",
  },
  {
    id: "blackbox",
    badge: "Security",
    badgeColor: "bg-red-100 text-red-600",
    icon: (
        <svg className="w-6 h-6 service-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    title: "Network BlackBox",
    subtitle: "サイバーセキュリティ",
    bullets: [
      "フルパケットキャプチャによる高性能ビッグデータ管理",
      "検索に特化した最強のセキュリティソリューション",
    ],
    href: "https://www.quadminers.co.jp/",
    hrefLabel: "詳しく見る",
  },
];

type TabId = "solutions" | "system" | "consulting" | "network";

const tabs: { id: TabId; label: string; labelEn: string }[] = [
  { id: "solutions",  label: "ソリューション",       labelEn: "Solutions" },
  { id: "system",     label: "システム開発",          labelEn: "System Development" },
  { id: "consulting", label: "コンサルティング",      labelEn: "Consulting" },
  { id: "network",    label: "ネットワーク",          labelEn: "Network" },
];

const tabIcons: Record<TabId, React.ReactNode> = {
  solutions: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  ),
  system: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  consulting: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  network: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
};

const tabContents: Record<TabId, { overview: string[]; items: { title: string; bullets: string[] }[] }> = {
  solutions: {
    overview: [
      "国内外製品（HW／SW）のマーケティング及び販売",
      "ソリューションの技術サポート＆保守対応",
      "教育支援",
    ],
    items: [], // Solutions는 별도 제품 카드 렌더링
  },
  system: {
    overview: [
      "大手金融機関や流通、ネットワーク通信サービスの開発に参画",
      "システムの設計、開発、テスト、運用",
    ],
    items: [
      {
        title: "開発領域",
        bullets: [
          "WEB・インターネット関連開発",
          "Package開発",
          "クライアントサーバシステム関連開発",
        ],
      },
    ],
  },
  consulting: {
    overview: [],
    items: [
      {
        title: "コンサルティングサービス",
        bullets: [
          "ITシステム構築コンサルティング",
          "DX戦略立案・計画・実行支援コンサルティング",
          "海外事業展開サポート・営業支援・リサーチ業務",
        ],
      },
    ],
  },
  network: {
    overview: [],
    items: [
      {
        title: "ネットワークサービス",
        bullets: [
          "ITインフラ構築・監視・保守",
          "プロダクト導入支援",
        ],
      },
    ],
  },
};

// ── コンポーネント ─────────────────────────────────────────────
export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>("solutions");

  // 탭 전환 GSAP 애니메이션
  const switchTab = useCallback((id: TabId) => {
    if (id === activeTab) return;
    const el = contentRef.current;
    if (!el) { setActiveTab(id); return; }
    // 콘텐츠 페이드아웃 → 상태 업데이트 → 페이드인 (새 카드 포함)
    gsap.to(el, {
      opacity: 0, y: -8, duration: 0.2, ease: "power2.in",
      onComplete: () => {
        setActiveTab(id);
        // 다음 프레임에 새 DOM이 반영된 뒤 애니메이션
        requestAnimationFrame(() => {
          gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
          // 새로 생긴 카드들도 stagger
          const cards = el.querySelectorAll(".service-card");
          if (cards.length > 0) {
            gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" });
          }
        });
      },
    });
  }, [activeTab]);

  // 스크롤 진입 애니메이션
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from(".services-header", {
        opacity: 0, y: 50, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".services-header", start: "top 82%", once: true },
      });

      gsap.from(".services-tabs", {
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".services-tabs", start: "top 85%", once: true },
      });

    },
    { scope: sectionRef }
  );

  // 카드 진입 애니메이션 — activeTab 변경 시마다 재실행
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".service-card"));
    if (cards.length === 0) return;
    // 초기값 즉시 설정 후 애니메이션
    gsap.killTweensOf(cards);
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out", clearProps: "all" }
    );
  }, [activeTab]);

  const content = tabContents[activeTab];

  return (
    <section ref={sectionRef} id="services" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* 섹션 헤더 */}
        <div className="services-header text-center mb-12">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Services
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            事業内容
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            株式会社マウンテン &gt; Services
          </p>
        </div>

        {/* 탭 버튼 */}
        <div className="services-tabs flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-orange-200 hover:text-orange-500"
                }`}
            >
              {tabIcons[tab.id]}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div ref={contentRef}>

          {/* Solutions: 개요 + 제품 카드 3개 */}
          {activeTab === "solutions" && (
            <div>
              {/* 개요 태그 */}
              <div className="flex flex-wrap gap-2 mb-8">
                {tabContents.solutions.overview.map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-orange-50 text-orange-600 text-sm rounded-lg border border-orange-100 font-medium">
                    {item}
                  </span>
                ))}
              </div>

              {/* 제품 카드 3개 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {solutionProducts.map((p) => (
                  <div
                    key={p.id}
                    className="service-card group flex flex-col p-7 rounded-2xl border border-slate-100 bg-white
                               hover:border-orange-100 hover:shadow-xl hover:shadow-orange-50
                               hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* 상단: 배지 + 아이콘 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center
                                      group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                        {p.icon}
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{p.title}</h3>
                    <p className="text-xs text-slate-400 font-medium mb-4">{p.subtitle}</p>

                    {/* Bullet */}
                    <ul className="space-y-2 mb-6 flex-1">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-slate-500">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>

                    {/* 링크 버튼 */}
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl
                                 border border-orange-200 text-orange-500 text-sm font-semibold
                                 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200"
                    >
                      {p.hrefLabel}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System / Consulting / Network: 공통 레이아웃 */}
          {activeTab !== "solutions" && (
            <div className="service-card bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-8 md:p-10">
                {/* 탭 제목 */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
                    {tabIcons[activeTab]}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      {tabs.find((t) => t.id === activeTab)?.labelEn}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </h3>
                  </div>
                </div>

                {/* 개요 목록 */}
                {content.overview.length > 0 && (
                  <ul className="space-y-2 mb-8">
                    {content.overview.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-slate-600">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* 서브 아이템 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {content.items.map((item) => (
                    <div
                      key={item.title}
                      className="p-5 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
                        {item.title}
                      </p>
                      <ul className="space-y-1.5">
                        {item.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-slate-500">
                            <span className="w-1 h-1 bg-slate-300 rounded-full mt-2 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
