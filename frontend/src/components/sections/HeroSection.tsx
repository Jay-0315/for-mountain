"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
};
const HERO_STAGE_DELAY_MS = 0;
const HERO_STAGE_DELAY_S = HERO_STAGE_DELAY_MS / 1000;

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const glowRef1 = useRef<HTMLDivElement>(null);
  const glowRef2 = useRef<HTMLDivElement>(null);

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
    const pointer = {
      x: window.innerWidth * 0.62,
      y: window.innerHeight * 0.4,
      tx: window.innerWidth * 0.62,
      ty: window.innerHeight * 0.4,
    };
    let rafId: number;

    const handlePointerMove = (event: MouseEvent) => {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
    };

    window.addEventListener("mousemove", handlePointerMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const centerGradient = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        Math.min(canvas.width, canvas.height) * 0.4
      );
      centerGradient.addColorStop(0, "rgba(251,146,60,0.16)");
      centerGradient.addColorStop(0.42, "rgba(249,115,22,0.08)");
      centerGradient.addColorStop(1, "rgba(15,23,42,0)");
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            const pointerDist = Math.hypot((p.x + q.x) / 2 - pointer.x, (p.y + q.y) / 2 - pointer.y);
            const pointerBoost = Math.max(0, 1 - pointerDist / 280) * 0.18;
            ctx.strokeStyle = `rgba(251,146,60,${(1 - dist / 130) * (0.12 + pointerBoost)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        const particleDist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        const particleBoost = Math.max(0, 1 - particleDist / 260);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + particleBoost * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,146,60,${p.alpha + particleBoost * 0.24})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const blob1 = blobRef1.current;
      const blob2 = blobRef2.current;
      if (!blob1 || !blob2) return;
      const xR = (e.clientX / window.innerWidth - 0.5) * 2;
      const yR = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(blob1, {
        x: xR * 50,
        y: yR * 35,
        duration: 1.4,
        ease: "power2.out",
      });
      gsap.to(blob2, {
        x: xR * -35,
        y: yR * -25,
        duration: 1.8,
        ease: "power2.out",
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useGSAP(
    () => {
      const halo = haloRef.current;
      const glow1 = glowRef1.current;
      const glow2 = glowRef2.current;
      if (!halo || !glow1 || !glow2) return;

      gsap.set(halo, {
        opacity: 0,
        scale: 0.92,
      });
      gsap.set([glow1, glow2], {
        opacity: 0.22,
        scale: 1,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: HERO_STAGE_DELAY_S,
      });

      tl.to(halo, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" })
        .to(".hero-scroll", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");

      gsap.to(halo, {
        scale: 1.04,
        opacity: 0.62,
        duration: 4.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glow1, {
        opacity: 0.12,
        scale: 1.1,
        x: 42,
        y: 20,
        duration: 5.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glow2, {
        opacity: 0.1,
        scale: 1.12,
        x: -56,
        y: -24,
        duration: 6.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative z-10 -mb-px min-h-screen flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="absolute inset-0 pointer-events-none">
        <div
          ref={blobRef1}
          className="absolute top-[18%] left-[18%] h-[520px] w-[520px] rounded-full bg-orange-500/18 blur-3xl"
        />
        <div
          ref={blobRef2}
          className="absolute bottom-[18%] right-[16%] h-[420px] w-[420px] rounded-full bg-amber-400/14 blur-3xl"
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div
        ref={haloRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/6 bg-[radial-gradient(circle,rgba(251,146,60,0.08)_0%,rgba(251,146,60,0.025)_36%,rgba(6,11,24,0)_74%)] blur-xl"
      />

      <div ref={glowRef1} className="absolute left-1/2 top-[16%] h-[44vh] w-[22vw] -translate-x-[115%] rounded-full bg-gradient-to-br from-orange-400/8 via-orange-300/4 to-transparent blur-3xl pointer-events-none" />
      <div ref={glowRef2} className="absolute left-1/2 bottom-[22%] h-[38vh] w-[16vw] translate-x-[12%] rounded-full bg-gradient-to-tr from-amber-300/7 via-orange-300/4 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="hero-badge mb-6 text-center text-base font-semibold uppercase tracking-[0.18em] md:text-lg">
          <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            IT Integrator Company
          </span>
        </p>

        <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
          <span className="hero-title-line1 block">　ITで、</span>
          <span className="hero-typing block min-h-[1.2em] bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            お客様を幸せに
          </span>
          <span className="hero-title-line2 mt-3 block bg-gradient-to-r from-orange-50 via-amber-100 to-orange-200 bg-clip-text text-3xl text-transparent md:text-5xl">
            人と社会に信頼を
          </span>
        </h1>

        <p className="hero-sub mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-200/88 md:text-xl">
          <span className="block whitespace-nowrap">
            <span className="text-orange-300">株式会社マウンテンは</span>
            <span className="ml-1 bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">
              ITソリューションとシステム開発に
            </span>
            <span className="ml-1 text-orange-200">イノベーションを起こし、</span>
          </span>
          <span className="block text-amber-100">お客様のビジネス成長を支援します。</span>
        </p>

        <div className="flex justify-center gap-4 sm:flex-row">
          <a
            href="#partners"
            className="hero-cta-1 public-elevated inline-flex items-center justify-center gap-3 rounded-xl border border-orange-400/18 bg-[linear-gradient(135deg,rgba(251,146,60,0.2),rgba(249,115,22,0.1))] px-8 py-4 font-semibold text-orange-50 shadow-[0_18px_40px_rgba(249,115,22,0.14)] backdrop-blur-md transition-[transform,box-shadow,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-orange-300/28 hover:bg-[linear-gradient(135deg,rgba(251,146,60,0.24),rgba(249,115,22,0.14))] hover:shadow-[0_24px_48px_rgba(249,115,22,0.18)]"
          >
            株式会社MOUNTAIN Partners
          </a>
        </div>
      </div>

      <div className="hero-scroll absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-slate-500">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-slate-500 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
