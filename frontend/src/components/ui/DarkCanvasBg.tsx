"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/* ─── types ─────────────────────────────────────── */
type Particle  = { x:number; y:number; vx:number; vy:number; radius:number; alpha:number };
type Ripple    = { x:number; y:number; radius:number; alpha:number; speed:number };

/* ─── component ──────────────────────────────────── */
export default function DarkCanvasBg() {
  const wrapRef        = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const blob1Ref       = useRef<HTMLDivElement>(null);
  const blob2Ref       = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);

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

    const syncPointer = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      pointer.tx = clientX - rect.left;
      pointer.ty = clientY - rect.top;
    };
    const onMove = (e: MouseEvent) => {
      lastPointerRef.current = { clientX: e.clientX, clientY: e.clientY };
      syncPointer(e.clientX, e.clientY);
    };
    const onViewportChange = () => {
      const lastPointer = lastPointerRef.current;
      if (!lastPointer) return;
      syncPointer(lastPointer.clientX, lastPointer.clientY);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);

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
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
    };
  }, []);

  /* blob mouse parallax */
  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const syncBlobPosition = (clientX: number, clientY: number) => {
      const blob1 = blob1Ref.current;
      const blob2 = blob2Ref.current;
      if (!blob1 || !blob2) return;
      const rect = wrap.getBoundingClientRect();
      const xR = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const yR = ((clientY - rect.top) / rect.height - 0.5) * 2;
      gsap.to(blob1, { x:xR*40, y:yR*28, duration:1.4, ease:"power2.out" });
      gsap.to(blob2, { x:xR*-28, y:yR*-20, duration:1.8, ease:"power2.out" });
    };
    const onMove = (e: MouseEvent) => {
      lastPointerRef.current = { clientX: e.clientX, clientY: e.clientY };
      syncBlobPosition(e.clientX, e.clientY);
    };
    const onViewportChange = () => {
      const lastPointer = lastPointerRef.current;
      if (!lastPointer) return;
      syncBlobPosition(lastPointer.clientX, lastPointer.clientY);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
    };
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
    </div>
  );
}
