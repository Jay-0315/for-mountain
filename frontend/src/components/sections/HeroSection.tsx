"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
};

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);

  // ── Canvas Particle 배경 ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.45 + 0.1,
    }));

    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // 근접 연결선
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(251,146,60,${(1 - dist / 130) * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // 파티클 점
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,146,60,${p.alpha})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── 마우스 패럴랙스 (Blob) ─────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xR = (e.clientX / window.innerWidth - 0.5) * 2;
      const yR = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(blobRef1.current, {
        x: xR * 50,
        y: yR * 35,
        duration: 1.4,
        ease: "power2.out",
      });
      gsap.to(blobRef2.current, {
        x: xR * -35,
        y: yR * -25,
        duration: 1.8,
        ease: "power2.out",
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ── GSAP 타임라인 + TextPlugin ────────────────────────────────
  useGSAP(
    () => {
      gsap.registerPlugin(TextPlugin);

      // 초기 상태
      gsap.set(
        [".hero-badge", ".hero-title-line1", ".hero-cta-1", ".hero-cta-2", ".hero-scroll"],
        { opacity: 0, y: 30 }
      );
      gsap.set(".hero-sub", { opacity: 0, y: 20 });
      gsap.set(".hero-typing", { opacity: 0 });
      gsap.set(".hero-stats", { opacity: 0, y: 20 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".hero-badge", { opacity: 1, y: 0, duration: 0.7 })
        .to(".hero-title-line1", { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .to(
          ".hero-typing",
          {
            opacity: 1,
            duration: 0.1,
          },
          "-=0.2"
        )
        .to(
          ".hero-typing",
          {
            duration: 1.6,
            text: { value: "お客様を幸せに", delimiter: "" },
            ease: "none",
          },
          "<"
        )
        .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.6")
        .to(".hero-cta-1", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to(".hero-cta-2", { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
        .to(".hero-stats", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
        .to(".hero-scroll", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* Canvas Particle 배경 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Blob 그라디언트 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          ref={blobRef1}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-3xl"
        />
        <div
          ref={blobRef2}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* 그리드 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* 배지 */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          IT総合カンパニー
        </div>

        {/* 헤드라인 */}
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          <span className="hero-title-line1 block">　ITで、</span>
          <span className="hero-typing block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 min-h-[1.2em]" />
        </h1>

        {/* 서브텍스트 */}
        <p className="hero-sub text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          株式会社マウンテンは「IT開発」と「ネットワークエンジニアリング」に
          イノベーションを起こし、お客様のビジネス成長を支援します。
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="hero-cta-1 px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-400 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            お問い合わせはこちら
          </a>
          <a
            href="#services"
            className="hero-cta-2 px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:-translate-y-0.5 transition-all"
          >
            事業内容を見る
          </a>
        </div>

        {/* 통계 */}
        <div className="hero-stats mt-16 flex flex-col sm:flex-row justify-center gap-10 text-center">
          {[
            { value: "ｎ", label: "プロジェクト実績" },
            { value: "100%", label: "顧客満足度" },
            { value: "ｎ年", label: "業界実績" },
          ].map((s) => (
            <div key={s.label} className="group w-32">
              <p className="text-3xl font-bold text-white group-hover:text-orange-400 transition-colors">
                {s.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
