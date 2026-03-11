"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchPartnerCards, type PartnerCardDto } from "@/lib/api";

export default function PartnersSection() {
  const [cards, setCards] = useState<PartnerCardDto[]>([]);

  useEffect(() => {
    fetchPartnerCards()
      .then(setCards)
      .catch(() => setCards([]));
  }, []);

  return (
    <section id="partners" className="overflow-hidden bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">
            MOUNTAIN PARTNERS
          </p>
          <h2 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
            株式会社マウンテン 協力会社
          </h2>
          <div className="mx-auto mb-6 h-1 w-20 bg-orange-500" />
          <p className="mx-auto max-w-2xl text-lg text-slate-500">
            共に成長し、革新を創り出す株式会社マウンテンの大切なパートナー企業様です。
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-400">
            登録された協力会社カードがありません。
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const content = (
                <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100">
                  <div className="absolute -inset-4 -z-10 rounded-[2.25rem] bg-slate-100/80 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={card.imageSrc}
                      alt="Mountain partner card"
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
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
