"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminLogin,
  fetchBoardList,
  createBoardPost,
  updateBoardPost,
  deleteBoardPost,
  BoardPost,
} from "@/lib/api";

type View = "login" | "list" | "form";

const CATEGORIES = ["お知らせ", "会社", "採用", "製品"];

function formatDate(iso: string) {
  return iso.substring(0, 10).replaceAll("-", ".");
}

// ── 로그인 화면 ───────────────────────────────────────────────
function LoginView({ onLogin }: { onLogin: (token: string) => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(code);
      sessionStorage.setItem("admin_token", token);
      onLogin(token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "コードが正しくありません。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">管理者ログイン</h1>
          <p className="text-slate-500 text-sm mt-1">管理コードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              管理コード
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="コードを入力"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                         placeholder:text-slate-300 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold
                       hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "認証中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── 글 목록 화면 ──────────────────────────────────────────────
function ListView({
  token,
  onNew,
  onEdit,
  onLogout,
}: {
  token: string;
  onNew: () => void;
  onEdit: (post: BoardPost) => void;
  onLogout: () => void;
}) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadPosts = useCallback(async (p: number, reset = false) => {
    try {
      const data = await fetchBoardList(p, 10);
      setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
      setHasMore(!data.last);
      setPage(p + 1);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(0, true);
  }, [loadPosts]);

  const handleDelete = async (id: number) => {
    if (!confirm("この記事を削除しますか？")) return;
    setDeleting(id);
    try {
      await deleteBoardPost(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("削除に失敗しました。");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">記事管理</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onNew}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl
                         text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-slate-500 text-sm hover:text-slate-900 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-1/4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-slate-400 py-16">
            <p className="text-sm">記事がありません。</p>
            <button
              onClick={onNew}
              className="mt-4 text-orange-500 text-sm font-semibold hover:underline"
            >
              最初の記事を作成する →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-medium text-sm truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{post.category}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400 font-mono">{formatDate(post.createdAt)}</span>
                    {post.author && (
                      <>
                        <span className="text-slate-200">·</span>
                        <span className="text-xs text-slate-400">{post.author}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEdit(post)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200
                               rounded-lg hover:border-orange-300 hover:text-orange-500 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleting === post.id}
                    className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-100
                               rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === post.id ? "..." : "削除"}
                  </button>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => loadPosts(page)}
                className="w-full py-3 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                さらに読み込む
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 글쓰기/수정 폼 화면 ────────────────────────────────────────
function FormView({
  token,
  editPost,
  onDone,
  onCancel,
}: {
  token: string;
  editPost: BoardPost | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const isEdit = editPost !== null;
  const [title, setTitle] = useState(editPost?.title ?? "");
  const [content, setContent] = useState(editPost?.content ?? "");
  const [author, setAuthor] = useState(editPost?.author ?? "");
  const [category, setCategory] = useState(editPost?.category ?? CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit && editPost) {
        await updateBoardPost(token, editPost.id, { title, content, category });
      } else {
        await createBoardPost(token, { title, content, author, category });
      }
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-slate-900">
              {isEdit ? "記事を編集" : "新規記事を作成"}
            </h1>
          </div>
          <button
            form="post-form"
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold
                       hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {loading ? "保存中..." : isEdit ? "更新する" : "投稿する"}
          </button>
        </div>
      </div>

      {/* 폼 */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form id="post-form" onSubmit={handleSubmit} className="space-y-5">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors
                    ${category === cat
                      ? "bg-slate-900 text-white border-slate-900"
                      : "text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="記事のタイトルを入力"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                         placeholder:text-slate-300 text-sm"
            />
          </div>

          {/* 작성자 (신규 작성 시에만) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                投稿者 <span className="text-slate-400 font-normal">(任意)</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="株式会社マウンテン"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                           placeholder:text-slate-300 text-sm"
              />
            </div>
          )}

          {/* 본문 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">本文</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={14}
              placeholder="記事の内容を入力してください。"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                         placeholder:text-slate-300 text-sm resize-none leading-relaxed"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

// ── 메인 페이지 (상태 관리) ────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<View>("login");
  const [editPost, setEditPost] = useState<BoardPost | null>(null);

  // 세션 스토리지에서 토큰 복원
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
      setView("list");
    }
  }, []);

  const handleLogin = (t: string) => {
    setToken(t);
    setView("list");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
    setView("login");
  };

  const handleNew = () => {
    setEditPost(null);
    setView("form");
  };

  const handleEdit = (post: BoardPost) => {
    setEditPost(post);
    setView("form");
  };

  const handleFormDone = () => {
    setView("list");
    setEditPost(null);
  };

  if (view === "login" || !token) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (view === "form") {
    return (
      <FormView
        token={token}
        editPost={editPost}
        onDone={handleFormDone}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <ListView
      token={token}
      onNew={handleNew}
      onEdit={handleEdit}
      onLogout={handleLogout}
    />
  );
}
