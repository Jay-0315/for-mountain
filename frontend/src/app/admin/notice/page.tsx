"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  fetchBoardList,
  fetchDeptNotices,
  fetchAnnouncements,
  fetchEmployees,
  createBoardPost,
  createAnnouncement,
  createDeptNotice,
  createPartnerCard,
  updateBoardPost,
  updateAnnouncement,
  updateDeptNotice,
  updatePartnerCard,
  deleteBoardPost,
  deleteAnnouncement,
  deleteDeptNotice,
  deletePartnerCard,
  type BoardPost,
  type AnnouncementDto,
  type EmployeeDto,
  type PartnerCardDto,
  fetchPartnerCards,
} from "@/lib/api";
import { DEPARTMENTS, type DeptNotice } from "../mock-data";
import { getSessionPayload, getSessionRole } from "@/lib/session";

const WEBSITE_CATEGORIES = ["お知らせ", "会社", "採用", "製品"];
const DEPT_OPTIONS = ["全部署", ...DEPARTMENTS] as const;
type NoticeTab = "website" | "internal" | "department" | "partners";
type WebsiteView = "list" | "form" | "detail";
type LocalView = "list" | "form" | "detail";

function formatDate(iso: string) {
  return iso.substring(0, 10).replaceAll("-", ".");
}

function NoticeDetail({
  badge,
  title,
  content,
  author,
  createdAt,
  onBack,
  actions,
}: {
  badge?: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  onBack: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-slate-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base font-semibold text-slate-900">詳細</h3>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 space-y-3">
          {badge && (
            <span className="inline-flex text-xs px-2.5 py-1 rounded-full bg-orange-500 text-white font-semibold">
              {badge}
            </span>
          )}
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">{title}</h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>{author}</span>
              <span className="font-mono">{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{content}</div>
        </div>
        {actions && <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white">{actions}</div>}
      </div>
    </div>
  );
}

function TabBar({ active, onChange }: { active: NoticeTab; onChange: (t: NoticeTab) => void }) {
  const tabs: { key: NoticeTab; label: string }[] = [
    { key: "website", label: "ウェブサイトNews" },
    { key: "internal", label: "社内全体公知" },
    { key: "department", label: "部署別公知" },
    { key: "partners", label: "協力会社カード" },
  ];

  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            active === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function WebsitePostForm({
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
  const [category, setCategory] = useState(editPost?.category ?? WEBSITE_CATEGORIES[0]);
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
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base font-semibold text-slate-900">{isEdit ? "記事を編集" : "新規記事を作成"}</h3>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">カテゴリ</label>
          <div className="flex flex-wrap gap-2">
            {WEBSITE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  category === cat ? "bg-green-500 text-white border-green-500" : "text-slate-500 border-slate-200 hover:border-green-300 hover:text-green-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="記事のタイトルを入力"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm"
          />
        </div>
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">本文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={14}
            placeholder="記事の内容を入力してください。"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm resize-none leading-relaxed"
          />
        </div>
        {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary px-5 py-2.5"
          >
            {loading ? "保存中..." : isEdit ? "更新する" : "投稿する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function WebsiteTab() {
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = getSessionRole(token) === "ADMIN";
  const [view, setView] = useState<WebsiteView>("list");
  const [editPost, setEditPost] = useState<BoardPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filterCategory, setFilter] = useState("すべて");

  const loadPosts = useCallback(async (p: number, reset = false) => {
    try {
      const data = await fetchBoardList(p, 20);
      setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
      setHasMore(!data.last);
      setPage(p + 1);
    } catch {
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

  const handleFormDone = () => {
    setView("list");
    setEditPost(null);
    setSelectedPost(null);
    setLoading(true);
    loadPosts(0, true);
  };

  const filteredPosts = filterCategory === "すべて" ? posts : posts.filter((p) => p.category === filterCategory);

  if (view === "form") {
    return (
      <WebsitePostForm
        token={token}
        editPost={editPost}
        onDone={handleFormDone}
        onCancel={() => {
          setView("list");
          setEditPost(null);
        }}
      />
    );
  }

  if (view === "detail" && selectedPost) {
    return (
      <NoticeDetail
        badge={selectedPost.category}
        title={selectedPost.title}
        content={selectedPost.content}
        author={selectedPost.author || "株式会社マウンテン"}
        createdAt={selectedPost.createdAt}
        onBack={() => setView("list")}
        actions={isAdmin ? (
          <>
            <button
              onClick={() => {
                setEditPost(selectedPost);
                setView("form");
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              編集
            </button>
            <button
              onClick={async () => {
                await handleDelete(selectedPost.id);
                setSelectedPost(null);
                setView("list");
              }}
              className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50"
            >
              削除
            </button>
          </>
        ) : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["すべて", ...WEBSITE_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filterCategory === cat ? "admin-pill-active" : "admin-pill"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">記事がありません。</p>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditPost(null);
                  setView("form");
                }}
                className="mt-3 text-orange-500 text-sm font-semibold hover:underline"
              >
                最初の記事を作成する →
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 w-32">カテゴリ</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">タイトル</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 w-24 hidden sm:table-cell">投稿者</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 w-28 hidden md:table-cell">日付</th>
                  <th className="px-5 py-3 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditPost(null);
                          setView("form");
                        }}
                        className="admin-btn-primary inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        新規作成
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">{post.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setView("detail");
                        }}
                        className="text-left text-slate-900 font-medium truncate max-w-xs hover:text-orange-500"
                      >
                        {post.title}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-slate-500 text-xs">{post.author || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-slate-400 text-xs font-mono">{formatDate(post.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {isAdmin ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditPost(post);
                              setView("form");
                            }}
                            className="text-xs font-semibold text-slate-500 hover:text-orange-500 px-2 py-1"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={deleting === post.id}
                            className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1 disabled:opacity-50"
                          >
                            {deleting === post.id ? "..." : "削除"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <span className="px-2 py-1 text-xs text-slate-300">-</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasMore && (
              <div className="px-5 py-4 border-t border-slate-100">
                <button onClick={() => loadPosts(page)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-900">
                  さらに読み込む
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InternalTab() {
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = getSessionRole(token) === "ADMIN";
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<LocalView>("list");
  const [editItem, setEditItem] = useState<AnnouncementDto | null>(null);
  const [selectedItem, setSelectedItem] = useState<AnnouncementDto | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAnnouncements(await fetchAnnouncements());
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditItem(null);
    setTitle("");
    setContent("");
    setAuthor("");
    setPinned(false);
    setError("");
    setView("form");
  };

  const openEdit = (item: AnnouncementDto) => {
    setEditItem(item);
    setTitle(item.title);
    setContent(item.content);
    setAuthor(item.author);
    setPinned(item.pinned);
    setError("");
    setView("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editItem) {
        const updated = await updateAnnouncement(token, editItem.id, { title, content, author, pinned });
        setAnnouncements((prev) => prev.map((a) => (a.id === editItem.id ? updated : a)));
        setSelectedItem(updated);
      } else {
        const created = await createAnnouncement(token, { title, content, author, pinned });
        setAnnouncements((prev) => [created, ...prev]);
        setSelectedItem(created);
      }
      setView("detail");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この公知を削除しますか？")) return;
    try {
      await deleteAnnouncement(token, id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("削除に失敗しました。");
    }
  };

  if (view === "form") {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base font-semibold text-slate-900">{editItem ? "公知を編集" : "新規公知を作成"}</h3>
        </div>
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">タイトル</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="公知のタイトルを入力" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">作成者</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="管理部" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">本文</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={10} placeholder="公知の内容を入力してください。" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm resize-none leading-relaxed" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="w-4 h-4 accent-orange-500" />
            <span className="text-sm text-slate-700">トップに固定する</span>
          </label>
          {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">キャンセル</button>
            <button type="submit" disabled={saving} className="admin-btn-primary px-5 py-2.5">{saving ? "保存中..." : editItem ? "更新する" : "投稿する"}</button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "detail" && selectedItem) {
    return (
      <NoticeDetail
        badge={selectedItem.pinned ? "固定公知" : "社内公知"}
        title={selectedItem.title}
        content={selectedItem.content}
        author={selectedItem.author}
        createdAt={selectedItem.createdAt}
        onBack={() => setView("list")}
        actions={isAdmin ? (
          <>
            <button onClick={() => openEdit(selectedItem)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              編集
            </button>
            <button
              onClick={async () => {
                await handleDelete(selectedItem.id);
                setSelectedItem(null);
                setView("list");
              }}
              className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50"
            >
              削除
            </button>
          </>
        ) : undefined}
      />
    );
  }

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="p-12 text-center text-sm text-slate-400">公知がありません。</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">タイトル</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">作成者</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">日付</th>
                <th className="px-5 py-3 text-right">
                  {isAdmin && (
                    <button onClick={openNew} className="admin-btn-primary inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      新規作成
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {item.pinned && <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded font-semibold shrink-0">固定</span>}
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setView("detail");
                        }}
                        className="text-left text-slate-900 font-medium truncate max-w-xs hover:text-orange-500"
                      >
                        {item.title}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-slate-500 text-xs">{item.author}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-slate-400 text-xs font-mono">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {isAdmin ? (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="text-xs font-semibold text-slate-500 hover:text-orange-500 px-2 py-1">編集</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1">削除</button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <span className="px-2 py-1 text-xs text-slate-300">-</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DepartmentTab({ initialNoticeId }: { initialNoticeId: number | null }) {
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = getSessionRole(token) === "ADMIN";
  const [items, setItems] = useState<DeptNotice[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<LocalView>("list");
  const [editItem, setEditItem] = useState<DeptNotice | null>(null);
  const [selectedItem, setSelectedItem] = useState<DeptNotice | null>(null);
  const [department, setDepartment] = useState<(typeof DEPT_OPTIONS)[number]>("全部署");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [notices, employees] = await Promise.all([
        fetchDeptNotices(),
        fetchEmployees().catch(() => [] as EmployeeDto[]),
      ]);
      const subject = getSessionPayload(token).sub;
      const employee = employees.find((item) => item.employeeNumber === subject) ?? null;
      setCurrentEmployee(employee);
      setItems(notices as DeptNotice[]);
    } catch {
      setItems([]);
      setCurrentEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!initialNoticeId || items.length === 0) return;
    const matched = items.find((item) => item.id === initialNoticeId);
    if (!matched) return;
    setSelectedItem(matched);
    setView("detail");
  }, [initialNoticeId, items]);

  const openNew = () => {
    setEditItem(null);
    setDepartment("全部署");
    setTitle("");
    setContent("");
    setAuthor("");
    setError("");
    setView("form");
  };

  const openEdit = (item: DeptNotice) => {
    setEditItem(item);
    setDepartment(item.department);
    setTitle(item.title);
    setContent(item.content);
    setAuthor(item.author);
    setError("");
    setView("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { department, title, content, author };
      if (editItem) {
        const updated = await updateDeptNotice(token, editItem.id, payload);
        setItems((prev) => prev.map((item) => (item.id === editItem.id ? updated : item)));
        setSelectedItem(updated);
      } else {
        const created = await createDeptNotice(token, payload);
        setItems((prev) => [created, ...prev]);
        setSelectedItem(created);
      }
      setView("detail");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この部署別公知を削除しますか？")) return;
    try {
      await deleteDeptNotice(token, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("削除に失敗しました。");
    }
  };

  const filtered = isAdmin
    ? items
    : items.filter((item) => item.department === currentEmployee?.department);
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (view === "form") {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base font-semibold text-slate-900">{editItem ? "部署別公知を編集" : "部署別公知を作成"}</h3>
        </div>
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">公開部署</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value as (typeof DEPT_OPTIONS)[number])} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
              {(isAdmin ? DEPT_OPTIONS : ([currentEmployee?.department ?? ""] as const)).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">タイトル</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="部署別公知のタイトルを入力" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">作成者</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="グループ長または管理者" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">本文</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={10} placeholder="部署ごとに共有する内容を入力してください。" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm resize-none leading-relaxed" />
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">キャンセル</button>
            <button type="submit" disabled={saving} className="admin-btn-primary px-5 py-2.5">{saving ? "保存中..." : editItem ? "更新する" : "投稿する"}</button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "detail" && selectedItem) {
    return (
      <NoticeDetail
        badge={selectedItem.department}
        title={selectedItem.title}
        content={selectedItem.content}
        author={selectedItem.author}
        createdAt={selectedItem.createdAt}
        onBack={() => setView("list")}
        actions={isAdmin ? (
          <>
            <button onClick={() => openEdit(selectedItem)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              編集
            </button>
            <button
              onClick={async () => {
                await handleDelete(selectedItem.id);
                setSelectedItem(null);
                setView("list");
              }}
              className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50"
            >
              削除
            </button>
          </>
        ) : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="p-12 text-center text-sm text-slate-400">部署別公知がありません。</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 w-28">部署</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">タイトル</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">作成者</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">日付</th>
                <th className="px-5 py-3 text-right">
                  {isAdmin && (
                    <button onClick={openNew} className="admin-btn-primary inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      新規作成
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">{item.department}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setView("detail");
                      }}
                      className="text-left text-slate-900 font-medium truncate max-w-xs hover:text-orange-500"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-slate-500 text-xs">{item.author}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-slate-400 text-xs font-mono">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {isAdmin ? (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="text-xs font-semibold text-slate-500 hover:text-orange-500 px-2 py-1">編集</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1">削除</button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <span className="px-2 py-1 text-xs text-slate-300">-</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("画像の読み込みに失敗しました。"));
      }
    };
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });
}

function PartnersTab() {
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = getSessionRole(token) === "ADMIN";
  const [view, setView] = useState<LocalView>("list");
  const [items, setItems] = useState<PartnerCardDto[]>([]);
  const [selectedItem, setSelectedItem] = useState<PartnerCardDto | null>(null);
  const [editItem, setEditItem] = useState<PartnerCardDto | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchPartnerCards());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditItem(null);
    setLinkUrl("");
    setImageSrc("");
    setError("");
    setView("form");
  };

  const openEdit = (item: PartnerCardDto) => {
    setEditItem(item);
    setLinkUrl(item.linkUrl);
    setImageSrc(item.imageSrc);
    setError("");
    setView("form");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const nextImageSrc = await readFileAsDataUrl(file);
      setImageSrc(nextImageSrc);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "画像の読み込みに失敗しました。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) {
      setError("画像を登録してください。");
      return;
    }

    setSaving(true);
    setError("");
      try {
      const payload = {
        imageSrc,
        linkUrl: linkUrl.trim(),
      };

      if (editItem) {
        const updated = await updatePartnerCard(token, editItem.id, payload);
        setItems((prev) => prev.map((item) => (item.id === editItem.id ? updated : item)));
        setSelectedItem(updated);
      } else {
        const created = await createPartnerCard(token, payload);
        setItems((prev) => [created, ...prev]);
        setSelectedItem(created);
      }

      setView("detail");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この協力会社カードを削除しますか？")) return;
    try {
      await deletePartnerCard(token, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("削除に失敗しました。");
    }
  };

  if (view === "form") {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base font-semibold text-slate-900">{editItem ? "協力会社カードを編集" : "協力会社カードを追加"}</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">リンクURL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="mt-1.5 text-xs text-slate-400">公開サイト에서는 이미지만 보이고, 클릭 시 이 링크로 이동합니다.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">画像</label>
            <label className="flex min-h-52 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {imageSrc ? (
                <Image src={imageSrc} alt="Partner card preview" width={1200} height={900} unoptimized className="max-h-72 w-auto rounded-xl object-contain shadow-sm" />
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">{uploading ? "画像を読み込み中..." : "画像をアップロード"}</p>
                  <p className="mt-1 text-xs text-slate-400">PNG / JPG / WebP などに対応</p>
                </div>
              )}
            </label>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setView("list")} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              キャンセル
            </button>
            <button type="submit" disabled={saving || uploading} className="admin-btn-primary px-5 py-2.5">
              {saving ? "保存中..." : editItem ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "detail" && selectedItem) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base font-semibold text-slate-900">協力会社カード詳細</h3>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
            <p className="text-sm font-semibold text-slate-900">登録済みカード</p>
            <p className="mt-1 text-xs text-slate-400 font-mono">{formatDate(selectedItem.createdAt)}</p>
          </div>
          <div className="space-y-5 px-6 py-6">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <Image src={selectedItem.imageSrc} alt="Partner card" width={1200} height={900} unoptimized className="h-auto w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">リンクURL</p>
              {selectedItem.linkUrl ? (
                <a href={selectedItem.linkUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex break-all text-sm font-medium text-orange-600 hover:underline">
                  {selectedItem.linkUrl}
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-500">リンク未設定</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
              <button onClick={() => openEdit(selectedItem)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                編集
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedItem.id);
                  setSelectedItem(null);
                  setView("list");
                }}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">協力会社カードがありません。</p>
            {isAdmin && (
              <button onClick={openNew} className="mt-3 text-sm font-semibold text-orange-500 hover:underline">
                最初のカードを追加する →
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">画像</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">リンク</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold text-slate-500 md:table-cell">登録日</th>
                <th className="px-5 py-3 text-right">
                  {isAdmin && (
                    <button onClick={openNew} className="admin-btn-primary inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      新規作成
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <button onClick={() => { setSelectedItem(item); setView("detail"); }} className="overflow-hidden rounded-xl border border-slate-100">
                      <Image src={item.imageSrc} alt="Partner card thumbnail" width={112} height={64} unoptimized className="h-16 w-28 object-cover" />
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="max-w-md truncate text-xs text-slate-600">{item.linkUrl || "リンク未設定"}</p>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <span className="font-mono text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-orange-500">編集</button>
                        <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-600">削除</button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <span className="px-2 py-1 text-xs text-slate-300">-</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function NoticePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const initialNoticeId = Number(searchParams.get("noticeId"));
  const [activeTab, setActiveTab] = useState<NoticeTab>(
    initialTab === "internal" || initialTab === "department" || initialTab === "website" || initialTab === "partners"
      ? initialTab
      : "website"
  );

  return (
    <div className="max-w-5xl space-y-5">
      <h2 className="text-lg font-bold text-slate-900">公示管理</h2>
      <TabBar active={activeTab} onChange={setActiveTab} />
      <div>
        {activeTab === "website" && <WebsiteTab />}
        {activeTab === "internal" && <InternalTab />}
        {activeTab === "department" && <DepartmentTab initialNoticeId={Number.isNaN(initialNoticeId) ? null : initialNoticeId} />}
        {activeTab === "partners" && <PartnersTab />}
      </div>
    </div>
  );
}
