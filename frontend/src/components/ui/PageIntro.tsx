"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

const INTRO_CODE_LINES = [
  "boot.sequence('mountain-core');",
  "sync.network({ edge: true, status: 'warm' });",
  "render.surface('brand-intro').commit();",
];

export default function PageIntro() {
  const pathname = usePathname();
  const [done, setDone] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 어드민 경로 또는 불필요한 경우 즉시 종료
    if (pathname.startsWith("/admin")) {
      setDone(true);
      return;
    }
    // Never let the intro permanently cover the page if an animation step fails.
    const fallback = window.setTimeout(() => setDone(true), 1500);
    return () => window.clearTimeout(fallback);
  }, [pathname]);

  useGSAP(
    () => {
      gsap.set(
        [
          ".intro-grid",
          ".intro-halo",
          ".intro-glow-a",
          ".intro-glow-b",
          ".intro-code",
          ".intro-progress",
          ".intro-kicker",
          ".intro-logo",
          ".intro-sub",
          ".intro-block",
        ],
        { opacity: 0 }
      );
      gsap.set(".intro-logo", { y: 28 });
      gsap.set(".intro-sub", { y: 16 });
      gsap.set(".intro-kicker", { y: 14 });
      gsap.set(".intro-block", { scale: 0.8 });
      gsap.set(".intro-code-line", { text: "" });
      gsap.set(".intro-progress-value", { text: "000" });

      const tl = gsap.timeline({
        onComplete: () => setDone(true),
      });

      tl.to(".intro-grid", { opacity: 0.22, duration: 0.08, ease: "power2.out" })
        .to(
          [".intro-glow-a", ".intro-glow-b", ".intro-halo"],
          {
            opacity: 1,
            duration: 0.12,
            stagger: 0.02,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          ".intro-code",
          {
            opacity: 1,
            duration: 0.06,
            ease: "power2.out",
          },
          "-=0.04"
        )
        .to(
          ".intro-progress",
          {
            opacity: 1,
            duration: 0.06,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          ".intro-progress-value",
          {
            duration: 0.4,
            text: { value: "100", delimiter: "" },
            ease: "none",
          },
          "<"
        );

      INTRO_CODE_LINES.forEach((line, index) => {
        tl.to(
          `.intro-code-line-${index}`,
          {
            duration: 0.08,
            text: { value: line, delimiter: "" },
            ease: "none",
          },
          index === 0 ? "<" : ">-0.01"
        );
      });

      tl.to(".intro-kicker", { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, "-=0.08")
        .to(".intro-logo", { opacity: 1, y: 0, duration: 0.14, ease: "power3.out" }, "-=0.04")
        .to(".intro-sub", { opacity: 0.86, y: 0, duration: 0.1, ease: "power2.out" }, "-=0.06")
        .to(
          ".intro-block",
          {
            opacity: 0.9,
            scale: 1,
            duration: 0.08,
            stagger: 0.01,
            ease: "power2.out",
          },
          "-=0.08"
        )
        .to(
          ".intro-stage",
          {
            opacity: 0,
            duration: 0.16,
            ease: "power2.inOut",
          },
          "+=0.12"
        )
        .to(
          introRef.current,
          {
            clipPath: "inset(0 0 100% 0)",
            duration: 0.28,
            ease: "power4.inOut",
          },
          "-=0.02"
        );

      gsap.to(".intro-halo", {
        scale: 1.08,
        opacity: 0.72,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: introRef }
  );

  if (done) return null;

  return (
    <div
      ref={introRef}
      className="fixed inset-0 z-[200] overflow-hidden bg-[radial-gradient(circle_at_top,#2a160d_0%,#140d09_46%,#090807_100%)] pointer-events-none"
    >
      <div className="intro-grid absolute inset-0 opacity-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="intro-glow-a absolute left-[-10%] top-[8%] h-[42vh] w-[34vw] rounded-full bg-orange-400/16 blur-3xl opacity-0" />
      <div className="intro-glow-b absolute right-[-8%] bottom-[10%] h-[36vh] w-[28vw] rounded-full bg-amber-300/14 blur-3xl opacity-0" />
      <div className="intro-halo absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/10 bg-[radial-gradient(circle,rgba(251,146,60,0.16)_0%,rgba(251,146,60,0.03)_42%,rgba(0,0,0,0)_72%)] opacity-0" />

      <div className="intro-stage relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="intro-code mb-8 space-y-2 font-mono text-[10px] tracking-[0.16em] text-orange-300/80 opacity-0 md:text-xs">
          {INTRO_CODE_LINES.map((line, index) => (
            <div key={line} className={`intro-code-line intro-code-line-${index}`}>
              {line}
            </div>
          ))}
        </div>

        <div className="intro-progress mb-4 font-mono text-xs tracking-[0.32em] text-orange-200/80 opacity-0">
          <span className="intro-progress-value">000</span>
          <span className="ml-1">%</span>
        </div>

        <div className="intro-kicker mb-4 text-[11px] uppercase tracking-[0.42em] text-orange-300/78 opacity-0">
          Total IT Company
        </div>

        <p className="intro-logo text-4xl font-semibold tracking-[0.08em] text-white opacity-0 md:text-6xl">
          <span className="text-orange-400">株式会社</span>
          <span className="text-white">マウンテン</span>
        </p>

        <p className="intro-sub mt-4 text-sm tracking-[0.22em] text-orange-100/70 opacity-0 md:text-base">
          ENGINEERING / NETWORK / PRODUCTS
        </p>

        <div className="mt-8 flex gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="intro-block h-1.5 w-5 bg-orange-300/70 opacity-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
