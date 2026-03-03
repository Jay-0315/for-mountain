"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchBoardList } from "@/lib/api";

type NewsItem = {
  id: number;
  date: string;
  category: string;
  title: string;
};

// ── 백엔드 미연결 시 fallback 데이터 ──────────────────────────
const FALLBACK_NEWS: NewsItem[] = [
  { id: 1, date: "2025-03-01", category: "お知らせ", title: "株式会社マウンテン ウェブサイトをリニューアルしました" },
  { id: 2, date: "2025-02-07", category: "会社",     title: "会社設立3周年を迎えました" },
  { id: 3, date: "2025-01-15", category: "採用",     title: "2025年度 新卒採用・中途採用を開始しました" },
  { id: 4, date: "2024-12-01", category: "製品",     title: "AI マモリージ 新バージョンをリリースしました" },
  { id: 5, date: "2024-10-20", category: "製品",     title: "Network BlackBox クラウド対応プランを追加しました" },
];

// ── 카테고리 색상 ─────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  "お知らせ": "bg-blue-50 text-blue-600",
  "会社":     "bg-emerald-50 text-emerald-600",
  "採用":     "bg-orange-50 text-orange-600",
  "製品":     "bg-purple-50 text-purple-600",
};

const PAGE_SIZE = 5;

// ── スケルトン行 ───────────────────────────────────────────────
function SkeletonRow({ last = false }: { last?: boolean }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 px-7 py-5 animate-pulse
      ${!last ? "border-b border-slate-100" : ""}`}>
      <div className="h-4 w-24 bg-slate-100 rounded shrink-0" />
      <div className="h-5 w-16 bg-slate-100 rounded-full shrink-0" />
      <div className="h-4 bg-slate-100 rounded flex-1" />
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────────────────
export default function NewsSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  const [items, setItems]       = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]   = useState(true);
  const [page, setPage]         = useState(0);

  // ── 데이터 fetch ─────────────────────────────────────────
  const fetchNews = useCallback(async (currentPage: number) => {
    try {
      const data = await fetchBoardList(currentPage, PAGE_SIZE);
      return {
        items: data.posts.map((post) => ({
          id: post.id,
          date: post.createdAt.substring(0, 10),
          category: post.category,
          title: post.title,
        })),
        isLast: data.last,
      };
    } catch {
      const from = currentPage * PAGE_SIZE;
      const slice = FALLBACK_NEWS.slice(from, from + PAGE_SIZE);
      return {
        items: slice,
        isLast: from + PAGE_SIZE >= FALLBACK_NEWS.length,
      };
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { items: data, isLast } = await fetchNews(0);
      setItems(data);
      setPage(1);
      setHasMore(!isLast);
      setLoading(false);
    })();
  }, [fetchNews]);

  // もっと見る
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const { items: data, isLast } = await fetchNews(page);
    setItems((prev) => [...prev, ...data]);
    setPage((prev) => prev + 1);
    setHasMore(!isLast);
    setLoadingMore(false);

    // 새로 추가된 행에 스타거 애니메이션
    requestAnimationFrame(() => {
      if (!listRef.current) return;
      const newRows = Array.from(
        listRef.current.querySelectorAll<HTMLElement>(".news-item")
      ).slice(-data.length);
      gsap.fromTo(newRows,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    });
  };

  // ── 뉴스 아이템 애니메이션 — loading 완료 후 직접 실행 (ScrollTrigger 미사용)
  useEffect(() => {
    if (loading || items.length === 0) return;
    const rows = listRef.current?.querySelectorAll<HTMLElement>(".news-item");
    if (!rows || rows.length === 0) return;
    gsap.killTweensOf(rows);
    gsap.fromTo(
      rows,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", clearProps: "all" }
    );
  }, [loading, items]);

  // ── GSAP 진입 애니메이션
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from(".news-header > *", {
        opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".news-header", start: "top 82%", once: true },
      });

      gsap.from(".news-cta", {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".news-cta", start: "top 88%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [loading] }
  );

  // 날짜 포맷 YYYY-MM-DD → YYYY.MM.DD
  const formatDate = (iso: string) => iso.replaceAll("-", ".");

  return (
    <section ref={sectionRef} id="news" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* 섹션 헤더 */}
        <div className="news-header text-center mb-12">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">
            News
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            お知らせ
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            株式会社マウンテン &gt; お知らせ
          </p>
        </div>

        {/* 뉴스 목록 */}
        <div className="max-w-3xl mx-auto">
          <div ref={listRef} className="news-list bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* 로딩 스켈레톤 */}
            {loading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow last />
              </>
            )}

            {/* 뉴스 아이템 */}
            {!loading && items.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-10">
                現在、お知らせはありません。
              </p>
            )}

            {!loading && items.map((item, i) => (
              <div
                key={item.id}
                onClick={() => router.push(`/news/${item.id}`)}
                className={`news-item flex flex-col sm:flex-row sm:items-center gap-3 px-7 py-5 group
                  hover:bg-slate-50 transition-colors cursor-pointer
                  ${i !== items.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                {/* 날짜 */}
                <time className="text-sm text-slate-400 font-mono shrink-0 w-28">
                  {formatDate(item.date)}
                </time>

                {/* 카테고리 배지 */}
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 w-20 text-center
                    ${categoryColors[item.category] ?? "bg-slate-50 text-slate-500"}`}
                >
                  {item.category}
                </span>

                {/* 제목 */}
                <p className="text-sm text-slate-700 group-hover:text-orange-500 transition-colors leading-relaxed flex-1">
                  {item.title}
                </p>

                {/* 화살표 */}
                <svg
                  className="w-4 h-4 text-slate-300 group-hover:text-orange-400 shrink-0 transition-colors hidden sm:block"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}

            {/* もっと見る 로딩 중 스켈레톤 */}
            {loadingMore && (
              <>
                <SkeletonRow />
                <SkeletonRow last />
              </>
            )}
          </div>

          {/* もっと見る 버튼 */}
          {!loading && hasMore && (
            <div className="news-cta text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold
                           hover:border-orange-300 hover:text-orange-500 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    読み込み中...
                  </>
                ) : "もっと見る"}
              </button>
            </div>
          )}

          {/* 더 이상 없을 때 */}
          {!loading && !hasMore && items.length > 0 && (
            <div className="news-cta text-center mt-8">
              <p className="text-sm text-slate-400">すべてのお知らせを表示しています</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
