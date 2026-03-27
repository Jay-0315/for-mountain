"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MarkdownContent from "@/components/ui/MarkdownContent";

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    key: "VALUE",
    ja: "価値創造",
    color: "bg-yellow-400",
    glow: "rgba(250,204,21,1)",
    glowSoft: "rgba(250,204,21,0.35)",
    icon: (
      <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "HARMONY",
    ja: "環境と変化との調和",
    color: "bg-emerald-500",
    glow: "rgba(16,185,129,1)",
    glowSoft: "rgba(16,185,129,0.35)",
    icon: (
      <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    key: "CHALLENGE",
    ja: "絶え間ない挑戦",
    color: "bg-rose-500",
    glow: "rgba(244,63,94,1)",
    glowSoft: "rgba(244,63,94,0.35)",
    icon: (
      <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    key: "TRUST",
    ja: "人と社会との信頼",
    color: "bg-orange-500",
    glow: "rgba(249,115,22,1)",
    glowSoft: "rgba(249,115,22,0.35)",
    icon: (
      <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const SERVICE_PANELS = [
  {
    label: "System Development / SES",
    title: "システム開発・SES事業",
    body:
      "- 要件定義から開発まで対応\n- 運用保守まで一貫支援\n- 最適なSESサービスを提供",
  },
  {
    label: "Network Build / Operations",
    title: "ネットワーク構築・運用支援",
    body:
      "- 通信機器の導入と設定\n- 監視・保守・障害対応を支援\n- 安定したネットワーク環境を実現",
  },
  {
    label: "Infrastructure / IT Consulting",
    title: "インフラ構築とITコンサルティング",
    body:
      "- サーバー・クラウド構築に対応\n- セキュリティを含む基盤設計\n- ITコンサルティングで最適化",
  },
] as const;

export default function ValuesStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        itemRefs.current,
        { opacity: 0, y: 50, scale: 0.75 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.4)",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        panelRefs.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: panelRefs.current[0],
            start: "top 84%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        @keyframes neon-breathe {
          0%, 100% {
            box-shadow:
              0 0 6px var(--neon),
              0 0 18px var(--neon),
              0 0 40px var(--neon-soft),
              0 0 70px var(--neon-soft);
          }
          50% {
            box-shadow:
              0 0 2px var(--neon),
              0 0 6px var(--neon),
              0 0 12px var(--neon-soft),
              0 0 20px var(--neon-soft);
          }
        }
      `}</style>

      <section ref={sectionRef} className="relative z-10 py-32">
        <div className="mx-auto max-w-7xl px-10 lg:px-20">
          <div className="grid grid-cols-2 gap-16 sm:grid-cols-4 sm:gap-20">
            {values.map((v, i) => (
              <div
                key={v.key}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full ${v.color}`}
                  style={{
                    "--neon": v.glow,
                    "--neon-soft": v.glowSoft,
                    animation: `neon-breathe 3s ease-in-out infinite`,
                    animationDelay: `${i * 0.75}s`,
                  } as React.CSSProperties}
                >
                  {v.icon}
                </div>
                <p className="text-sm font-extrabold tracking-widest text-white">{v.key}</p>
                <p className="text-sm text-slate-400">{v.ja}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-20 grid max-w-6xl gap-5 text-left md:grid-cols-2 xl:grid-cols-3">
            {SERVICE_PANELS.map((panel, index) => (
              <article
                key={panel.title}
                ref={(el) => {
                  panelRefs.current[index] = el;
                }}
                className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] p-6 shadow-[0_18px_44px_rgba(2,6,23,0.22)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 flex min-h-[2.75rem] items-start">
                  <p className="inline-flex whitespace-nowrap rounded-2xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-200">
                    {panel.label}
                  </p>
                </div>
                <h2 className="min-h-[3.5rem] text-lg font-bold leading-snug text-white md:text-[1.15rem]">
                  {panel.title}
                </h2>
                <MarkdownContent
                  content={panel.body}
                  className="mt-4 space-y-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-[15px] [&_ul]:leading-7 [&_ul]:text-slate-300 [&_li]:marker:text-orange-300"
                />
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
