"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { type ServiceCategoryDto, type ServiceItemDto } from "@/lib/api";
import { stripMarkdown } from "@/components/ui/MarkdownContent";
import { renderServiceCategoryIcon } from "@/components/ui/service-category-icons";

function isImageAttachment(imageName: string | null, imageData: string | null) {
  if (imageData?.startsWith("data:image/")) return true;
  if (!imageName) return false;
  return /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(imageName);
}

function getPrimaryImage(item: ServiceItemDto) {
  if (item.imageAssets?.length) {
    return item.imageAssets[0];
  }
  if (item.imageData) {
    return { name: item.imageName, url: item.imageData };
  }
  return null;
}

function createPreviewLines(content: string) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  let totalLength = 0;

  return lines
    .map((line, index) => {
      const visibleText = stripMarkdown(line);
      const remaining = 120 - totalLength;

      if (remaining <= 0) return index === 0 ? line : "";

      if (visibleText.length <= remaining) {
        totalLength += visibleText.length;
        return line;
      }

      totalLength = 120;
      const headingMatch = line.match(/^(#{1,3})\s*(.*)$/);
      if (headingMatch) {
        return `${headingMatch[1]} ${headingMatch[2].slice(0, remaining)}...`;
      }

      return `${visibleText.slice(0, remaining)}...`;
    })
    .filter(Boolean);
}

function renderPreview(lines: string[]): ReactNode[] {
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    const headingMatch = trimmedLine.match(/^(#{1,3})\s*(.*)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = stripMarkdown(headingMatch[2]);

      if (level === 1) {
        return (
          <p key={index} className="text-base font-bold leading-7 text-slate-900">
            {text}
          </p>
        );
      }

      if (level === 2) {
        return (
          <p key={index} className="text-sm font-semibold leading-7 text-slate-800">
            {text}
          </p>
        );
      }

      return (
        <p key={index} className="text-sm font-semibold leading-6 text-slate-700">
          {text}
        </p>
      );
    }

    return (
      <p key={index} className="text-sm leading-7 text-slate-600">
        {stripMarkdown(trimmedLine)}
      </p>
    );
  });
}

function getActiveCategory(categories: ServiceCategoryDto[], activeSlug: string | null) {
  if (activeSlug && categories.some((category) => category.slug === activeSlug)) {
    return activeSlug;
  }
  return categories[0]?.slug ?? null;
}

type ServicesSectionProps = {
  initialCategories?: ServiceCategoryDto[];
  initialItems?: ServiceItemDto[];
};

export default function ServicesSection({
  initialCategories = [],
  initialItems = [],
}: ServicesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string | null>(() =>
    getActiveCategory(initialCategories, null)
  );
  const [items] = useState<ServiceItemDto[]>(initialItems);
  const [categories] = useState<ServiceCategoryDto[]>(initialCategories);

  const switchTab = useCallback(
    (id: string) => {
      if (id === activeTab) return;
      const el = contentRef.current;
      if (!el) {
        setActiveTab(id);
        return;
      }

      gsap.to(el, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setActiveTab(id);
          requestAnimationFrame(() => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
            );
          });
        },
      });
    },
    [activeTab]
  );

  useGSAP(
    () => {
      gsap.from(".services-header", {
        opacity: 0,
        y: 50,
        duration: 0.9,
        delay: 0.1,
        ease: "power3.out",
      });

      gsap.from(".services-tabs", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        delay: 0.4,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  const activeCategory = categories.find((category) => category.slug === activeTab) ?? categories[0] ?? null;
  const activeItems = activeCategory
    ? items.filter((item) => item.category === activeCategory.slug)
    : [];

  return (
    <section ref={sectionRef} id="services" className="overflow-hidden bg-gray-50 pt-44 pb-[32rem]">
      <style>{`
        @keyframes svc-card-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-6">
        <div className="services-header mb-24 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">Services</p>
          <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">事業内容</h2>
          <p className="mx-auto max-w-xl text-lg text-slate-500">株式会社マウンテン &gt; Services</p>
        </div>

        <div className="services-tabs mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => switchTab(category.slug)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeCategory?.slug === category.slug
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-orange-500"
              }`}
            >
              {renderServiceCategoryIcon(category.iconKey)}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div ref={contentRef}>
          {activeCategory && (
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                {renderServiceCategoryIcon(activeCategory.iconKey)}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Category</p>
                <h3 className="text-xl font-bold text-slate-900">{activeCategory.name}</h3>
              </div>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
              登録されたカテゴリがありません。
            </div>
          ) : activeItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
              登録された事業項目がありません。
            </div>
          ) : (
            <div key={activeTab} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {activeItems.map((item) => {
                const primaryImage = getPrimaryImage(item);

                return (
                  <Link
                    key={item.id}
                    href={`/services/${item.id}/`}
                    className="service-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_40px_rgba(249,115,22,0.10)]"
                    style={{ animation: "svc-card-up 0.45s ease-out both" }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#fff7ed_55%,#ffedd5_100%)]">
                      {primaryImage && isImageAttachment(primaryImage.name, primaryImage.url) ? (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.name ?? item.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-orange-300">
                          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/60 bg-white/80 shadow-sm backdrop-blur">
                            {renderServiceCategoryIcon(activeCategory?.iconKey ?? "folder", "h-8 w-8")}
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/32 to-transparent px-6 pb-5 pt-16">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-white/90 backdrop-blur">
                            {activeCategory?.name ?? item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col px-5 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="line-clamp-2 text-lg font-bold leading-7 text-slate-900">{item.title}</h4>
                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 md:flex">
                          {renderServiceCategoryIcon(activeCategory?.iconKey ?? "folder")}
                        </div>
                      </div>

                      <div className="mt-4 h-px w-full bg-slate-200" />

                      <div className="mt-4 space-y-1 overflow-hidden">
                        {renderPreview(createPreviewLines(item.content))}
                      </div>

                      <div className="mt-6 border-t border-slate-200 pt-4">
                        <span className="text-sm font-medium text-orange-500 transition-colors duration-200 group-hover:text-orange-600">
                          詳しくはクリックしてください
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
