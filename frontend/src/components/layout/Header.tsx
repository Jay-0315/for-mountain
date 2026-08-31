"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  { label: "トップ", href: "/" },
  { label: "企業情報", href: "/about/" },
  {
    label: "事業内容",
    href: "/services/",
    children: [{ label: "製品情報", href: "/services/list/#services" }],
  },
  { label: "お知らせ", href: "/news/" },
  {
    label: "採用情報",
    href: "/recruit/",
    children: [
      { label: "新卒採用", href: "/recruit/new-graduate/" },
      { label: "中途採用", href: "/recruit/career/" },
    ],
  },
  { label: "お問い合わせ", href: "/contact/" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inHero, setInHero] = useState(true);
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);

      if (pathname === "/") {
        setInHero(true);
        return;
      }

      const hero =
        document.querySelector<HTMLElement>("[data-transparent-header]") ??
        null;
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
                alt="株式会社MOUNTAIN symbol"
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
              <div key={item.href} className="group relative flex h-20 items-center">
                <Link
                    href={item.href}
                    className={`whitespace-nowrap text-[15px] font-medium transition-colors ${
                        transparentHeader
                          ? "text-white hover:text-orange-300"
                          : isActive(item.href)
                            ? "text-orange-600"
                            : "text-slate-800 hover:text-orange-600"
                    }`}
                >
                  {item.label}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full min-w-44 -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="relative rounded-lg border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-md">
                      <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white/95" />
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 6.75h15M4.5 12h15M4.5 17.25h9" />
                            </svg>
                          </span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                <div key={item.href}>
                  <Link
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
                  {item.children && item.children.length > 0 && (
                    <div className="pb-1 pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-orange-600"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
        )}
      </header>
  );
}
