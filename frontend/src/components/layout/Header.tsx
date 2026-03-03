"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Image 컴포넌트 임포트

const navItems = [
  { label: "トップ", href: "#top" },
  { label: "企業情報", href: "#about" },
  { label: "事業内容", href: "#services" },
  { label: "お知らせ", href: "#news" },
  { label: "採用情報", href: "#recruit" },
  { label: "お問い合わせ", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
      <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* 로고 영역 수정: 이미지 + 텍스트 */}
          <a href="#top" className="flex items-center gap-2.5 group">
            <Image
                src="/mountain-logo.png"
                alt="株式会社マウンテン symbol"
                width={34}
                height={34}
                className="object-contain"
                priority
            />
            {/* 회사명 텍스트 */}
            <span
                className={`text-lg font-bold tracking-tight transition-colors ${
                    scrolled ? "text-slate-900" : "text-white group-hover:text-orange-100"
                }`}
            >
            <span className={`${scrolled ? "text-orange-600" : "text-orange-300"}`}>株式会社</span>
            MOUNTAIN
          </span>
          </a>

          {/* 데스크톱 내비게이션 */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
                <a
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors whitespace-nowrap ${
                        scrolled ? "text-slate-600 hover:text-orange-600" : "text-white hover:text-orange-200"
                    }`}
                >
                  {item.label}
                </a>
            ))}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
              className={`lg:hidden p-2 ${scrolled ? "text-slate-700" : "text-white"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 (배경색 추가) */}
        {menuOpen && (
            <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-4 shadow-lg">
              {navItems.map((item) => (
                  <a
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-slate-700 hover:text-orange-600 py-1"
                      onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
              ))}
            </div>
        )}
      </header>
  );
}