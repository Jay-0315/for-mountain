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

type GridPoint = {
  x: number;
  y: number;
};

type GridCoord = {
  col: number;
  row: number;
};

type BurstRunner = {
  trailIndex: number;
  progress: number;
  speed: number;
  length: number;
  delayFrames: number;
  active: boolean;
};

const GRID_SIZE = 44;
const RUNNER_CELL_SIZE = 28;
const RUNNER_CELL_OFFSET_X = 10;
const RUNNER_CELL_OFFSET_Y = 8;
const HERO_STAGE_DELAY_MS = 0;
const HERO_STAGE_DELAY_S = HERO_STAGE_DELAY_MS / 1000;
const HERO_STAGE_DELAY_FRAMES = Math.round((HERO_STAGE_DELAY_MS / 1000) * 60);
const GRID_RUNNERS = [
  { length: 6, speed: 0.085, offset: 0 },
  { length: 7, speed: 0.092, offset: -18 },
  { length: 6, speed: 0.078, offset: -34 },
  { length: 7, speed: 0.072, offset: -12 },
  { length: 6, speed: 0.075, offset: -28 },
] as const;

function appendSegment(path: GridCoord[], next: GridCoord) {
  const last = path[path.length - 1];
  if (!last) {
    path.push(next);
    return;
  }

  const colStep = Math.sign(next.col - last.col);
  const rowStep = Math.sign(next.row - last.row);
  let currentCol = last.col;
  let currentRow = last.row;

  while (currentCol !== next.col || currentRow !== next.row) {
    if (currentCol !== next.col) currentCol += colStep;
    else if (currentRow !== next.row) currentRow += rowStep;
    path.push({ col: currentCol, row: currentRow });
  }
}

function toPixelTrail(path: GridCoord[]): GridPoint[] {
  return path.map((point) => ({
    x: point.col * GRID_SIZE,
    y: point.row * GRID_SIZE,
  }));
}

function buildRunnerTrails(width: number, height: number) {
  const overscan = 6;
  const cols = Math.max(20, Math.ceil(width / GRID_SIZE));
  const rows = Math.max(12, Math.ceil(height / GRID_SIZE));
  const rowA = Math.max(2, Math.floor(rows * 0.22));
  const rowB = Math.max(rowA + 2, Math.floor(rows * 0.42));
  const rowC = Math.max(rowB + 2, Math.floor(rows * 0.62));
  const rowD = Math.max(rowC + 1, Math.floor(rows * 0.76));
  const colA = Math.max(8, Math.floor(cols * 0.3));
  const colB = Math.max(colA + 5, Math.floor(cols * 0.52));
  const colC = Math.max(colB + 4, Math.floor(cols * 0.7));

  const runner1: GridCoord[] = [{ col: -overscan, row: rowA }];
  appendSegment(runner1, { col: colA, row: rowA });
  appendSegment(runner1, { col: colA, row: rowB });
  appendSegment(runner1, { col: cols + overscan, row: rowB });

  const runner2: GridCoord[] = [{ col: cols + overscan, row: rowB + 1 }];
  appendSegment(runner2, { col: colC, row: rowB + 1 });
  appendSegment(runner2, { col: colC, row: rowA + 2 });
  appendSegment(runner2, { col: -overscan, row: rowA + 1 });

  const runner3: GridCoord[] = [{ col: -overscan, row: rowC }];
  appendSegment(runner3, { col: colB, row: rowC });
  appendSegment(runner3, { col: colB, row: rowD });
  appendSegment(runner3, { col: colC, row: rowD });
  appendSegment(runner3, { col: colC, row: rowC });
  appendSegment(runner3, { col: cols + overscan, row: rowC });

  const runner4: GridCoord[] = [{ col: Math.max(4, Math.floor(cols * 0.22)), row: -overscan }];
  appendSegment(runner4, { col: Math.max(4, Math.floor(cols * 0.22)), row: rowB });
  appendSegment(runner4, { col: Math.max(6, Math.floor(cols * 0.34)), row: rowB });
  appendSegment(runner4, { col: Math.max(6, Math.floor(cols * 0.34)), row: rows + overscan });

  const runner5: GridCoord[] = [{ col: Math.max(10, Math.floor(cols * 0.78)), row: rows + overscan }];
  appendSegment(runner5, { col: Math.max(10, Math.floor(cols * 0.78)), row: rowC });
  appendSegment(runner5, { col: Math.max(8, Math.floor(cols * 0.66)), row: rowC });
  appendSegment(runner5, { col: Math.max(8, Math.floor(cols * 0.66)), row: -overscan });

  return [runner1, runner2, runner3, runner4, runner5].map(toPixelTrail);
}

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

    let snakeTrails = buildRunnerTrails(window.innerWidth, window.innerHeight);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      snakeTrails = buildRunnerTrails(window.innerWidth, window.innerHeight);
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
    const snakeProgress = GRID_RUNNERS.map((runner) => runner.offset);
    const burstRunners: BurstRunner[] = Array.from({ length: 34 }, (_, index) => ({
      trailIndex: index % GRID_RUNNERS.length,
      progress: -8 - index * 1.6,
      speed: 0.34 + (index % 5) * 0.03,
      length: 2 + (index % 3),
      delayFrames: HERO_STAGE_DELAY_FRAMES + 18 + index * 2,
      active: true,
    }));
    const pointer = {
      x: window.innerWidth * 0.62,
      y: window.innerHeight * 0.4,
      tx: window.innerWidth * 0.62,
      ty: window.innerHeight * 0.4,
    };
    let frameCount = 0;
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
      frameCount += 1;

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

      snakeTrails.forEach((trail, snakeIndex) => {
        const runner = GRID_RUNNERS[snakeIndex];
        if (!runner) return;

        snakeProgress[snakeIndex] += runner.speed;
        if (snakeProgress[snakeIndex] > trail.length + runner.length + 4) {
          snakeProgress[snakeIndex] = -12;
        }

        for (let cellIndex = 0; cellIndex < runner.length; cellIndex += 1) {
          const trailIndex = Math.floor(snakeProgress[snakeIndex]) - cellIndex;
          if (trailIndex < 0 || trailIndex >= trail.length) continue;

          const point = trail[trailIndex];
          const alpha = 0.055 + (runner.length - cellIndex) * 0.028;
          ctx.fillStyle = `rgba(253,186,116,${alpha})`;
          ctx.fillRect(
            Math.round(point.x + RUNNER_CELL_OFFSET_X),
            Math.round(point.y + RUNNER_CELL_OFFSET_Y),
            RUNNER_CELL_SIZE,
            RUNNER_CELL_SIZE
          );
        }
      });

      burstRunners.forEach((runner) => {
        if (!runner.active || frameCount < runner.delayFrames) return;
        const trail = snakeTrails[runner.trailIndex];
        if (!trail) return;

        runner.progress += runner.speed;

        for (let cellIndex = 0; cellIndex < runner.length; cellIndex += 1) {
          const trailIndex = Math.floor(runner.progress) - cellIndex;
          if (trailIndex < 0 || trailIndex >= trail.length) continue;

          const point = trail[trailIndex];
          const alpha = 0.08 + (runner.length - cellIndex) * 0.04;
          ctx.fillStyle = `rgba(253,186,116,${alpha})`;
          ctx.fillRect(
            Math.round(point.x + RUNNER_CELL_OFFSET_X),
            Math.round(point.y + RUNNER_CELL_OFFSET_Y),
            RUNNER_CELL_SIZE,
            RUNNER_CELL_SIZE
          );
        }

        if (runner.progress > trail.length + runner.length + 2) {
          runner.active = false;
        }
      });

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

      gsap.set(
        [".hero-badge", ".hero-title-line1", ".hero-title-line2", ".hero-typing", ".hero-cta-1", ".hero-scroll"],
        { opacity: 0, y: 30 }
      );
      gsap.set(".hero-sub", { opacity: 0, y: 20 });
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
        .to(".hero-badge", { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
        .to(".hero-title-line1", { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .to(".hero-typing", { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
        .to(".hero-title-line2", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.6")
        .to(".hero-cta-1", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
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
        <div className="hero-badge mb-8 inline-flex min-h-[4.75rem] items-center gap-4 rounded-[999px] border border-orange-300/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(251,146,60,0.12))] px-6 py-3.5 text-sm font-medium text-orange-100 shadow-[0_14px_36px_rgba(15,23,42,0.2)] backdrop-blur-md md:px-8">
          <span className="h-3 w-3 shrink-0 rounded-full bg-orange-300 shadow-[0_0_16px_rgba(251,146,60,0.28)]" />
          <span className="pb-[0.08em] text-[1.7rem] font-bold leading-[1.15] text-orange-50 md:text-[2rem]">
            IT Integrator Company
          </span>
        </div>

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
            className="hero-cta-1 public-elevated inline-flex min-h-[4.75rem] items-center justify-center gap-4 rounded-2xl border border-orange-300/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(251,146,60,0.12))] px-8 py-3.5 text-[1.15rem] font-bold text-orange-50 shadow-[0_14px_36px_rgba(15,23,42,0.2)] backdrop-blur-md transition-[transform,box-shadow,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-orange-300/28 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(251,146,60,0.16))] hover:shadow-[0_20px_40px_rgba(15,23,42,0.24)] md:px-10"
          >
            <span className="h-3 w-3 shrink-0 rounded-full bg-orange-300 shadow-[0_0_16px_rgba(251,146,60,0.28)]" />
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
