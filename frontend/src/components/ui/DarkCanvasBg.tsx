"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

/* ─── types ─────────────────────────────────────── */
type Particle  = { x:number; y:number; vx:number; vy:number; radius:number; alpha:number };
type Ripple    = { x:number; y:number; radius:number; alpha:number; speed:number };
type GridPoint = { x:number; y:number };
type GridCoord = { col:number; row:number };

/* ─── constants ──────────────────────────────────── */
const GRID_SIZE          = 44;
const RUNNER_CELL_SIZE   = 28;
const RUNNER_CELL_OFFSET = { x: 10, y: 8 };
const GRID_RUNNERS = [
  { length:6, speed:0.085, offset:0   },
  { length:7, speed:0.092, offset:-18 },
  { length:6, speed:0.078, offset:-34 },
  { length:7, speed:0.072, offset:-12 },
  { length:6, speed:0.075, offset:-28 },
] as const;

const AMBIENT_LINES = [
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

/* ─── helpers ────────────────────────────────────── */
function appendSegment(path: GridCoord[], next: GridCoord) {
  const last = path[path.length - 1];
  if (!last) { path.push(next); return; }
  let col = last.col, row = last.row;
  while (col !== next.col || row !== next.row) {
    if (col !== next.col) col += Math.sign(next.col - col);
    else row += Math.sign(next.row - row);
    path.push({ col, row });
  }
}
function toPixel(path: GridCoord[]): GridPoint[] {
  return path.map(p => ({ x: p.col * GRID_SIZE, y: p.row * GRID_SIZE }));
}
function buildTrails(w: number, h: number) {
  const os = 6;
  const cols = Math.max(20, Math.ceil(w / GRID_SIZE));
  const rows = Math.max(12, Math.ceil(h / GRID_SIZE));
  const rA = Math.max(2,       Math.floor(rows * 0.22));
  const rB = Math.max(rA+2,    Math.floor(rows * 0.42));
  const rC = Math.max(rB+2,    Math.floor(rows * 0.62));
  const rD = Math.max(rC+1,    Math.floor(rows * 0.76));
  const cA = Math.max(8,       Math.floor(cols * 0.30));
  const cB = Math.max(cA+5,    Math.floor(cols * 0.52));
  const cC = Math.max(cB+4,    Math.floor(cols * 0.70));

  const t1: GridCoord[] = [{ col:-os, row:rA }];
  appendSegment(t1, { col:cA, row:rA }); appendSegment(t1, { col:cA, row:rB }); appendSegment(t1, { col:cols+os, row:rB });

  const t2: GridCoord[] = [{ col:cols+os, row:rB+1 }];
  appendSegment(t2, { col:cC, row:rB+1 }); appendSegment(t2, { col:cC, row:rA+2 }); appendSegment(t2, { col:-os, row:rA+1 });

  const t3: GridCoord[] = [{ col:-os, row:rC }];
  appendSegment(t3, { col:cB, row:rC }); appendSegment(t3, { col:cB, row:rD }); appendSegment(t3, { col:cC, row:rD }); appendSegment(t3, { col:cC, row:rC }); appendSegment(t3, { col:cols+os, row:rC });

  const t4: GridCoord[] = [{ col:Math.max(4,Math.floor(cols*0.22)), row:-os }];
  appendSegment(t4, { col:Math.max(4,Math.floor(cols*0.22)), row:rB }); appendSegment(t4, { col:Math.max(6,Math.floor(cols*0.34)), row:rB }); appendSegment(t4, { col:Math.max(6,Math.floor(cols*0.34)), row:rows+os });

  const t5: GridCoord[] = [{ col:Math.max(10,Math.floor(cols*0.78)), row:rows+os }];
  appendSegment(t5, { col:Math.max(10,Math.floor(cols*0.78)), row:rC }); appendSegment(t5, { col:Math.max(8,Math.floor(cols*0.66)), row:rC }); appendSegment(t5, { col:Math.max(8,Math.floor(cols*0.66)), row:-os });

  return [t1,t2,t3,t4,t5].map(toPixel);
}

/* ─── component ──────────────────────────────────── */
export default function DarkCanvasBg() {
  const wrapRef        = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const ambientRef     = useRef<HTMLDivElement>(null);
  const blob1Ref       = useRef<HTMLDivElement>(null);
  const blob2Ref       = useRef<HTMLDivElement>(null);

  /* canvas animation */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let trails = buildTrails(wrap.offsetWidth, wrap.offsetHeight);

    const resize = () => {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
      trails = buildTrails(wrap.offsetWidth, wrap.offsetHeight);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const particles: Particle[] = Array.from({ length:80 }, () => ({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      vx:     (Math.random() - 0.5) * 0.5,
      vy:     (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.8 + 0.4,
      alpha:  Math.random() * 0.45 + 0.1,
    }));

    const ripples: Ripple[] = [];
    const snakeProgress = GRID_RUNNERS.map(r => r.offset);

    const pointer = {
      x: canvas.width * 0.62, y: canvas.height * 0.4,
      tx: canvas.width * 0.62, ty: canvas.height * 0.4,
    };
    let introPulse = 0, rippleTick = 0;

    const addRipple = (x:number, y:number, speed=1.6) =>
      ripples.push({ x, y, radius:20, alpha:0.22, speed });

    const addAmbient = () => {
      const mx = canvas.width  * 0.12, my = canvas.height * 0.14;
      addRipple(mx + Math.random()*(canvas.width-mx*2), my + Math.random()*(canvas.height-my*2), 1.1+Math.random()*0.9);
    };
    addAmbient(); addAmbient();

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    };
    wrap.addEventListener("mousemove", onMove);

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      introPulse += 0.015;
      rippleTick += 1;

      /* radial glow under pointer */
      const cg = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.min(canvas.width, canvas.height)*0.4);
      cg.addColorStop(0, "rgba(251,146,60,0.16)");
      cg.addColorStop(0.42, "rgba(249,115,22,0.08)");
      cg.addColorStop(1, "rgba(15,23,42,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      /* ripples */
      for (let i = ripples.length-1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed; r.alpha *= 0.985;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(253,186,116,${r.alpha})`;
        ctx.lineWidth = 1.2; ctx.stroke();
        if (r.alpha < 0.03) ripples.splice(i,1);
      }
      if (rippleTick % 72 === 0) addAmbient();

      /* wave bands */
      for (let i = 0; i < 7; i++) {
        const by = canvas.height * (0.14 + i*0.13);
        const wv = Math.sin(introPulse*1.8 + i*0.7) * 18;
        const bg = ctx.createLinearGradient(0, by, canvas.width, by+wv);
        bg.addColorStop(0,   "rgba(251,146,60,0)");
        bg.addColorStop(0.4, `rgba(251,146,60,${0.015+i*0.004})`);
        bg.addColorStop(0.6, `rgba(253,186,116,${0.025+i*0.004})`);
        bg.addColorStop(1,   "rgba(251,146,60,0)");
        ctx.beginPath(); ctx.strokeStyle = bg; ctx.lineWidth = 1;
        ctx.moveTo(0, by+wv);
        ctx.bezierCurveTo(canvas.width*0.28, by-wv, canvas.width*0.62, by+wv, canvas.width, by-wv*0.6);
        ctx.stroke();
      }

      /* grid runners */
      trails.forEach((trail, si) => {
        const runner = GRID_RUNNERS[si]; if (!runner) return;
        snakeProgress[si] += runner.speed;
        if (snakeProgress[si] > trail.length + runner.length + 4) snakeProgress[si] = -12;
        for (let ci = 0; ci < runner.length; ci++) {
          const ti = Math.floor(snakeProgress[si]) - ci;
          if (ti < 0 || ti >= trail.length) continue;
          const pt = trail[ti];
          ctx.fillStyle = `rgba(253,186,116,${0.055+(runner.length-ci)*0.028})`;
          ctx.fillRect(Math.round(pt.x+RUNNER_CELL_OFFSET.x), Math.round(pt.y+RUNNER_CELL_OFFSET.y), RUNNER_CELL_SIZE, RUNNER_CELL_SIZE);
        }
      });

      /* particles + connection lines */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        for (let j = i+1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x-q.x, dy = p.y-q.y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 130) {
            const pd = Math.hypot((p.x+q.x)/2-pointer.x, (p.y+q.y)/2-pointer.y);
            const boost = Math.max(0, 1-pd/280)*0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(251,146,60,${(1-dist/130)*(0.12+boost)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          }
        }
        const pd = Math.hypot(p.x-pointer.x, p.y-pointer.y);
        const boost = Math.max(0, 1-pd/260);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius+boost*1.4, 0, Math.PI*2);
        ctx.fillStyle = `rgba(251,146,60,${p.alpha+boost*0.24})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      wrap.removeEventListener("mousemove", onMove);
    };
  }, []);

  /* ambient code snippets */
  useEffect(() => {
    const layer = ambientRef.current;
    if (!layer) return;
    const snippets = new Set<HTMLDivElement>();

    const spawn = () => {
      const el = document.createElement("div");
      const count = 2 + Math.floor(Math.random()*3);
      const lines = [...AMBIENT_LINES].sort(()=>Math.random()-0.5).slice(0,count);
      el.className = "pointer-events-none absolute font-mono text-[9px] leading-5 tracking-[0.08em] text-orange-300/18 md:text-[11px]";
      el.style.left    = `${8  + Math.random()*72}%`;
      el.style.top     = `${10 + Math.random()*72}%`;
      el.style.opacity = "0";
      el.style.transform = "translate3d(0,10px,0)";
      lines.forEach(line => {
        const row = document.createElement("div");
        row.className   = "whitespace-nowrap drop-shadow-[0_0_8px_rgba(249,115,22,0.12)]";
        row.dataset.line = line;
        row.textContent  = "";
        el.appendChild(row);
      });
      layer.appendChild(el); snippets.add(el);

      const rows = Array.from(el.children) as HTMLDivElement[];
      const tl = gsap.timeline({ onComplete: () => { snippets.delete(el); el.remove(); } });
      tl.to(el, { opacity:1, y:0, duration:0.28, ease:"power2.out" });
      rows.forEach((row, ri) => {
        tl.to(row, { duration: 0.34+row.dataset.line!.length*0.012, text:{ value:row.dataset.line??"", delimiter:"" }, ease:"none" }, ri===0?"<":">-0.02");
      });
      tl.to(el, { opacity:0, y:-18, duration:1.2, ease:"power1.inOut" }, "+=0.6");
    };

    spawn(); spawn();
    const id = window.setInterval(spawn, 2200);
    return () => { window.clearInterval(id); snippets.forEach(s=>s.remove()); };
  }, []);

  /* blob mouse parallax */
  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const xR = ((e.clientX-rect.left)/rect.width  - 0.5) * 2;
      const yR = ((e.clientY-rect.top) /rect.height - 0.5) * 2;
      gsap.to(blob1Ref.current, { x:xR*40, y:yR*28, duration:1.4, ease:"power2.out" });
      gsap.to(blob2Ref.current, { x:xR*-28, y:yR*-20, duration:1.8, ease:"power2.out" });
    };
    wrap.addEventListener("mousemove", onMove);
    return () => wrap.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* blobs */}
      <div ref={blob1Ref} className="absolute top-[18%] left-[18%] h-[420px] w-[420px] rounded-full bg-orange-500/14 blur-3xl" />
      <div ref={blob2Ref} className="absolute bottom-[18%] right-[16%] h-[340px] w-[340px] rounded-full bg-amber-400/10 blur-3xl" />

      {/* grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* ambient code */}
      <div ref={ambientRef} className="absolute inset-0 z-[1] overflow-hidden" />
    </div>
  );
}
