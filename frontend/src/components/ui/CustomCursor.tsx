"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // 초기 위치 화면 밖으로
    gsap.set([dot, ring], { x: -100, y: -100 });

    const handleMove = (e: MouseEvent) => {
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: "none",
      });
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.35,
        ease: "power2.out",
      });
    };

    // 클릭 시 링 축소 효과
    const handleDown = () => {
      gsap.to(ring, { scale: 0.6, duration: 0.15, ease: "power2.out" });
    };
    const handleUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
    };

    // 링크·버튼 위에서 링 확대
    const handleEnterLink = () => {
      gsap.to(ring, { scale: 1.8, borderColor: "rgba(251,146,60,0.8)", duration: 0.3 });
    };
    const handleLeaveLink = () => {
      gsap.to(ring, { scale: 1, borderColor: "rgba(251,146,60,0.4)", duration: 0.3 });
    };

    const links = document.querySelectorAll("a, button");
    links.forEach((el) => {
      el.addEventListener("mouseenter", handleEnterLink);
      el.addEventListener("mouseleave", handleLeaveLink);
    });

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      links.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnterLink);
        el.removeEventListener("mouseleave", handleLeaveLink);
      });
    };
  }, []);

  return (
    <>
      {/* 내부 점 */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 -translate-x-1/2 -translate-y-1/2
                   bg-orange-400 rounded-full pointer-events-none z-[999]"
      />
      {/* 외부 링 */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 -translate-x-1/2 -translate-y-1/2
                   border border-orange-400/40 rounded-full pointer-events-none z-[999]"
      />
    </>
  );
}
