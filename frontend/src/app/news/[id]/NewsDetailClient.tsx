"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchBoardDetail, fetchBoardList, type BoardPost } from "@/lib/api";
import GridRunnerBackdrop from "@/components/ui/GridRunnerBackdrop";

const categoryColors: Record<string, string> = {
  "お知らせ": "bg-blue-50 text-blue-600 ring-blue-100",
  "会社": "bg-emerald-50 text-emerald-600 ring-emerald-100",
  "採用": "bg-orange-50 text-orange-600 ring-orange-100",
  "製品": "bg-violet-50 text-violet-600 ring-violet-100",
};

function formatDate(iso: string) {
  return iso.substring(0, 10).replaceAll("-", ".");
}

function ArticleBody({ content }: { content: string }) {
  return (
    <div className="space-y-5 text-[15px] leading-8 text-slate-600 sm:text-base">
      {content.split("\n").map((line, index) =>
        line.trim() === "" ? (
          <div key={`spacer-${index}`} className="h-2" />
        ) : (
          <p key={`line-${index}`}>{line}</p>
        )
      )}
    </div>
  );
}

export default function NewsDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<BoardPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await fetchBoardDetail(Number(id));
        setPost(data);
        const list = await fetchBoardList(0, 8);
        setRelatedPosts(
          list.posts
            .filter((item) => item.id !== Number(id))
            .sort((a, b) => {
              const aScore = a.category === data.category ? 1 : 0;
              const bScore = b.category === data.category ? 1 : 0;
              return bScore - aScore;
            })
            .slice(0, 4)
        );
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_28%,#f8fafc_100%)]">
      <section className="relative overflow-hidden border-b border-orange-100/70 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.28),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(148,163,184,0.22),transparent_30%)]" />
        <GridRunnerBackdrop />
        <div className="relative mx-auto max-w-5xl px-6 pb-18 pt-10 sm:pb-24 sm:pt-14">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              <span className="text-orange-300">株式会社</span>
              <span>MOUNTAIN</span>
            </Link>
          </div>

          <div className="mt-10 max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span>HOME</span>
              <span className="text-slate-500">/</span>
              <span>NEWS</span>
              {!loading && post && (
                <>
                  <span className="text-slate-500">/</span>
                  <span className="truncate text-slate-400">{post.category}</span>
                </>
              )}
            </div>

            {loading && (
              <div className="animate-pulse space-y-5">
                <div className="h-7 w-28 rounded-full bg-white/10" />
                <div className="h-12 w-full max-w-2xl rounded-2xl bg-white/10" />
                <div className="h-12 w-3/4 rounded-2xl bg-white/10" />
                <div className="h-5 w-40 rounded-full bg-white/10" />
              </div>
            )}

            {!loading && error && (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-slate-300">
                記事が見つかりませんでした。
              </div>
            )}

            {!loading && post && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                      categoryColors[post.category] ?? "bg-white/10 text-slate-200 ring-white/10"
                    }`}
                  >
                    {post.category}
                  </span>
                  <time className="font-mono text-sm text-slate-400">{formatDate(post.createdAt)}</time>
                </div>
                <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">
                  {post.title}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  株式会社マウンテンからのお知らせを掲載しています。本文をご確認ください。
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        {!loading && post && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="px-6 py-8 sm:px-8 sm:py-10">
                <ArticleBody content={post.content} />
                {(post.imageData || post.videoData || post.attachmentData) && (
                  <div className="mt-8 space-y-5 border-t border-slate-100 pt-8">
                    {post.imageData && (
                      <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50 p-3">
                        <Image
                          src={post.imageData}
                          alt={post.imageName ?? post.title}
                          width={1200}
                          height={800}
                          unoptimized
                          className="h-auto w-full rounded-xl object-contain"
                        />
                      </div>
                    )}
                    {post.videoData && (
                      <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-950">
                        <video src={post.videoData} controls playsInline className="w-full bg-black" />
                      </div>
                    )}
                    {post.attachmentData && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Attachment</p>
                        <a
                          href={post.attachmentData}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline"
                        >
                          {post.attachmentName ?? "添付ファイルを開く"}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
                <button
                  onClick={() => router.push("/#news")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-500 hover:shadow-sm hover:shadow-orange-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  お知らせ一覧に戻る
                </button>
              </div>

              {relatedPosts.length > 0 && (
                <div className="border-t border-slate-100 px-6 py-8 sm:px-8">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">More News</p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">その他のお知らせ</h2>
                    </div>
                    <Link href="/#news" className="text-sm font-semibold text-slate-500 hover:text-orange-500">
                      一覧を見る
                    </Link>
                  </div>
                  <div className="grid gap-3">
                    {relatedPosts.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/news/${item.id}`)}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/60"
                      >
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                                categoryColors[item.category] ?? "bg-slate-100 text-slate-600 ring-slate-200"
                              }`}
                            >
                              {item.category}
                            </span>
                            <time className="font-mono text-xs text-slate-400">{formatDate(item.createdAt)}</time>
                          </div>
                          <p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-800">{item.title}</p>
                        </div>
                        <svg className="mt-1 h-4 w-4 shrink-0 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Article Info</p>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-slate-400">カテゴリ</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{post.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-400">公開日</dt>
                    <dd className="mt-1 font-mono text-sm text-slate-700">{formatDate(post.createdAt)}</dd>
                  </div>
                  {post.author && (
                    <div>
                      <dt className="text-xs font-medium text-slate-400">投稿者</dt>
                      <dd className="mt-1 text-sm text-slate-700">{post.author}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
