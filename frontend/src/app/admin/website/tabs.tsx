"use client";

import Image from "next/image";
import MarkdownContent from "@/components/ui/MarkdownContent";
import {
  renderServiceCategoryIcon,
  SERVICE_CATEGORY_ICON_OPTIONS,
  type ServiceCategoryIconKey,
} from "@/components/ui/service-category-icons";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  fetchBoardList,
  createBoardPost,
  createPresignedUpload,
  updateBoardPost,
  uploadFileToPresignedUrl,
  deleteBoardPost,
  type BoardPost,
  createPartnerCard,
  updatePartnerCard,
  deletePartnerCard,
  reorderPartnerCards,
  type PartnerCardDto,
  createServiceCategory,
  createServiceItem,
  updateServiceCategory,
  updateServiceItem,
  deleteServiceCategory,
  deleteServiceItem,
  reorderServiceItems,
  type ServiceCategoryDto,
  type ServiceItemDto,
  fetchPartnerCards,
  fetchServiceCategories,
  fetchServiceItems,
} from "@/lib/api";
import { getSessionRole } from "@/lib/session";
import { isMockAdminSession } from "../mock-store";

const WEBSITE_CATEGORIES = ["お知らせ", "会社", "採用", "製品"];
type WebsiteView = "list" | "form" | "detail";
type LocalView = "list" | "form" | "detail";

function formatDate(iso: string) {
  return iso.substring(0, 10).replaceAll("-", ".");
}

function hasAdminAccess(token: string) {
  return getSessionRole(token) === "ADMIN" || isMockAdminSession(token);
}

function isImageAttachment(attachmentName: string | null, attachmentData: string | null) {
  if (attachmentData?.startsWith("data:image/")) return true;
  if (!attachmentName) return false;
  return /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(attachmentName);
}

function NoticeDetail({
  badge,
  title,
  content,
  author,
  createdAt,
  imageName,
  imageUrl,
  videoName,
  videoUrl,
  attachmentName,
  attachmentUrl,
  onBack,
  actions,
}: {
  badge?: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  imageName?: string | null;
  imageUrl?: string | null;
  videoName?: string | null;
  videoUrl?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
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
          {(imageUrl || videoUrl || attachmentUrl) && (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              {imageUrl && (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <Image
                    src={imageUrl}
                    alt={imageName ?? "Notice image"}
                    width={1200}
                    height={800}
                    unoptimized
                    className="h-auto w-full rounded-xl object-contain"
                  />
                </div>
              )}
              {videoUrl && (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-950">
                  <video src={videoUrl} controls playsInline className="w-full bg-black" />
                </div>
              )}
              {attachmentUrl && (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-semibold text-orange-600 hover:underline"
                >
                  {attachmentName ?? "添付ファイルを開く"}
                </a>
              )}
            </div>
          )}
        </div>
        {actions && <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white">{actions}</div>}
      </div>
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
  const [imageName, setImageName] = useState<string | null>(editPost?.imageName ?? null);
  const [imageData, setImageData] = useState<string | null>(editPost?.imageData ?? null);
  const [videoName, setVideoName] = useState<string | null>(editPost?.videoName ?? null);
  const [videoData, setVideoData] = useState<string | null>(editPost?.videoData ?? null);
  const [attachmentName, setAttachmentName] = useState<string | null>(editPost?.attachmentName ?? null);
  const [attachmentData, setAttachmentData] = useState<string | null>(editPost?.attachmentData ?? null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async (file: File, directory: string) => {
    const contentType = file.type || "application/octet-stream";
    const presigned = await createPresignedUpload(token, {
      fileName: file.name,
      contentType,
      directory,
    });
    return uploadFileToPresignedUrl(presigned, file);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file, "board/images");
      setImageName(file.name);
      setImageData(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file, "board/videos");
      setVideoName(file.name);
      setVideoData(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "動画のアップロードに失敗しました。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file, "board/attachments");
      setAttachmentName(file.name);
      setAttachmentData(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "添付ファイルのアップロードに失敗しました。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit && editPost) {
        await updateBoardPost(token, editPost.id, {
          title,
          content,
          category,
          imageName,
          imageData,
          videoName,
          videoData,
          attachmentName,
          attachmentData,
        });
      } else {
        await createBoardPost(token, {
          title,
          content,
          author,
          category,
          imageName,
          imageData,
          videoName,
          videoData,
          attachmentName,
          attachmentData,
        });
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
                  category === cat ? "bg-orange-500 text-white border-orange-500" : "text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600"
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">画像</label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <div>
              <p className="text-sm font-medium text-slate-700">{imageName ?? "画像をアップロード"}</p>
              <p className="mt-1 text-xs text-slate-400">{uploading ? "アップロード中..." : "PNG / JPG / WebP など"}</p>
            </div>
            <span className="text-sm font-semibold text-orange-500">選択</span>
          </label>
          {imageData && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
              <Image src={imageData} alt={imageName ?? "Image preview"} width={1200} height={800} unoptimized className="h-auto max-h-72 w-auto rounded-lg object-contain" />
            </div>
          )}
          {imageName && (
            <button type="button" onClick={() => { setImageName(null); setImageData(null); }} className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600">
              画像を削除
            </button>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">動画</label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            <div>
              <p className="text-sm font-medium text-slate-700">{videoName ?? "動画をアップロード"}</p>
              <p className="mt-1 text-xs text-slate-400">{uploading ? "アップロード中..." : "MP4 / WebM / MOV など"}</p>
            </div>
            <span className="text-sm font-semibold text-orange-500">選択</span>
          </label>
          {videoData && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-950">
              <video src={videoData} controls playsInline className="max-h-72 w-full bg-black" />
            </div>
          )}
          {videoName && (
            <button type="button" onClick={() => { setVideoName(null); setVideoData(null); }} className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600">
              動画を削除
            </button>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">添付ファイル</label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
            <input type="file" className="hidden" onChange={handleAttachmentChange} />
            <div>
              <p className="text-sm font-medium text-slate-700">{attachmentName ?? "ファイルをアップロード"}</p>
              <p className="mt-1 text-xs text-slate-400">{uploading ? "アップロード中..." : "PDF / image / office file など"}</p>
            </div>
            <span className="text-sm font-semibold text-orange-500">選択</span>
          </label>
          {attachmentData && isImageAttachment(attachmentName, attachmentData) && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
              <Image src={attachmentData} alt={attachmentName ?? "Attachment preview"} width={1200} height={800} unoptimized className="h-auto max-h-72 w-auto rounded-lg object-contain" />
            </div>
          )}
          {attachmentName && (
            <button type="button" onClick={() => { setAttachmentName(null); setAttachmentData(null); }} className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600">
              添付を削除
            </button>
          )}
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
            disabled={loading || uploading}
            className="admin-btn-primary px-5 py-2.5"
          >
            {loading ? "保存中..." : isEdit ? "更新する" : "投稿する"}
          </button>
        </div>
      </form>
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
        reject(new Error("ファイルの読み込みに失敗しました。"));
      }
    };
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });
}

async function uploadFileWithPresign(token: string, file: File, directory: string) {
  const contentType = file.type || "application/octet-stream";
  const presigned = await createPresignedUpload(token, {
    fileName: file.name,
    contentType,
    directory,
  });
  return uploadFileToPresignedUrl(presigned, file);
}

function moveItem<T extends { id: number }>(items: T[], activeId: number, targetId: number) {
  const currentIndex = items.findIndex((item) => item.id === activeId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [moved] = nextItems.splice(currentIndex, 1);
  nextItems.splice(targetIndex, 0, moved);
  return nextItems;
}

export function WebsiteTab() {
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = hasAdminAccess(token);
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
        imageName={selectedPost.imageName}
        imageUrl={selectedPost.imageData}
        videoName={selectedPost.videoName}
        videoUrl={selectedPost.videoData}
        attachmentName={selectedPost.attachmentName}
        attachmentUrl={selectedPost.attachmentData}
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

export function PartnersTab() {
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = hasAdminAccess(token);
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
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

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
      const nextImageSrc = await uploadFileWithPresign(token, file, "partners/images");
      setImageSrc(nextImageSrc);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "画像のアップロードに失敗しました。");
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

  const handleReorder = async (activeId: number, targetId: number) => {
    if (!isAdmin || activeId === targetId) return;
    const nextItems = moveItem(items, activeId, targetId);
    setItems(nextItems);
    setReordering(true);
    try {
      const ordered = await reorderPartnerCards(token, nextItems.map((item) => item.id));
      setItems(ordered);
    } catch {
      setItems(items);
      alert("順番の保存に失敗しました。");
    } finally {
      setReordering(false);
      setDraggingId(null);
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
              <button onClick={openNew} className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50">
                新規追加
              </button>
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
      {isAdmin && (
        <p className="text-xs text-slate-400">ドラッグして表示順を変更できます。</p>
      )}
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
                <th className="w-12 px-3 py-3 text-left text-xs font-semibold text-slate-500">順番</th>
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
                <tr
                  key={item.id}
                  draggable={isAdmin}
                  onDragStart={() => setDraggingId(item.id)}
                  onDragOver={(e) => {
                    if (!isAdmin) return;
                    e.preventDefault();
                  }}
                  onDrop={() => {
                    if (draggingId !== null) {
                      void handleReorder(draggingId, item.id);
                    }
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={`cursor-pointer hover:bg-slate-50 ${draggingId === item.id ? "opacity-50" : ""} ${reordering ? "pointer-events-none" : ""}`}
                  onClick={() => {
                    setSelectedItem(item);
                    setView("detail");
                  }}
                >
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center text-slate-300">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="overflow-hidden rounded-xl border border-slate-100">
                      <Image src={item.imageSrc} alt="Partner card thumbnail" width={112} height={64} unoptimized className="h-16 w-28 object-cover" />
                    </div>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(item);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-orange-500"
                        >
                          編集
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-600"
                        >
                          削除
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
        )}
      </div>
    </div>
  );
}

export function ServiceItemsTab() {
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = hasAdminAccess(token);
  const [view, setView] = useState<LocalView>("list");
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [items, setItems] = useState<ServiceItemDto[]>([]);
  const [selectedItem, setSelectedItem] = useState<ServiceItemDto | null>(null);
  const [editItem, setEditItem] = useState<ServiceItemDto | null>(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoName, setVideoName] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentData, setAttachmentData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryIconKey, setCategoryIconKey] = useState<ServiceCategoryIconKey>("grid");
  const [categoryEditItem, setCategoryEditItem] = useState<ServiceCategoryDto | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedCategories, fetchedItems] = await Promise.all([
        fetchServiceCategories(),
        fetchServiceItems(),
      ]);
      setCategories(fetchedCategories);
      setItems(fetchedItems);
      setCategory((current) => {
        if (current && fetchedCategories.some((item) => item.slug === current)) {
          return current;
        }
        return fetchedCategories[0]?.slug ?? "";
      });
    } catch {
      setCategories([]);
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
    setCategory(categories[0]?.slug ?? "");
    setTitle("");
    setContent("");
    setVideoName(null);
    setVideoData(null);
    setLinkUrl("");
    setImageName(null);
    setImageData(null);
    setAttachmentName(null);
    setAttachmentData(null);
    setError("");
    setView("form");
  };

  const openEdit = (item: ServiceItemDto) => {
    setEditItem(item);
    setCategory(item.category);
    setTitle(item.title);
    setContent(item.content);
    setVideoName(item.videoName);
    setVideoData(item.videoData);
    setLinkUrl(item.linkUrl ?? "");
    setImageName(item.imageName);
    setImageData(item.imageData);
    setAttachmentName(item.attachmentName);
    setAttachmentData(item.attachmentData);
    setError("");
    setView("form");
  };

  const resetCategoryForm = () => {
    setCategoryEditItem(null);
    setCategoryName("");
    setCategoryIconKey("grid");
  };

  const openCategoryEdit = (item: ServiceCategoryDto) => {
    setCategoryEditItem(item);
    setCategoryName(item.name);
    setCategoryIconKey(
      SERVICE_CATEGORY_ICON_OPTIONS.some((option) => option.key === item.iconKey)
        ? (item.iconKey as ServiceCategoryIconKey)
        : "folder"
    );
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategorySaving(true);
    setError("");
    try {
      if (categoryEditItem) {
        const updated = await updateServiceCategory(token, categoryEditItem.id, {
          name: categoryName,
          iconKey: categoryIconKey,
        });
        setCategories((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createServiceCategory(token, {
          name: categoryName,
          iconKey: categoryIconKey,
        });
        setCategories((prev) => [...prev, created]);
        setCategory((current) => current || created.slug);
      }
      resetCategoryForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "カテゴリの保存に失敗しました。");
    } finally {
      setCategorySaving(false);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!confirm("このカテゴリを削除しますか？")) return;
    try {
      await deleteServiceCategory(token, id);
      const remaining = categories.filter((item) => item.id !== id);
      setCategories(remaining);
      setCategory((current) => (remaining.some((item) => item.slug === current) ? current : remaining[0]?.slug ?? ""));
      resetCategoryForm();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "カテゴリの削除に失敗しました。");
    }
  };

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const data = await uploadFileWithPresign(token, file, "services/attachments");
      setAttachmentName(file.name);
      setAttachmentData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "添付ファイルのアップロードに失敗しました。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const data = await uploadFileWithPresign(token, file, "services/images");
      setImageName(file.name);
      setImageData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const data = await uploadFileWithPresign(token, file, "services/videos");
      setVideoName(file.name);
      setVideoData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "動画のアップロードに失敗しました。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        category,
        title,
        content,
        videoName,
        videoData,
        linkUrl: linkUrl.trim() || null,
        imageName,
        imageData,
        attachmentName,
        attachmentData,
      };

      if (editItem) {
        const updated = await updateServiceItem(token, editItem.id, payload);
        setItems((prev) => prev.map((item) => (item.id === editItem.id ? updated : item)));
        setSelectedItem(updated);
      } else {
        const created = await createServiceItem(token, payload);
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
    if (!confirm("この事業項目を削除しますか？")) return;
    try {
      await deleteServiceItem(token, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("削除に失敗しました。");
    }
  };

  const handleReorder = async (activeId: number, targetId: number) => {
    if (!isAdmin || activeId === targetId) return;
    const nextItems = moveItem(items, activeId, targetId);
    setItems(nextItems);
    setReordering(true);
    try {
      const ordered = await reorderServiceItems(token, nextItems.map((item) => item.id));
      setItems(ordered);
    } catch {
      setItems(items);
      alert("順番の保存に失敗しました。");
    } finally {
      setReordering(false);
      setDraggingId(null);
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
          <h3 className="text-base font-semibold text-slate-900">{editItem ? "事業項目を編集" : "事業項目を追加"}</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={categories.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {categories.map((option) => (
                  <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-2 text-xs text-red-500">先にカテゴリを作成してください。</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">事業タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="事業タイトルを入力"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              placeholder="事業内容を入力してください。"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <p className="mt-2 text-xs leading-6 text-slate-400">
              Markdown が使えます。`#` 見出し、`-` 箇条書き、`**太字**`、`[リンク](URL)` などに対応します。
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">リンク URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">画像</label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <div>
                <p className="text-sm font-medium text-slate-700">{imageName ?? "画像をアップロード"}</p>
                <p className="mt-1 text-xs text-slate-400">{uploading ? "読み込み中..." : "PNG / JPG / WebP など"}</p>
              </div>
              <span className="text-sm font-semibold text-orange-500">選択</span>
            </label>
            {imageData && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
                <Image
                  src={imageData}
                  alt={imageName ?? "Image preview"}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto max-h-72 w-auto rounded-lg object-contain"
                />
              </div>
            )}
            {imageName && (
              <button
                type="button"
                onClick={() => {
                  setImageName(null);
                  setImageData(null);
                }}
                className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600"
              >
                画像を削除
              </button>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">動画ファイル</label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
              <div>
                <p className="text-sm font-medium text-slate-700">{videoName ?? "動画をアップロード"}</p>
                <p className="mt-1 text-xs text-slate-400">{uploading ? "読み込み中..." : "MP4 / WebM / MOV など"}</p>
              </div>
              <span className="text-sm font-semibold text-orange-500">選択</span>
            </label>
            {videoData && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-950">
                <video src={videoData} controls playsInline className="max-h-72 w-full bg-black" />
              </div>
            )}
            {videoName && (
              <button
                type="button"
                onClick={() => {
                  setVideoName(null);
                  setVideoData(null);
                }}
                className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600"
              >
                動画を削除
              </button>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">添付ファイル</label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
              <input type="file" className="hidden" onChange={handleAttachmentChange} />
              <div>
                <p className="text-sm font-medium text-slate-700">{attachmentName ?? "ファイルをアップロード"}</p>
                <p className="mt-1 text-xs text-slate-400">{uploading ? "読み込み中..." : "PDF, image, document など"}</p>
              </div>
              <span className="text-sm font-semibold text-orange-500">選択</span>
            </label>
            {attachmentData && isImageAttachment(attachmentName, attachmentData) && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
                <Image
                  src={attachmentData}
                  alt={attachmentName ?? "Attachment preview"}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto max-h-72 w-auto rounded-lg object-contain"
                />
              </div>
            )}
            {attachmentName && (
              <button
                type="button"
                onClick={() => {
                  setAttachmentName(null);
                  setAttachmentData(null);
                }}
                className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600"
              >
                添付を削除
              </button>
            )}
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setView("list")} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              キャンセル
            </button>
            <button type="submit" disabled={saving || uploading || !category} className="admin-btn-primary px-5 py-2.5">
              {saving ? "保存中..." : editItem ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === "detail" && selectedItem) {
    const categoryInfo = categories.find((item) => item.slug === selectedItem.category);
    const categoryLabel = categoryInfo ? categoryInfo.name : selectedItem.category;
    const hasImageAttachment = isImageAttachment(selectedItem.imageName, selectedItem.imageData);

    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base font-semibold text-slate-900">事業項目詳細</h3>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="space-y-3 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
              {categoryInfo && <span className="mr-1 inline-flex align-middle text-orange-500">{renderServiceCategoryIcon(categoryInfo.iconKey)}</span>}
              {categoryLabel}
            </span>
            <h4 className="text-xl font-bold text-slate-900">{selectedItem.title}</h4>
            <p className="font-mono text-xs text-slate-400">{formatDate(selectedItem.createdAt)}</p>
          </div>
          <div className="space-y-5 px-6 py-6">
            <MarkdownContent content={selectedItem.content} className="space-y-4" />
            {hasImageAttachment && selectedItem.imageData && (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Image
                  src={selectedItem.imageData}
                  alt={selectedItem.imageName ?? "Service image"}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto w-full rounded-xl object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-slate-400">動画</p>
              {selectedItem.videoData ? (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-950">
                  <video src={selectedItem.videoData} controls playsInline className="w-full bg-black" />
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500">未設定</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">詳細サイト</p>
              {selectedItem.linkUrl ? (
                <a href={selectedItem.linkUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex break-all text-sm font-medium text-orange-600 hover:underline">
                  {selectedItem.linkUrl}
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-500">未設定</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">詳細資料</p>
              {selectedItem.attachmentData ? (
                <a
                  href={selectedItem.attachmentData}
                  download={selectedItem.attachmentName ?? "attachment"}
                  className="mt-1 inline-flex text-sm font-semibold text-orange-600 hover:underline"
                >
                  {selectedItem.attachmentName ?? "添付ファイルをダウンロード"}
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-500">添付なし</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
              <button onClick={() => openEdit(selectedItem)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                編集
              </button>
              <button
                onClick={async () => {
                  await handleDelete(selectedItem.id);
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
      {isAdmin && (
        <p className="text-xs text-slate-400">ドラッグして表示順を変更できます。</p>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">カテゴリ管理</h3>
            <p className="mt-1 text-xs text-slate-400">イメージと名前を設定して、事業分野のタブとして使います。</p>
          </div>
          <div className="px-5 py-4">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-400">登録されたカテゴリがありません。</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openCategoryEdit(item)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                      categoryEditItem?.id === item.id
                        ? "border-orange-300 bg-orange-50 text-orange-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-500"
                    }`}
                  >
                    <span className="text-slate-500">{renderServiceCategoryIcon(item.iconKey)}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <form onSubmit={handleCategorySave} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {categoryEditItem ? "カテゴリ編集" : "カテゴリ追加"}
              </h3>
              {categoryEditItem && (
                <button type="button" onClick={resetCategoryForm} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                  新規に戻す
                </button>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">アイコン</label>
              <select
                value={categoryIconKey}
                onChange={(e) => setCategoryIconKey(e.target.value as ServiceCategoryIconKey)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {SERVICE_CATEGORY_ICON_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">カテゴリ名</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                placeholder="カテゴリ名を入力"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                {renderServiceCategoryIcon(categoryIconKey, "h-6 w-6")}
              </div>
              <div className="flex gap-2">
                {categoryEditItem && (
                  <button
                    type="button"
                    onClick={() => handleCategoryDelete(categoryEditItem.id)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    削除
                  </button>
                )}
                <button type="submit" disabled={categorySaving} className="admin-btn-primary px-4 py-2">
                  {categorySaving ? "保存中..." : categoryEditItem ? "更新" : "追加"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">登録された事業項目がありません。</p>
            {isAdmin && (
              <button onClick={openNew} className="mt-3 text-sm font-semibold text-orange-500 hover:underline">
                最初の項目を追加する →
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-12 px-3 py-3 text-left text-xs font-semibold text-slate-500">順番</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">カテゴリ</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">タイトル</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold text-slate-500 md:table-cell">이미지/첨부</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold text-slate-500 md:table-cell">日付</th>
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
                <tr
                  key={item.id}
                  draggable={isAdmin}
                  onDragStart={() => setDraggingId(item.id)}
                  onDragOver={(e) => {
                    if (!isAdmin) return;
                    e.preventDefault();
                  }}
                  onDrop={() => {
                    if (draggingId !== null) {
                      void handleReorder(draggingId, item.id);
                    }
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={`cursor-pointer hover:bg-slate-50 ${draggingId === item.id ? "opacity-50" : ""} ${reordering ? "pointer-events-none" : ""}`}
                  onClick={() => {
                    setSelectedItem(item);
                    setView("detail");
                  }}
                >
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center text-slate-300">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      {(() => {
                        const categoryItem = categories.find((option) => option.slug === item.category);
                        return categoryItem ? categoryItem.name : item.category;
                      })()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="max-w-xs truncate font-medium text-slate-900">{item.title}</p>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <span className="text-xs text-slate-500">
                      {item.imageName ? "画像" : item.attachmentName ? item.attachmentName : "なし"}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <span className="font-mono text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(item);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-orange-500"
                        >
                          編集
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-600"
                        >
                          削除
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
        )}
      </div>
    </div>
  );
}
