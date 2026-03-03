"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── 데이터 ────────────────────────────────────────────────────
const tabs = ["新卒採用", "中途採用"] as const;
type Tab = (typeof tabs)[number];

const jobTypes = [
  {
    title: "エンジニア職",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    duties: [
      "ソフトウェア設計／開発／テスト（JAVA、JavaScript、Python、C、C#など）",
      "システムメンテナンス",
    ],
  },
  {
    title: "ソリューション職",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    duties: [
      "セキュリティ、クラウド、AIの技術支援及び保守",
      "ネットワークシステム運用・保守",
    ],
  },
];

const shinsotsuSalary = [
  { edu: "4年制大学卒", monthly: "250,000円", overtime: "39,000円" },
  { edu: "3年制大学卒", monthly: "240,000円", overtime: "37,000円" },
  { edu: "2年制大学卒", monthly: "230,000円", overtime: "35,000円" },
];

const benefits = [
  "各種社会保険完備（雇用保険、労災保険、健康保険、厚生年金保険）",
  "慶弔見舞金制度",
  "片道航空券代支給（外国籍の方）",
  "VISA取得サポート",
  "社宅サポート",
  "通勤手当支給（月3万5,000円まで）",
  "会社の飲み会費用支給",
  "資格取得費用支給",
  "通信手当（5,000円 / 月）",
];

const steps = [
  { step: "01", label: "書類選考", desc: "履歴書・必要書類をメールにてご提出ください" },
  { step: "02", label: "一次面接", desc: "オンラインまたは対面にて実施いたします" },
  { step: "03", label: "最終面接", desc: "オンラインまたは対面にて実施いたします" },
  { step: "04", label: "内定通知", desc: "面接後、約1週間以内にご連絡いたします" },
];

// ── コンポーネント ─────────────────────────────────────────────
export default function RecruitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("新卒採用");

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      // 헤더 애니메이션
      gsap.from(".recruit-header > *", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recruit-header",
          start: "top 80%",
          once: true,
        },
      });


      // 테이블 행 stagger
      gsap.from(".recruit-table-row", {
        opacity: 0,
        x: -25,
        duration: 0.55,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".recruit-table",
          start: "top 80%",
          once: true,
        },
      });

      // 오른쪽 카드
      gsap.from(".recruit-card", {
        opacity: 0,
        x: 45,
        duration: 0.7,
        stagger: 0.13,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recruit-card",
          start: "top 82%",
          once: true,
        },
      });

      // 스텝 카드
      gsap.from(".recruit-step", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recruit-card",
          start: "top 82%",
          once: true,
        },
      });

      // CTA 배너
      gsap.from(".recruit-cta", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recruit-cta",
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    const el = contentRef.current;
    if (!el) { setActiveTab(tab); return; }
    gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        onStart: () => setActiveTab(tab),
      }
    );
  };

  // 급여 테이블 (신졸/중도)
  const salaryRow =
    activeTab === "新卒採用" ? (
      <div className="recruit-table-row flex gap-0 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 w-32 shrink-0 px-4 py-3.5 flex items-start pt-3.5">
          給与
        </span>
        <div className="px-5 py-3.5 flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400">
                <th className="text-left pb-1.5 font-medium">学歴</th>
                <th className="text-left pb-1.5 font-medium">月給</th>
                <th className="text-left pb-1.5 font-medium">固定残業代20h分）</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {shinsotsuSalary.map((row) => (
                <tr key={row.edu} className="border-t border-slate-100">
                  <td className="py-1.5 pr-3">{row.edu}</td>
                  <td className="py-1.5 pr-3 font-semibold text-orange-600">{row.monthly}</td>
                  <td className="py-1.5">{row.overtime}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-2">
            ※ 固定残業代は20時間分を含みます。超過分は別途支給。
          </p>
        </div>
      </div>
    ) : (
      <div className="recruit-table-row flex gap-0 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 w-32 shrink-0 px-4 py-3.5 flex items-start pt-3.5">
          給与
        </span>
        <span className="text-sm text-slate-800 px-5 py-3.5 leading-relaxed flex-1">
          経験・スキルに応じて別途相談<br />
          <span className="text-xs text-slate-400">※ 詳細は面接時にご説明いたします。</span>
        </span>
      </div>
    );

  // 필요서류
  const docsRow =
    activeTab === "新卒採用" ? (
      <div className="recruit-table-row flex gap-0">
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 w-32 shrink-0 px-4 py-3.5 flex items-start pt-3.5">
          必要書類
        </span>
        <span className="text-sm text-slate-800 px-5 py-3.5 leading-relaxed whitespace-pre-line flex-1">
          履歴書、資格証
        </span>
      </div>
    ) : (
      <div className="recruit-table-row flex gap-0">
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 w-32 shrink-0 px-4 py-3.5 flex items-start pt-3.5">
          必要書類
        </span>
        <span className="text-sm text-slate-800 px-5 py-3.5 leading-relaxed whitespace-pre-line flex-1">
          履歴書、職務経歴書、資格証
        </span>
      </div>
    );

  return (
    <section ref={sectionRef} id="recruit" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* 섹션 헤더 */}
        <div className="recruit-header text-center mb-14">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Recruit
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            採用情報
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            株式会社マウンテン &gt; Recruit
          </p>
        </div>

        {/* 탭 버튼 */}
        <div className="recruit-tabs flex gap-2 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`recruit-tab-btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border
                ${activeTab === tab
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-500"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div ref={contentRef}>
          {/* 2컬럼: 모집 요강 + 카드 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* 왼쪽: 모집 요강 테이블 (3/5) */}
            <div className="lg:col-span-3">
              <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                募集要項
              </h3>

              {/* 모집 직종 */}
              <div className="mb-6 space-y-3">
                {jobTypes.map((job) => (
                  <div key={job.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-500 mb-3">
                      {job.icon}
                      <span className="font-bold text-slate-800 text-sm">{job.title}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {job.duties.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 조건 테이블 */}
              <div className="recruit-table bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {[
                  { label: "雇用形態", value: "正社員" },
                  { label: "就業場所", value: "東京本社（東京都千代田区岩本町2-13-6）、各事業所" },
                  { label: "労働時間", value: "09:00 〜 18:00（休憩60分）\n一部裁量労働制・フレックスタイム制あり" },
                  { label: "試用期間", value: "あり（3か月）\n※会社の判断により免除・短縮・延長する場合があります。\n※試用期間中の雇用条件の変更はありません。" },
                  { label: "休日・休暇", value: "年間125日\n完全週休2日制（土・日）、祝日\n有給休暇（入社半年後から付与）" },
                  { label: "応募資格", value: "日本語の日常会話が可能な方または\n日本語能力試験（JLPT）N2資格をお持ちの方\n国籍不問（就労ビザ取得に問題がない方）" },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={`recruit-table-row flex gap-0 ${i !== 5 ? "border-b border-slate-100" : ""}`}
                  >
                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 w-32 shrink-0 px-4 py-3.5 flex items-start pt-3.5">
                      {row.label}
                    </span>
                    <span className="text-sm text-slate-800 px-5 py-3.5 leading-relaxed whitespace-pre-line flex-1">
                      {row.value}
                    </span>
                  </div>
                ))}
                {salaryRow}
                {docsRow}
              </div>
            </div>

            {/* 오른쪽: 카드 (2/5) */}
            <div className="lg:col-span-2 space-y-4">

              {/* 応募資格 카드 */}
              <div className="recruit-card p-6 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-2">応募資格</p>
                    {activeTab === "新卒採用" ? (
                      <ul className="text-orange-100 text-sm space-y-1 leading-relaxed">
                        <li>• 関連学科専攻者及びプログラミング言語を独学で取得した方（Java、Python、C、C#、JavaScript 等）</li>
                        <li>• 日本語で日常会話が可能な方</li>
                        <li>• 非専攻者の場合、システムエンジニア及びプログラム開発に興味と情熱がある方</li>
                      </ul>
                    ) : (
                      <ul className="text-orange-100 text-sm space-y-1 leading-relaxed">
                        <li>• 開発関連プロジェクト（Java、Python、C、C#、JavaScript 等）経験者（1年以上）</li>
                        <li>• ネットワーク関連の知識がある方（CCNA取得者尚可）</li>
                        <li>• Linuxおよびサーバー関連の知識がある方（LPICなど取得者尚可）</li>
                        <li>• 仮想化／クラウド関連知識がある方</li>
                        <li>• ビジネス日本語が可能な方尚可</li>
                        <li>• プロジェクトマネジメント経験がある方尚可</li>
                        <li>• その他、資格をお持ちの方尚可（IT関連国際資格、ITパスポートなど）</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* 福利厚生 카드 */}
              <div className="recruit-card p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 mb-2 text-sm">福利厚生</p>
                    <ul className="space-y-1.5">
                      {benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 入社プロセス 카드 */}
              <div className="recruit-card p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="font-semibold text-slate-800 mb-4 text-sm flex items-center gap-2">
                  <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
                  入社プロセス
                </p>
                <div className="space-y-3">
                  {steps.map((s, i) => (
                    <div key={s.step} className="recruit-step flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center shrink-0 text-xs font-bold">
                        {s.step}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="absolute ml-3.5 mt-8 w-px h-3 bg-orange-200 hidden" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 지원 CTA 배너 */}
        <div className="recruit-cta mt-14 bg-slate-900 rounded-2xl p-8 md:p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">一緒に働きませんか？</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
            ITで社会に価値を届けたい方、成長したい方を歓迎します。<br />
            必要書類をメールにてお送りください。担当者よりご連絡いたします。
          </p>
          <a
            href="mailto:recruit@mountain-info.co.jp"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 text-white font-semibold rounded-xl
                       hover:bg-orange-400 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            recruit@mountain-info.co.jp へ応募する
          </a>
          <p className="text-slate-500 text-xs mt-4">
            {activeTab === "新卒採用" ? "必要書類：履歴書、資格証" : "必要書類：履歴書、職務経歴書、資格証"}
          </p>
        </div>

      </div>
    </section>
  );
}
