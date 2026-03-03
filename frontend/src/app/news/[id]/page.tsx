"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchBoardDetail, BoardPost } from "@/lib/api";

const categoryColors: Record<string, string> = {
  "お知らせ": "bg-blue-50 text-blue-600",
  "会社":     "bg-emerald-50 text-emerald-600",
  "採用":     "bg-orange-50 text-orange-600",
  "製品":     "bg-purple-50 text-purple-600",
};

function formatDate(iso: string) {
  return iso.substring(0, 10).replaceAll("-", ".");
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchBoardDetail(Number(id));
        setPost(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <button
            onClick={() => router.push("/#news")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            お知らせ一覧に戻る
          </button>

          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-24 bg-slate-700 rounded-full" />
              <div className="h-8 w-3/4 bg-slate-700 rounded" />
              <div className="h-4 w-32 bg-slate-700 rounded" />
            </div>
          )}

          {!loading && error && (
            <div className="text-slate-400 text-center py-8">
              記事が見つかりませんでした。
            </div>
          )}

          {!loading && post && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full
                    ${categoryColors[post.category] ?? "bg-slate-700 text-slate-300"}`}
                >
                  {post.category}
                </span>
                <time className="text-slate-400 text-sm font-mono">
                  {formatDate(post.createdAt)}
                </time>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">
                {post.title}
              </h1>
              {post.author && (
                <p className="text-slate-500 text-sm mt-3">{post.author}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {!loading && post && (
          <article className="prose prose-slate max-w-none">
            {post.content.split("\n").map((line, i) =>
              line.trim() === "" ? (
                <br key={i} />
              ) : (
                <p key={i} className="text-slate-700 leading-relaxed mb-4">
                  {line}
                </p>
              )
            )}
          </article>
        )}

        {/*/!* 하단 뒤로가기 *!/*/}
        {/*<div className="border-t border-slate-100 mt-12 pt-8">*/}
        {/*  <button*/}
        {/*    onClick={() => router.push("/#news")}*/}
        {/*    className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors text-sm font-medium"*/}
        {/*  >*/}
        {/*    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
        {/*      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />*/}
        {/*    </svg>*/}
        {/*    お知らせ一覧に戻る*/}
        {/*  </button>*/}
        {/*</div>*/}
      </div>
    </div>
  );
}
