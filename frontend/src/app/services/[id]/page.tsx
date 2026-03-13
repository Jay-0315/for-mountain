"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchServiceCategories,
  fetchServiceItemDetail,
  type ServiceCategoryDto,
  type ServiceItemDto,
} from "@/lib/api";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { renderServiceCategoryIcon } from "@/components/ui/service-category-icons";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ServiceItemDto | null>(null);
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchServiceItemDetail(Number(id)), fetchServiceCategories()])
      .then(([detail, categoryList]) => {
        setItem(detail);
        setCategories(categoryList);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const categoryInfo = item ? categories.find((category) => category.slug === item.category) : null;
  const categoryLabel = categoryInfo ? categoryInfo.name : item?.category ?? "";
  const imageAssets = item?.imageAssets?.length ? item.imageAssets : item?.imageData ? [{ name: item.imageName, url: item.imageData }] : [];
  const videoAssets = item?.videoAssets?.length ? item.videoAssets : item?.videoData ? [{ name: item.videoName, url: item.videoData }] : [];
  const attachmentAssets = item?.attachmentAssets?.length ? item.attachmentAssets : item?.attachmentData ? [{ name: item.attachmentName, url: item.attachmentData }] : [];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_28%,#f8fafc_100%)]">
      <section className="relative overflow-hidden border-b border-orange-100/70 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.28),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(148,163,184,0.22),transparent_30%)]" />
        <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-14">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white">
              <span className="text-orange-300">株式会社</span>
              <span>MOUNTAIN</span>
            </Link>
            <button
              onClick={() => router.push("/#services")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:-translate-y-0.5 hover:border-orange-300/40 hover:bg-white/10 hover:text-white"
            >
              一覧へ戻る
            </button>
          </div>

          <div className="mt-10 max-w-3xl">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-7 w-28 rounded-full bg-white/10" />
                <div className="h-12 w-full max-w-2xl rounded-2xl bg-white/10" />
                <div className="h-5 w-40 rounded-full bg-white/10" />
              </div>
            ) : error || !item ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-slate-300">
                詳細情報を読み込めませんでした。
              </div>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                  {renderServiceCategoryIcon(categoryInfo?.iconKey ?? "folder")}
                  {categoryLabel}
                </span>
                <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">
                  {item.title}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  株式会社マウンテンの事業紹介詳細です。画像・動画・関連資料をご確認いただけます。
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        {!loading && item && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="space-y-8 px-6 py-8 sm:px-8 sm:py-10">
                {imageAssets.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {imageAssets.map((asset, index) => (
                      <div key={`${asset.url}-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <Image
                          src={asset.url}
                          alt={asset.name ?? item.title}
                          width={1400}
                          height={900}
                          unoptimized
                          className="h-auto w-full rounded-xl object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {videoAssets.length > 0 && (
                  <div className="grid gap-4">
                    {videoAssets.map((asset, index) => (
                      <div key={`${asset.url}-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-950">
                        <video src={asset.url} controls playsInline className="w-full bg-black" />
                      </div>
                    ))}
                  </div>
                )}

                <MarkdownContent content={item.content} className="space-y-4" />
              </div>
            </article>

            <aside className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Detail</p>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-slate-400">カテゴリ</dt>
                    <dd className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      {renderServiceCategoryIcon(categoryInfo?.iconKey ?? "folder")}
                      {categoryLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-400">公開日</dt>
                    <dd className="mt-1 font-mono text-sm text-slate-700">{item.createdAt.slice(0, 10).replaceAll("-", ".")}</dd>
                  </div>
                </dl>
              </div>

              {item.linkUrl && (
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-500 hover:shadow-sm hover:shadow-orange-100"
                >
                  詳細サイト
                </a>
              )}

              {attachmentAssets.length > 0 && (
                <div className="space-y-3">
                  {attachmentAssets.map((asset, index) => (
                    <a
                      key={`${asset.url}-${index}`}
                      href={asset.url}
                      download={asset.name ?? "attachment"}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-semibold text-orange-600 transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      {asset.name ?? "詳細資料"}
                    </a>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
