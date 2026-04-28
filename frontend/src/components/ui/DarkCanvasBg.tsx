"use client";

import { useEffect, useRef } from "react";

/* ─── types ─────────────────────────────────────── */
type Particle  = { x:number; y:number; vx:number; vy:number; radius:number; alpha:number };
type Ripple    = { x:number; y:number; radius:number; alpha:number; speed:number };

/* ─── component ──────────────────────────────────── */
export default function DarkCanvasBg() {
  const wrapRef        = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);

  /* canvas animation */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
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
    let introPulse = 0, rippleTick = 0;

    const addRipple = (x:number, y:number, speed=1.6) =>
      ripples.push({ x, y, radius:20, alpha:0.22, speed });

    const addAmbient = () => {
      const mx = canvas.width  * 0.12, my = canvas.height * 0.14;
      addRipple(mx + Math.random()*(canvas.width-mx*2), my + Math.random()*(canvas.height-my*2), 1.1+Math.random()*0.9);
    };
    addAmbient(); addAmbient();

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      introPulse += 0.015;
      rippleTick += 1;

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
            ctx.beginPath();
            ctx.strokeStyle = `rgba(251,146,60,${(1-dist/130)*0.12})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fillStyle = `rgba(251,146,60,${p.alpha})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* blobs */}
      <div className="absolute top-[18%] left-[18%] h-[420px] w-[420px] rounded-full bg-orange-500/14 blur-3xl" />
      <div className="absolute bottom-[18%] right-[16%] h-[340px] w-[340px] rounded-full bg-amber-400/10 blur-3xl" />

      {/* grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}
