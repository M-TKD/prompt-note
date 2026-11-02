"use client";

import { canSharePublicDocument } from "@/lib/document-access";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/use-store";
import { PromptDocument, CATEGORIES, TYPE_CONFIG } from "@/lib/types";
import { Heart, GitFork, Copy, Check, ExternalLink, Search, X, Sparkles, Download } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { ShareSheet } from "@/components/ShareSheet";
import { useToast } from "@/components/Toast";
import { getOfficialTemplates, isOfficialTemplate, duplicateOfficialTemplate, copyPromptText } from "@/lib/official-templates";

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hybridStore = useStore();
  const { toast } = useToast();
  const [docs, setDocs] = useState<PromptDocument[]>([]);
  const initialCategory = searchParams.get("cat") || "すべて";
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<"popular" | "recent">("popular");
  const [selected, setSelected] = useState<PromptDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [shareDoc, setShareDoc] = useState<PromptDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // 詳細を閉じるまでフォーカスを保持し、Escと元の操作位置への復帰に対応する。
  useEffect(() => {
    if (!selected) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key !== "Tab") return;
      const controls = modalRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex="0"]');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [selected]);

  // 公式テンプレートは利用実績によるランキングに混ぜない。
  const featuredDocs = useMemo(() => {
    return docs.filter(isOfficialTemplate)
      .slice(0, 5);
  }, [docs]);

  const FEATURED_GRADIENTS = [
    "from-[#4F46E5] to-[#7C3AED]",
    "from-[#059669] to-[#0D9488]",
    "from-[#D97706] to-[#EA580C]",
    "from-[#2563EB] to-[#4F46E5]",
    "from-[#DB2777] to-[#9333EA]",
  ];

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return docs;
    return docs.filter(d =>
      (d.title || "").toLowerCase().includes(q) ||
      d.bodyMd.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q)) ||
      (d.author?.name || "").toLowerCase().includes(q)
    );
  }, [docs, searchQuery]);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      hybridStore.ensureSeedData();
      const dbDocuments = hybridStore.isCloud ? await hybridStore.getPublicDocuments(sort, category) : [];

      // 採番済みの公式資料をカテゴリで絞り、実際の公開投稿とは分けて扱う。
      const sampleDocs = getOfficialTemplates(category);
      const uniqueDbDocs = dbDocuments.filter(doc => !isOfficialTemplate(doc) && !doc.id.startsWith("sample-"));
      const documents = [...uniqueDbDocs, ...sampleDocs];
      setDocs(documents);

      // Resolve liked state for all documents
      const liked = new Set<string>();
      await Promise.all(
        documents.filter(doc => !isOfficialTemplate(doc)).map(async (doc) => {
          const isLiked = await hybridStore.isLiked(doc.id);
          if (isLiked) liked.add(doc.id);
        })
      );
      setLikedIds(liked);
    } finally {
      setLoading(false);
    }
  }, [hybridStore, sort, category]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleLike = async (id: string) => {
    const nowLiked = await hybridStore.toggleLike(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (nowLiked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    if (nowLiked) {
      toast("いいねしました");
    }
    // Refetch to update like counts
    fetchDocs();
  };

  const handleCopy = async (doc: PromptDocument) => {
    const success = await copyPromptText(doc.bodyMd, navigator.clipboard);
    if (!success) { toast("コピーできませんでした。本文を選択してコピーするか、.mdで保存してください", "error"); return; }
    setCopiedId(doc.id);
    toast("コピーしました", "copy");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDownload = (doc: PromptDocument) => {
    const filename = (doc.title || "prompt").replace(/[\/\\:*?"<>|]/g, "_") + ".md";
    const blob = new Blob([doc.bodyMd], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("ダウンロードしました");
  };

  const handleFork = async (doc: PromptDocument) => {
    try {
      const forked = isOfficialTemplate(doc)
        ? await duplicateOfficialTemplate(doc, data => hybridStore.create(data))
        : await hybridStore.fork(doc.id);
      if (forked) {
        toast("自分のノートに非公開で保存しました");
        setSelected(null);
        router.push(`/editor?id=${forked.id}`);
      } else { toast("保存できませんでした。もう一度お試しください", "error"); }
    } catch { toast("保存できませんでした。もう一度お試しください", "error"); }
  };

  return (
    <div className="px-4 pt-14 md:w-screen md:relative md:left-1/2 md:-translate-x-1/2 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">テンプレートを探す</h1>
        <p className="text-xs text-[#9ca3af] mt-1 font-sans">公式テンプレートと公開プロンプト。自分のノートに保存して使えます。</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="プロンプトを検索..."
          className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#f5f5f5] dark:bg-[#222] border-0 rounded-xl text-[#1a1a1a] dark:text-white placeholder-[#9ca3af] outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Featured / Pickup Banner */}
      {!searchQuery && !loading && featuredDocs.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span className="text-[11px] font-bold text-[#1a1a1a] dark:text-white tracking-wide">公式テンプレート</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16">
            {featuredDocs.map((doc, i) => {
              const title = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 30) || "Untitled";
              return (
                <button
                  type="button"
                  key={`featured-${doc.id}`}
                  onClick={() => setSelected(doc)}
                  className={`shrink-0 w-[200px] md:w-[280px] lg:w-[300px] p-4 md:p-5 rounded-2xl bg-gradient-to-br ${FEATURED_GRADIENTS[i % FEATURED_GRADIENTS.length]} cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[11px] text-white/90">すぐ使える指示のひな形</span>
                  </div>
                  <p className="text-white font-bold text-[13px] leading-tight line-clamp-2 mb-2">{title}</p>
                  <div className="flex items-center gap-3">
                    {doc.tags[0] && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white/90">{doc.tags[0]}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories with count badges */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const count = cat === "すべて"
            ? docs.length
            : docs.filter(d => d.tags.includes(cat)).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5 ${
                category === cat
                  ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]"
                  : "bg-[#f5f5f5] dark:bg-[#222] text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#e5e7eb] dark:hover:bg-[#333]"
              }`}
            >
              {cat}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-sans ${
                category === cat
                  ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#1a1a1a]"
                  : "bg-[#e5e7eb] dark:bg-[#333] text-[#9ca3af]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex gap-4 mb-6 text-[11px] border-b border-[#f0f0f0] dark:border-[#333]">
        {[
          { key: "popular" as const, label: "公開投稿：人気順" },
          { key: "recent" as const, label: "公開投稿：新着順" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`pb-2 font-sans tracking-wide ${
              sort === s.key ? "text-[#1a1a1a] dark:text-white border-b-2 border-[#1a1a1a] dark:border-white" : "text-[#d1d5db] dark:text-[#6b7280]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center py-28">
          <p className="text-[#6b7280] text-sm">読み込み中…</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-28">
          <p className="text-[#d1d5db] text-sm">{searchQuery ? "検索結果がありません" : "公開されたプロンプトはまだありません"}</p>
          <p className="text-[#e5e7eb] dark:text-[#444] text-xs mt-1.5 font-sans">{searchQuery ? `"${searchQuery}" に一致するプロンプトが見つかりません` : "公式テンプレートや自分のノートから始めてみてください"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4 pb-24">
          {filteredDocs.map((doc) => {
            const displayTitle = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 30) || "Untitled";
            const bodyPreview = doc.bodyMd.replace(/^#+\s*.*\n?/, "").replace(/\n/g, " ").slice(0, 50);
            return (
              <div
                key={doc.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(doc)}
                onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setSelected(doc); } }}
                className="p-3 rounded-xl border border-[#f0f0f0] dark:border-[#333] bg-white dark:bg-[#141414] cursor-pointer hover:border-[#4F46E5]/30 active:bg-[#fafafa] dark:active:bg-[#1a1a1a] flex flex-col"
              >
                {/* Icon + Type */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#4F46E5] text-xs font-bold">{TYPE_CONFIG[doc.type].icon}</span>
                  </div>
                  {doc.tags[0] && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f5f5f5] dark:bg-[#222] text-[#6b7280] dark:text-[#9ca3af] font-medium truncate">
                      {doc.tags[0]}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="font-bold text-sm text-[#1a1a1a] dark:text-white line-clamp-2 leading-snug mb-1">{displayTitle}</p>

                {/* Preview */}
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] line-clamp-2 leading-relaxed mb-auto">{bodyPreview}</p>

                {/* Footer: author + stats */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#f5f5f5] dark:border-[#222]">
                  {doc.author && (
                    <span className="text-[9px] text-[#b0b0b0] dark:text-[#555] font-sans truncate max-w-[60px]">
                      {doc.author.name.split(" ")[0]}
                    </span>
                  )}
                  {isOfficialTemplate(doc) ? <span className="text-[10px] text-[#4F46E5]">公式テンプレート</span> : <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(doc.id); }}
                      className={`flex items-center gap-0.5 text-[9px] font-medium ${
                        likedIds.has(doc.id)
                          ? "text-[#4F46E5]"
                          : "text-[#c0c0c0] dark:text-[#555] hover:text-[#4F46E5]"
                      }`}
                    >
                      <Heart className={`w-2.5 h-2.5 ${likedIds.has(doc.id) ? "fill-current" : ""}`} />
                      {doc.likeCount}
                    </button>
                    {doc.forkCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[9px] text-[#059669] font-medium">
                        <GitFork className="w-2.5 h-2.5" />
                        {doc.forkCount}
                      </span>
                    )}
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 詳細をbody直下に置き、下ナビや変形された親要素より前に表示する。 */}
      {selected && createPortal(
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-end md:items-center justify-center p-2 md:p-6" onClick={() => setSelected(null)}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="template-detail-title" className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl flex flex-col max-h-[90dvh] shadow-xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-start gap-3 p-5 border-b border-[#e5e7eb] dark:border-[#333] shrink-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#4F46E5] mb-1">{isOfficialTemplate(selected) ? "公式テンプレート" : "公開プロンプト"}</p>
                <h2 id="template-detail-title" className="font-bold text-base dark:text-white">{selected.title || "プロンプトの詳細"}</h2>
                <p className="text-xs text-[#6b7280] mt-1">{TYPE_CONFIG[selected.type].label} · {selected.tags.join(" / ")}</p>
              </div>
              <button ref={closeRef} type="button" onClick={() => setSelected(null)} aria-label="詳細を閉じる" className="p-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#333] dark:text-white focus-visible:outline-2 focus-visible:outline-[#4F46E5]"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto min-h-0 p-5 markdown-preview">
              {!isOfficialTemplate(selected) && selected.author && <p className="text-xs text-[#6b7280] mb-4">投稿者：{selected.author.name}</p>}
              <MarkdownPreview content={selected.bodyMd} />
            </div>
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#333] shrink-0 bg-white dark:bg-[#1a1a1a] rounded-b-2xl">
              <div className="flex gap-2">
                <button onClick={() => handleCopy(selected)} className="flex-1 py-3 border border-[#d1d5db] dark:border-[#555] rounded-xl text-sm font-medium flex items-center justify-center gap-1 dark:text-white">
                  {copiedId === selected.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} コピー
                </button>
                <button onClick={() => handleFork(selected)} className="flex-1 py-3 bg-[#4F46E5] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1"><GitFork className="w-4 h-4" /> 保存して編集</button>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-[#6b7280] dark:text-[#ccc]">
                <button onClick={() => handleDownload(selected)} className="inline-flex gap-1 items-center py-1"><Download className="w-3.5 h-3.5" /> .mdで保存</button>
                {!isOfficialTemplate(selected) && canSharePublicDocument(hybridStore.isCloud, selected.visibility, selected.id) && <>
                  <button onClick={() => { setSelected(null); setShareDoc(selected); }} className="py-1">SNSで共有</button>
                  <a href={`/p/${selected.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1 items-center py-1"><ExternalLink className="w-3.5 h-3.5" /> 公開ページ</a>
                </>}
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {/* SNS Share Sheet */}
      {shareDoc && !isOfficialTemplate(shareDoc) && (
        <ShareSheet
          url={`https://prompt-notes.ai/p/${shareDoc.id}`}
          title={shareDoc.title || "Prompt"}
          tags={shareDoc.tags}
          onClose={() => setShareDoc(null)}
        />
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="px-6 pt-14">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">テンプレートを探す</h1>
          <p className="text-xs text-[#9ca3af] mt-1 font-sans">Loading...</p>
        </div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
