"use client";

import { useEffect, useRef } from "react";

type GridCoord = {
  col: number;
  row: number;
};

type GridPoint = {
  x: number;
  y: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
};

const GRID_SIZE = 44;
const RUNNER_CELL_SIZE = 28;
const RUNNER_CELL_OFFSET_X = 10;
const RUNNER_CELL_OFFSET_Y = 8;
const RUNNERS = [
  { length: 5, speed: 0.06, offset: 0 },
  { length: 6, speed: 0.065, offset: -14 },
  { length: 5, speed: 0.058, offset: -24 },
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
  const overscan = 5;
  const cols = Math.max(14, Math.ceil(width / GRID_SIZE));
  const rows = Math.max(6, Math.ceil(height / GRID_SIZE));
  const rowA = Math.max(1, Math.floor(rows * 0.28));
  const rowB = Math.max(rowA + 1, Math.floor(rows * 0.52));
  const rowC = Math.max(rowB + 1, Math.floor(rows * 0.72));
  const colA = Math.max(5, Math.floor(cols * 0.34));
  const colB = Math.max(colA + 3, Math.floor(cols * 0.62));

  const runner1: GridCoord[] = [{ col: -overscan, row: rowA }];
  appendSegment(runner1, { col: colA, row: rowA });
  appendSegment(runner1, { col: colA, row: rowB });
  appendSegment(runner1, { col: cols + overscan, row: rowB });

  const runner2: GridCoord[] = [{ col: cols + overscan, row: rowB }];
  appendSegment(runner2, { col: colB, row: rowB });
  appendSegment(runner2, { col: colB, row: rowA });
  appendSegment(runner2, { col: -overscan, row: rowA });

  const runner3: GridCoord[] = [{ col: -overscan, row: rowC }];
  appendSegment(runner3, { col: colA, row: rowC });
  appendSegment(runner3, { col: colA, row: rowB });
  appendSegment(runner3, { col: cols + overscan, row: rowB });

  return [runner1, runner2, runner3].map(toPixelTrail);
}

export default function GridRunnerBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let trails = buildRunnerTrails(window.innerWidth, 260);
    const progress = RUNNERS.map((runner) => runner.offset);
    const particles: Particle[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * 260,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.3 + 0.6,
      alpha: Math.random() * 0.2 + 0.06,
    }));
    let rafId = 0;

    const resize = () => {
      const host = canvas.parentElement;
      if (!host) return;
      canvas.width = host.clientWidth;
      canvas.height = host.clientHeight;
      trails = buildRunnerTrails(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(251,146,60,${(1 - dist / 110) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253,186,116,${p.alpha})`;
        ctx.fill();
      }

      trails.forEach((trail, index) => {
        const runner = RUNNERS[index];
        if (!runner) return;
        progress[index] += runner.speed;
        if (progress[index] > trail.length + runner.length + 2) {
          progress[index] = -10;
        }

        for (let cellIndex = 0; cellIndex < runner.length; cellIndex += 1) {
          const trailIndex = Math.floor(progress[index]) - cellIndex;
          if (trailIndex < 0 || trailIndex >= trail.length) continue;

          const point = trail[trailIndex];
          const alpha = 0.04 + (runner.length - cellIndex) * 0.02;
          ctx.fillStyle = `rgba(253,186,116,${alpha})`;
          ctx.fillRect(
            Math.round(point.x + RUNNER_CELL_OFFSET_X),
            Math.round(point.y + RUNNER_CELL_OFFSET_Y),
            RUNNER_CELL_SIZE,
            RUNNER_CELL_SIZE
          );
        }
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute inset-0">
        <span className="public-soft-float absolute left-[14%] top-[22%] h-2 w-2 rounded-full bg-orange-300/35" />
        <span className="public-soft-float-delay absolute left-[28%] top-[64%] h-1.5 w-1.5 rounded-full bg-amber-200/30" />
        <span className="public-soft-float absolute right-[18%] top-[28%] h-2.5 w-2.5 rounded-full bg-orange-200/26" />
        <span className="public-soft-float-delay absolute right-[26%] bottom-[18%] h-1.5 w-1.5 rounded-full bg-orange-300/32" />
        <span className="public-soft-float absolute left-[52%] top-[18%] h-1.5 w-1.5 rounded-full bg-amber-100/28" />
        <span className="public-soft-float-delay absolute left-[62%] bottom-[24%] h-2 w-2 rounded-full bg-orange-200/24" />
      </div>
    </>
  );
}
