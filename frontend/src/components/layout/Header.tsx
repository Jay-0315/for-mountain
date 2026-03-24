"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "トップ", href: "/" },
  { label: "企業情報", href: "/about" },
  { label: "事業内容", href: "/services" },
  { label: "お知らせ", href: "/news" },
  { label: "採用情報", href: "/recruit" },
  { label: "お問い合わせ", href: "/contact" },
  { label: "社員専用", href: "/admin" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inHero, setInHero] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (pathname !== "/") {
        setInHero(false);
        return;
      }

      const hero = document.getElementById("top");
      if (!hero) {
        setInHero(false);
        return;
      }

      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const headerHeight = 80;
      setInHero(window.scrollY + headerHeight < heroBottom);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const transparentHeader = inHero && !menuOpen;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
      <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              transparentHeader
                ? "bg-transparent"
                : scrolled
                  ? "bg-white/95 shadow-sm backdrop-blur-sm"
                  : "bg-white/88 backdrop-blur-sm"
          }`}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-10">
          {/* 로고 */}
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Image
                src="/mountain-logo.png"
                alt="株式会社マウンテン symbol"
                width={42}
                height={42}
                className="object-contain"
                priority
            />
            <span
                className={`min-w-0 truncate text-base font-bold tracking-tight transition-colors sm:text-xl ${
                    transparentHeader
                      ? "text-white group-hover:text-orange-300"
                      : "text-slate-900 group-hover:text-orange-600"
                }`}
            >
              <span className={transparentHeader ? "text-orange-300" : "text-orange-600"}>株式会社</span>
              <span className="ml-0.5 sm:ml-0">MOUNTAIN</span>
            </span>
          </Link>

          {/* 데스크톱 내비게이션 */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap text-[15px] font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-orange-600"
                          : transparentHeader
                            ? "text-white hover:text-orange-300"
                            : "text-slate-800 hover:text-orange-600"
                    }`}
                >
                  {item.label}
                </Link>
            ))}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
              className={`p-2 lg:hidden ${transparentHeader ? "text-white" : "text-slate-700"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="メニューを開く"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && (
            <div className="flex flex-col gap-1 border-t border-slate-100 bg-white px-6 py-4 shadow-lg lg:hidden">
              {navItems.map((item) => (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`py-2.5 text-[15px] font-medium transition-colors ${
                          isActive(item.href)
                            ? "text-orange-600"
                            : "text-slate-700 hover:text-orange-600"
                      }`}
                      onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
              ))}
            </div>
        )}
      </header>
  );
}
