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

type Ripple = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
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
const HERO_STAGE_DELAY_MS = 2600;
const HERO_STAGE_DELAY_S = HERO_STAGE_DELAY_MS / 1000;
const HERO_STAGE_DELAY_FRAMES = Math.round((HERO_STAGE_DELAY_MS / 1000) * 60);
const GRID_RUNNERS = [
  { length: 6, speed: 0.085, offset: 0 },
  { length: 7, speed: 0.092, offset: -18 },
  { length: 6, speed: 0.078, offset: -34 },
  { length: 7, speed: 0.072, offset: -12 },
  { length: 6, speed: 0.075, offset: -28 },
] as const;
const HERO_CODE_LINES = [
  "const signal = deploy({ region: 'ap-southeast-2', edge: true, priority: 'hot' });",
  "mesh.route('/core/cluster', latency < 20 ? 'direct' : 'adaptive');",
  "stream.push({ layer: 'network', status: 'warm', drift: 0.14, health: 'stable' });",
  "observe(trace).filter(span => span.kind === 'client').map(sync).buffer(12);",
  "pipeline.stage('secure').attach(policy('zero-trust')).forward(packet);",
  "runtime.cache('/partners').revalidate({ burst: true, interval: 60 });",
  "orchestrator.link('services').fanOut({ replicas: 4, region: 'tokyo-edge' });",
  "telemetry.capture(event).tag('hero').sample(0.25).flush('realtime');",
  "gateway.handshake({ tls: '1.3', mode: 'strict', retry: exponential(3) });",
];
const HERO_AMBIENT_CODE_LINES = [
  "edge.sync(packet => packet.latency < 12);",
  "cache.prime('/news').staleWhileRevalidate();",
  "auth.rotate(keys).seal('session-token');",
  "cluster.balance({ mode: 'smart', floor: 3 });",
  "stream.window(32).flush('realtime');",
  "policy.attach('network').permit('internal');",
  "observe(span).tag('hero-background');",
  "queue.dispatch(job => job.priority === 'burst');",
  "telemetry.batch(24).ship('ap-southeast-2');",
  "proxy.route('/api').upgrade('http2');",
  "trace.merge(core, edge).compress();",
  "signal.emit('warmup').handoff('gateway');",
];

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
  const codeRainRef = useRef<HTMLDivElement>(null);
  const ambientCodeLayerRef = useRef<HTMLDivElement>(null);
  const glowRef1 = useRef<HTMLDivElement>(null);
  const glowRef2 = useRef<HTMLDivElement>(null);

  // ── Canvas Particle 배경 ──────────────────────────────────────
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
    const ripples: Ripple[] = [];
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
    let introPulse = 0;
    let rippleTick = 0;
    let frameCount = 0;

    let rafId: number;

    const addRipple = (x: number, y: number, speed = 1.6) => {
      ripples.push({ x, y, radius: 20, alpha: 0.22, speed });
    };

    const addAmbientRipple = () => {
      const marginX = canvas.width * 0.12;
      const marginY = canvas.height * 0.14;
      const x = marginX + Math.random() * (canvas.width - marginX * 2);
      const y = marginY + Math.random() * (canvas.height - marginY * 2);
      addRipple(x, y, 1.1 + Math.random() * 0.9);
    };

    addAmbientRipple();
    addAmbientRipple();

    const handlePointerMove = (event: MouseEvent) => {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
    };

    window.addEventListener("mousemove", handlePointerMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      introPulse += 0.015;
      rippleTick += 1;
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

      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed;
        ripple.alpha *= 0.985;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(253,186,116,${ripple.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (ripple.alpha < 0.03) {
          ripples.splice(i, 1);
        }
      }

      if (rippleTick % 72 === 0) {
        addAmbientRipple();
      }

      for (let i = 0; i < 7; i += 1) {
        const bandY = canvas.height * (0.14 + i * 0.13);
        const wave = Math.sin(introPulse * 1.8 + i * 0.7) * 18;
        const bandGradient = ctx.createLinearGradient(0, bandY, canvas.width, bandY + wave);
        bandGradient.addColorStop(0, "rgba(251,146,60,0)");
        bandGradient.addColorStop(0.4, `rgba(251,146,60,${0.015 + i * 0.004})`);
        bandGradient.addColorStop(0.6, `rgba(253,186,116,${0.025 + i * 0.004})`);
        bandGradient.addColorStop(1, "rgba(251,146,60,0)");

        ctx.beginPath();
        ctx.strokeStyle = bandGradient;
        ctx.lineWidth = 1;
        ctx.moveTo(0, bandY + wave);
        ctx.bezierCurveTo(
          canvas.width * 0.28,
          bandY - wave,
          canvas.width * 0.62,
          bandY + wave,
          canvas.width,
          bandY - wave * 0.6
        );
        ctx.stroke();
      }

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
            const pointerDist = Math.hypot((p.x + q.x) / 2 - pointer.x, (p.y + q.y) / 2 - pointer.y);
            const pointerBoost = Math.max(0, 1 - pointerDist / 280) * 0.18;
            ctx.strokeStyle = `rgba(251,146,60,${(1 - dist / 130) * (0.12 + pointerBoost)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // 파티클 점
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
    const layer = ambientCodeLayerRef.current;
    if (!layer) return;

    const snippets = new Set<HTMLDivElement>();
    const startedAt = Date.now();

    const spawnSnippet = () => {
      const snippet = document.createElement("div");
      const lineCount = 2 + Math.floor(Math.random() * 3);
      const available = [...HERO_AMBIENT_CODE_LINES].sort(() => Math.random() - 0.5).slice(0, lineCount);
      snippet.className = "pointer-events-none absolute font-mono text-[9px] leading-5 tracking-[0.08em] text-orange-300/55 md:text-[11px]";
      snippet.style.left = `${8 + Math.random() * 72}%`;
      snippet.style.top = `${10 + Math.random() * 72}%`;
      snippet.style.opacity = "0";
      snippet.style.transform = "translate3d(0, 10px, 0)";

      available.forEach((line) => {
        const row = document.createElement("div");
        row.className = "whitespace-nowrap drop-shadow-[0_0_8px_rgba(249,115,22,0.12)]";
        row.dataset.line = line;
        row.textContent = "";
        snippet.appendChild(row);
      });

      layer.appendChild(snippet);
      snippets.add(snippet);

      const rows = Array.from(snippet.children) as HTMLDivElement[];
      const snippetTimeline = gsap.timeline({
        onComplete: () => {
          snippets.delete(snippet);
          snippet.remove();
        },
      });

      snippetTimeline.to(snippet, {
        opacity: 1,
        y: 0,
        duration: 0.28,
        ease: "power2.out",
      });

      rows.forEach((row, rowIndex) => {
        snippetTimeline.to(
          row,
          {
            duration: 0.34 + row.dataset.line!.length * 0.012,
            text: { value: row.dataset.line ?? "", delimiter: "" },
            ease: "none",
          },
          rowIndex === 0 ? "<" : ">-0.02"
        );
      });

      snippetTimeline.to(
        snippet,
        {
          opacity: 0,
          y: -18,
          duration: 1.2,
          ease: "power1.inOut",
        },
        "+=0.6"
      );
    };

    const initialBurst = window.setTimeout(() => {
      spawnSnippet();
      spawnSnippet();
    }, HERO_STAGE_DELAY_MS + 400);
    const intervalStart = window.setTimeout(() => {
      spawnSnippet();
    }, HERO_STAGE_DELAY_MS + 1200);
    const intervalId = window.setInterval(() => {
      if (Date.now() - startedAt < HERO_STAGE_DELAY_MS) return;
      spawnSnippet();
    }, 2200);

    return () => {
      window.clearTimeout(initialBurst);
      window.clearTimeout(intervalStart);
      window.clearInterval(intervalId);
      snippets.forEach((snippet) => snippet.remove());
      snippets.clear();
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
      gsap.set([haloRef.current, codeRainRef.current], {
        opacity: 0,
        scale: 0.92,
      });
      gsap.set([glowRef1.current, glowRef2.current], {
        opacity: 0.22,
        scale: 1,
      });
      gsap.set(".hero-code-line", {
        opacity: 0,
        text: "",
      });
      gsap.set(".hero-code-mask", {
        opacity: 0,
        yPercent: -8,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: HERO_STAGE_DELAY_S,
      });
      const codeLines = gsap.utils.toArray<HTMLElement>(".hero-code-line");

      tl.to(haloRef.current, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" })
        .to(
          codeRainRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            ease: "power2.out",
          },
          "-=0.7"
        )
        .to(
          ".hero-code-mask",
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.24,
            ease: "power2.out",
          },
          "<"
        );

      codeLines.forEach((line, index) => {
        tl.to(
          line,
          {
            opacity: 0.94,
            duration: 0.08,
            ease: "power1.out",
          },
          index === 0 ? "<" : ">-0.03"
        ).to(
          line,
          {
            duration: 0.62,
            text: { value: HERO_CODE_LINES[index] ?? "", delimiter: "" },
            ease: "none",
          },
          "<"
        );
      });

      tl.to(
        ".hero-code-line",
        {
          opacity: 0.34,
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.inOut",
        },
        ">-0.05"
      )
        .to(".hero-code-mask", { opacity: 0, yPercent: 10, duration: 0.34 }, "<")
        .to(codeRainRef.current, { opacity: 0, duration: 0.24 }, "<")
        .to(".hero-badge", { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
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
        .to(".hero-scroll", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");

      gsap.to(haloRef.current, {
        scale: 1.04,
        opacity: 0.62,
        duration: 4.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glowRef1.current, {
        opacity: 0.12,
        scale: 1.1,
        x: 42,
        y: 20,
        duration: 5.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glowRef2.current, {
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#09111f_0%,#03070f_40%,#010309_100%)]"
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
          className="absolute top-[18%] left-[18%] h-[520px] w-[520px] rounded-full bg-orange-500/18 blur-3xl"
        />
        <div
          ref={blobRef2}
          className="absolute bottom-[18%] right-[16%] h-[420px] w-[420px] rounded-full bg-amber-400/14 blur-3xl"
        />
      </div>

      {/* 그리드 오버레이 */}
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
      <div
        ref={codeRainRef}
        className="pointer-events-none absolute left-[18%] right-[4%] top-1/2 z-[2] -translate-y-1/2 overflow-hidden md:left-[24%] md:right-[6%]"
      >
        <div className="hero-code-mask px-2 py-2 md:px-4">
          <div className="space-y-2 font-mono text-[10px] tracking-[0.06em] text-orange-300/95 md:text-[12px] md:tracking-[0.14em]">
            {HERO_CODE_LINES.map((line) => (
              <div key={line} className="hero-code-line whitespace-nowrap drop-shadow-[0_0_10px_rgba(249,115,22,0.16)]">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={ambientCodeLayerRef}
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      />

      <div ref={glowRef1} className="absolute left-1/2 top-[16%] h-[44vh] w-[22vw] -translate-x-[115%] rounded-full bg-gradient-to-br from-orange-400/8 via-orange-300/4 to-transparent blur-3xl pointer-events-none" />
      <div ref={glowRef2} className="absolute left-1/2 bottom-[22%] h-[38vh] w-[16vw] translate-x-[12%] rounded-full bg-gradient-to-tr from-amber-300/7 via-orange-300/4 to-transparent blur-3xl pointer-events-none" />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* 배지 */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-8 shadow-[0_10px_24px_rgba(249,115,22,0.08)] backdrop-blur-sm">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          IT総合カンパニー
        </div>

        {/* 헤드라인 */}
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          <span className="hero-title-line1 block">　ITで、</span>
          <span className="hero-typing block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 min-h-[1.2em]" />
        </h1>

        {/* 서브텍스트 */}
        <p className="hero-sub text-lg md:text-xl text-slate-200/88 max-w-2xl mx-auto mb-10 leading-relaxed">
          株式会社マウンテンは
          <span className="mx-1 bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">
            「IT開発」と「ネットワークエンジニアリング」
          </span>
          に
          <span className="mx-1 text-orange-200">イノベーション</span>
          を起こし、
          <span className="mx-1 text-amber-100">お客様のビジネス成長</span>
          を支援します。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#partners"
            className="hero-cta-1 public-elevated inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-orange-400/18 bg-[linear-gradient(135deg,rgba(251,146,60,0.2),rgba(249,115,22,0.1))] text-orange-50 font-semibold shadow-[0_18px_40px_rgba(249,115,22,0.14)] backdrop-blur-md transition-[transform,box-shadow,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-orange-300/28 hover:bg-[linear-gradient(135deg,rgba(251,146,60,0.24),rgba(249,115,22,0.14))] hover:shadow-[0_24px_48px_rgba(249,115,22,0.18)]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-orange-300 animate-pulse" />
            株式会社MOUNTAIN Partners
          </a>
          {/*<a*/}
          {/*  href="#services"*/}
          {/*  className="hero-cta-2 px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:-translate-y-0.5 transition-all"*/}
          {/*>*/}
          {/*  事業内容を見る*/}
          {/*</a>*/}
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
