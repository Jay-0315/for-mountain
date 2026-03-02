"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function PageIntro() {
  const [done, setDone] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => setDone(true),
      });

      tl.from(".intro-logo", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
      })
        .to(".intro-logo", {
          opacity: 0,
          y: -20,
          duration: 0.4,
          delay: 0.5,
          ease: "power2.in",
        })
        .to(
          introRef.current,
          {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 0.6,
            ease: "power4.in",
          },
          "-=0.1"
        );
    },
    { scope: introRef }
  );

  if (done) return null;

  return (
    <div
      ref={introRef}
      className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center pointer-events-none"
    >
      <p className="intro-logo text-3xl font-bold tracking-tight select-none">
        <span className="text-orange-400">株式会社</span>
        <span className="text-white">マウンテン</span>
      </p>
    </div>
  );
}
