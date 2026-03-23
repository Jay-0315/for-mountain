"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type ClickRipple = {
  id: number;
  x: number;
  y: number;
};

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);
  const rippleTimeoutsRef = useRef<number[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateEnabled = () => setEnabled(mediaQuery.matches);

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

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
      const rippleId = rippleIdRef.current;
      rippleIdRef.current += 1;
      const dotRect = dot.getBoundingClientRect();
      const x = dotRect.left + dotRect.width / 2;
      const y = dotRect.top + dotRect.height / 2;

      setRipples((prev) => [...prev, { id: rippleId, x, y }]);
      gsap.to(ring, { scale: 0.6, duration: 0.15, ease: "power2.out" });
      const timeoutId = window.setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== rippleId));
      }, 650);
      rippleTimeoutsRef.current.push(timeoutId);
    };
    const handleUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
    };

    // 링크·버튼 위에서 링 확대
    const handleEnterLink = () => {
      gsap.to(ring, { scale: 1.8, borderColor: "rgba(249,115,22,0.78)", duration: 0.3 });
    };
    const handleLeaveLink = () => {
      gsap.to(ring, { scale: 1, borderColor: "rgba(249,115,22,0.46)", duration: 0.3 });
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
      rippleTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      rippleTimeoutsRef.current = [];
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      {/* 내부 점 */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 -translate-x-1/2 -translate-y-1/2
                   bg-orange-500 rounded-full pointer-events-none z-[999]"
      />
      {/* 외부 링 */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 -translate-x-1/2 -translate-y-1/2
                   border border-orange-500/45 rounded-full pointer-events-none z-[999]"
      />
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed top-0 left-0 rounded-full pointer-events-none z-[998]"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: "10px",
            height: "10px",
            transform: "translate3d(-50%, -50%, 0)",
            boxShadow: "inset 0 0 0 0.5px rgba(251, 146, 60, 0.42)",
            animation: "cursor-ripple 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />
      ))}
    </>
  );
}
