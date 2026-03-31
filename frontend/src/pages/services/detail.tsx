import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GridRunnerBackdrop from "@/components/ui/GridRunnerBackdrop";
import MarkdownContent, { stripMarkdown } from "@/components/ui/MarkdownContent";
import { renderServiceCategoryIcon } from "@/components/ui/service-category-icons";
import { fetchServiceCategories, fetchServiceItemDetail, type ServiceCategoryDto, type ServiceContentBlock, type ServiceItemDto } from "@/lib/api";
import { withTrailingSlash } from "@/lib/site";

export default function ServiceDetailQueryPage() {
  const router = useRouter();
  const [currentItem, setCurrentItem] = useState<ServiceItemDto | null>(null);
  const [currentCategories, setCurrentCategories] = useState<ServiceCategoryDto[]>([]);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const currentId = Number(router.query.id ?? 0);

  useEffect(() => {
    if (!currentId) return;

    let active = true;
    setLoading(true);

    Promise.all([fetchServiceItemDetail(currentId), fetchServiceCategories()])
      .then(([nextItem, nextCategories]) => {
        if (!active) return;
        setCurrentItem(nextItem);
        setCurrentCategories(nextCategories);
      })
      .catch(() => {
        if (!active) return;
        setCurrentItem(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentId]);

  const categoryInfo = currentItem
    ? currentCategories.find((category) => category.slug === currentItem.category) ?? null
    : null;
  const categoryLabel = categoryInfo ? categoryInfo.name : currentItem?.category ?? "";
  const contentBlocks = currentItem?.contentBlocks ?? [];
  const hasTextBlock = contentBlocks.some((block) => block.type === "text" && block.content?.trim());
  const hasImageBlock = contentBlocks.some((block) => block.type === "image" && block.url);
  const hasVideoBlock = contentBlocks.some((block) => block.type === "video" && block.url);
  const hasAttachmentBlock = contentBlocks.some((block) => block.type === "attachment" && block.url);
  const legacyAllImageAssets = currentItem?.imageAssets?.length
    ? currentItem.imageAssets
    : currentItem?.imageData
      ? [{ name: currentItem.imageName, url: currentItem.imageData }]
      : [];
  const legacyImageAssets = legacyAllImageAssets.slice(1);
  const legacyVideoAssets = currentItem?.videoAssets?.length
    ? currentItem.videoAssets
    : currentItem?.videoData
      ? [{ name: currentItem.videoName, url: currentItem.videoData }]
      : [];
  const legacyAttachmentAssets = currentItem?.attachmentAssets?.length
    ? currentItem.attachmentAssets
    : currentItem?.attachmentData
      ? [{ name: currentItem.attachmentName, url: currentItem.attachmentData }]
      : [];
  const description =
    currentItem
      ? stripMarkdown(currentItem.content).slice(0, 120) ||
        "株式会社マウンテンの事業紹介詳細です。画像・動画・関連資料をご確認いただけます。"
      : "株式会社マウンテンの事業紹介詳細です。";
  const canonicalUrl = currentItem ? `${withTrailingSlash("/services/detail")}?id=${currentItem.id}` : withTrailingSlash("/services/detail");

  const handleAttachmentDownload = async (asset: { name: string | null; url: string }) => {
    try {
      setDownloadingUrl(asset.url);
      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error("Failed to download attachment");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = asset.name?.trim() || "attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(asset.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingUrl((current) => (current === asset.url ? null : current));
    }
  };

  const renderContentBlock = (block: ServiceContentBlock, index: number) => {
    if (!currentItem) return null;

    if (block.type === "text" && block.content) {
      return <MarkdownContent key={`block-${index}`} content={block.content} className="space-y-4" />;
    }

    if ((block.type === "image" || block.type === "video" || block.type === "attachment") && !block.url) {
      return null;
    }

    if (block.type === "image") {
      return (
        <div key={`block-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <Image
            src={block.url as string}
            alt={block.name ?? currentItem.title}
            width={1400}
            height={900}
            unoptimized
            className="h-auto w-full rounded-xl object-contain"
          />
        </div>
      );
    }

    if (block.type === "video") {
      return (
        <div key={`block-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-950">
          <video src={block.url as string} controls playsInline className="w-full bg-black" />
        </div>
      );
    }

    if (block.type === "attachment") {
      return (
        <div key={`block-${index}`} className="flex">
          <button
            type="button"
            onClick={() => {
              void handleAttachmentDownload({ name: block.name, url: block.url as string });
            }}
            className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-semibold text-orange-600 transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
          >
            {downloadingUrl === block.url ? "ダウンロード中..." : "添付ファイルをダウンロード"}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Head>
        <title>{currentItem?.title ?? "事業詳細"}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        {currentItem && <meta property="og:title" content={currentItem.title} />}
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
      </Head>

      <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_28%,#f8fafc_100%)]">
        <section className="relative overflow-hidden border-b border-orange-100/70 bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.28),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(148,163,184,0.22),transparent_30%)]" />
          <GridRunnerBackdrop />
          <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-14">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white">
              <span className="text-orange-300">株式会社</span>
              <span>MOUNTAIN</span>
            </Link>

            <div className="mt-10 max-w-3xl">
              {loading || !currentItem ? (
                <div className="space-y-4">
                  <div className="h-7 w-28 rounded-full bg-white/10" />
                  <div className="h-12 w-full max-w-2xl rounded-2xl bg-white/10" />
                  <div className="h-5 w-40 rounded-full bg-white/10" />
                </div>
              ) : (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                    {renderServiceCategoryIcon(categoryInfo?.iconKey ?? "folder")}
                    {categoryLabel}
                  </span>
                  <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">
                    {currentItem.title}
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
          {!loading && currentItem ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
              <article className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="space-y-8 px-6 py-8 sm:px-8 sm:py-10">
                  {!hasTextBlock && currentItem.content.trim() && (
                    <MarkdownContent content={currentItem.content} className="space-y-4" />
                  )}
                  {contentBlocks.map(renderContentBlock)}
                  {!hasImageBlock && legacyImageAssets.length > 0 && (
                    <div className="space-y-4">
                      {legacyImageAssets.map((asset, index) => (
                        <div key={`legacy-image-${asset.url}-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <Image src={asset.url} alt={asset.name ?? currentItem.title} width={1400} height={900} unoptimized className="h-auto w-full rounded-xl object-contain" />
                        </div>
                      ))}
                    </div>
                  )}
                  {!hasVideoBlock && legacyVideoAssets.length > 0 && (
                    <div className="grid gap-4">
                      {legacyVideoAssets.map((asset, index) => (
                        <div key={`legacy-video-${asset.url}-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-950">
                          <video src={asset.url} controls playsInline className="w-full bg-black" />
                        </div>
                      ))}
                    </div>
                  )}
                  {!hasAttachmentBlock && legacyAttachmentAssets.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {legacyAttachmentAssets.map((asset, index) => (
                        <button
                          key={`legacy-attachment-${asset.url}-${index}`}
                          type="button"
                          onClick={() => {
                            void handleAttachmentDownload(asset);
                          }}
                          className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-semibold text-orange-600 transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                        >
                          {downloadingUrl === asset.url ? "ダウンロード中..." : "添付ファイルをダウンロード"}
                        </button>
                      ))}
                    </div>
                  )}
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
                      <dd className="mt-1 font-mono text-sm text-slate-700">{currentItem.createdAt.slice(0, 10).replaceAll("-", ".")}</dd>
                    </div>
                  </dl>
                </div>

                {currentItem.linkUrl && (
                  <a
                    href={currentItem.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-500 hover:shadow-sm hover:shadow-orange-100"
                  >
                    詳細サイト
                  </a>
                )}

                <Link
                  href="/services/"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-500 hover:shadow-sm hover:shadow-orange-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  一覧へ戻る
                </Link>
              </aside>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
              詳細情報を読み込めませんでした。
            </div>
          )}
        </section>
      </div>
    </>
  );
}
