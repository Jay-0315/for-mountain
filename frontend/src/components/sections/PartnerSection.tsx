"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchPartnerCards, fetchProductCards, type PartnerCardDto, type ProductCardDto } from "@/lib/api";

type ProductBannerItem = Pick<ProductCardDto, "label" | "title" | "description" | "metric" | "accent" | "icon">;

const fallbackProductBannerItems: ProductBannerItem[] = [
  {
    label: "AI Assistant",
    title: "AI 業務アシスタント",
    description: "社内ナレッジと定型業務を支援する業務AI。",
    metric: "ChatOps",
    accent: "orange",
    icon: "M9.75 3.75h4.5m-7.5 3h10.5a2 2 0 012 2v8.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2v-8.5a2 2 0 012-2zm3 5h.01m4.49 0h.01M9 15.25c1.9 1.3 4.1 1.3 6 0",
  },
  {
    label: "AI OCR",
    title: "AI-OCR データ化",
    description: "紙書類や帳票を読み取り、扱いやすいデータへ変換。",
    metric: "Scan Flow",
    accent: "yellow",
    icon: "M7 4.75h10M7 19.25h10M6.25 7.5v9a2 2 0 002 2h7.5a2 2 0 002-2v-9a2 2 0 00-2-2h-7.5a2 2 0 00-2 2zm3 2h5.5m-5.5 3h5.5m-5.5 3h3",
  },
  {
    label: "Knowledge AI",
    title: "AI ナレッジ検索",
    description: "規程、FAQ、マニュアルから必要な情報を素早く検索。",
    metric: "Search Hub",
    accent: "green",
    icon: "M10.75 18.25a7.5 7.5 0 100-15 7.5 7.5 0 000 15zm5.3-2.2l4.2 4.2M8.5 9.75h4.5m-4.5 3h3",
  },
  {
    label: "AI Security",
    title: "AI セキュリティ支援",
    description: "業務環境のリスクを可視化し、運用改善を支援。",
    metric: "Risk Guard",
    accent: "red",
    icon: "M12 3.75l6.25 2.25v4.75c0 4.05-2.45 7.7-6.25 9.5-3.8-1.8-6.25-5.45-6.25-9.5V6L12 3.75zm-2 8.25l1.4 1.4L15 9.8",
  },
];

function getAccentClasses(accent: ProductBannerItem["accent"]) {
  if (accent === "yellow") {
    return { accentBg: "bg-yellow-300", accentText: "text-yellow-200", glow: "shadow-yellow-500/25" };
  }
  if (accent === "green") {
    return { accentBg: "bg-green-300", accentText: "text-green-200", glow: "shadow-green-500/25" };
  }
  if (accent === "red") {
    return { accentBg: "bg-red-300", accentText: "text-red-200", glow: "shadow-red-500/25" };
  }
  return { accentBg: "bg-orange-300", accentText: "text-orange-200", glow: "shadow-orange-500/25" };
}

function getPreviewGradient(accent: string) {
  if (accent === "yellow") return "from-yellow-300/22 via-amber-300/8 to-transparent";
  if (accent === "green") return "from-green-400/20 via-emerald-300/8 to-transparent";
  if (accent === "red") return "from-red-400/20 via-rose-300/8 to-transparent";
  return "from-orange-400/22 via-amber-300/8 to-transparent";
}

function ProductTicker() {
  const [productItems, setProductItems] = useState<ProductBannerItem[]>(fallbackProductBannerItems);
  const displayItems = productItems.length ? productItems : fallbackProductBannerItems;
  const loopItems = [...displayItems, ...displayItems, ...displayItems];

  useEffect(() => {
    fetchProductCards()
      .then((items) => {
        setProductItems(items.length ? items : fallbackProductBannerItems);
      })
      .catch(() => setProductItems(fallbackProductBannerItems));
  }, []);

  return (
    <div className="relative mb-28 overflow-hidden py-14">
      <style>{`
        @keyframes partner-product-ticker {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-33.333%, 0, 0); }
        }

        @keyframes product-card-shine {
          from { transform: translateX(-140%) skewX(-18deg); }
          to { transform: translateX(240%) skewX(-18deg); }
        }

        @keyframes product-card-float {
          0%, 100% { transform: translateY(0) rotate(-0.4deg); }
          50% { transform: translateY(-8px) rotate(0.4deg); }
        }

        .partner-product-ticker-track {
          animation: partner-product-ticker 52s linear infinite;
          will-change: transform;
        }

        .partner-product-ticker:hover .partner-product-ticker-track {
          animation-play-state: paused;
        }

        .product-card-shine {
          animation: product-card-shine 6.8s ease-in-out infinite;
        }

        .product-card-float {
          animation: product-card-float 6.4s ease-in-out infinite;
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(249,115,22,0.12),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(34,197,94,0.10),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#03070f] to-transparent md:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#03070f] to-transparent md:w-48" />

      <div className="relative z-10 mx-auto mb-10 max-w-6xl px-6 text-center sm:px-10 lg:px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">
          MOUNTAIN PRODUCTS
        </p>
        <div className="flex justify-center">
          <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
            <span className="block whitespace-nowrap">AIプロダクトを、</span>
            <span className="block whitespace-nowrap">実務で成果に繋がる</span>
          </h2>
        </div>
      </div>

      <div className="partner-product-ticker">
        <div className="partner-product-ticker-track flex w-max gap-6 px-8">
          {loopItems.map((item, index) => {
            const accentClasses = getAccentClasses(item.accent);

            return (
              <article
                key={`${item.title}-${index}`}
                className={`product-card-float group relative h-[22rem] w-[23rem] shrink-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl ${accentClasses.glow} backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/25 hover:bg-white/[0.075] sm:w-[28rem]`}
                style={{ animationDelay: `${(index % 3) * 0.65}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${getPreviewGradient(item.accent)}`} />
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full ${accentClasses.accentBg} opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-35`} />
                <div className={`absolute bottom-8 left-8 h-24 w-24 rounded-full ${accentClasses.accentBg} opacity-10 blur-3xl`} />
                <div className="product-card-shine pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/18 to-transparent" />

                <div className="relative flex h-full flex-col">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClasses.accentBg} text-slate-950 shadow-lg ${accentClasses.glow}`}>
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={item.icon} />
                      </svg>
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-300">
                      {item.label}
                    </span>
                  </div>
                    <span className={`h-3 w-3 rounded-full ${accentClasses.accentBg} shadow-[0_0_24px_rgba(255,255,255,0.55)]`} />
                </div>

                <div className="relative mb-5 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-inner shadow-black/40">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-300/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${accentClasses.accentText}`}>
                      {item.metric}
                    </span>
                  </div>
                  <div className="grid h-[7.5rem] grid-cols-[1.1fr_0.9fr] gap-3">
                    <div className="space-y-2 rounded-xl border border-white/8 bg-white/[0.04] p-3">
                      <span className={`block h-2 w-16 rounded-full ${accentClasses.accentBg}`} />
                      <span className="block h-2 w-28 rounded-full bg-white/18" />
                      <span className="block h-2 w-20 rounded-full bg-white/12" />
                      <div className="mt-4 grid grid-cols-3 gap-1.5">
                        <span className="h-9 rounded-lg bg-white/[0.08]" />
                        <span className={`h-9 rounded-lg ${accentClasses.accentBg} opacity-70`} />
                        <span className="h-9 rounded-lg bg-white/[0.08]" />
                      </div>
                    </div>
                    <div className="space-y-2 rounded-xl border border-white/8 bg-white/[0.04] p-3">
                      <span className="block h-14 rounded-xl bg-gradient-to-br from-white/14 to-white/[0.03]" />
                      <span className="block h-2 w-full rounded-full bg-white/14" />
                      <span className="block h-2 w-2/3 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Featured Product
                  </p>
                  <h3 className="text-2xl font-bold leading-8 text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PartnersSection() {
  const [cards, setCards] = useState<PartnerCardDto[]>([]);

  useEffect(() => {
    fetchPartnerCards()
      .then(setCards)
      .catch(() => setCards([]));
  }, []);

  return (
    <section id="partners" className="relative z-10 overflow-hidden pt-28 pb-64">
      <ProductTicker />
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">
            MOUNTAIN PARTNERS
          </p>
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            株式会社MOUNTAIN 協力会社
          </h2>
          <div className="mx-auto mb-6 h-1 w-20 bg-orange-500" />
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            共に成長し、革新を創り出す株式会社MOUNTAINの大切なパートナー企業様です。
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center text-sm text-slate-500">
            登録された協力会社カードがありません。
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
            {cards.map((card) => {
              const content = (
                <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-sm shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-orange-900/40">
                  <div className="absolute -inset-4 -z-10 rounded-3xl bg-slate-100/80 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative aspect-[1.15/1] overflow-hidden bg-white p-4">
                    <Image
                      src={card.imageSrc}
                      alt="Mountain partner card"
                      fill
                      unoptimized
                      className="object-contain object-center p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              );

              if (!card.linkUrl.trim()) {
                return <div key={card.id}>{content}</div>;
              }

              return (
                <a
                  key={card.id}
                  href={card.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  {content}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
