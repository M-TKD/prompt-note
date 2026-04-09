"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/use-store";
import { PromptDocument, CATEGORIES, TYPE_CONFIG, SAMPLE_PROMPTS } from "@/lib/types";
import { Heart, GitFork, Copy, Check, ExternalLink, Search, X, TrendingUp, Sparkles, Download } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { ShareSheet } from "@/components/ShareSheet";
import { useToast } from "@/components/Toast";

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

  // Top 5 most popular for the featured banner
  const featuredDocs = useMemo(() => {
    return [...docs]
      .sort((a, b) => b.likeCount - a.likeCount)
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
      const dbDocuments = await hybridStore.getPublicDocuments(sort, category);

      // Always merge SAMPLE_PROMPTS (filtered by category) to guarantee display
      const sampleDocs: PromptDocument[] = SAMPLE_PROMPTS
        .filter((s) => !category || category === "すべて" || s.tags.includes(category))
        .map((s, i) => ({
          ...s,
          id: `sample-${i}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
          author: { name: "PromptNotes Official" },
        }));

      // Deduplicate: remove any DB docs that overlap with samples (by userId or title match)
      const sampleTitles = new Set(sampleDocs.map(s => s.title));
      const uniqueDbDocs = dbDocuments.filter(d => !sampleTitles.has(d.title) && !d.id.startsWith("sample-"));

      let documents = [...uniqueDbDocs, ...sampleDocs];
      if (sort === "popular") {
        documents.sort((a, b) => b.likeCount - a.likeCount);
      } else {
        documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      setDocs(documents);

      // Resolve liked state for all documents
      const liked = new Set<string>();
      await Promise.all(
        documents.map(async (doc) => {
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

  const handleCopy = (doc: PromptDocument) => {
    navigator.clipboard.writeText(doc.bodyMd);
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
    const forked = await hybridStore.fork(doc.id);
    if (forked) {
      toast("フォークしました");
      setSelected(null);
      router.push(`/editor?id=${forked.id}`);
    }
  };

  return (
    <div className="px-6 pt-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Explore</h1>
        <p className="text-xs text-[#9ca3af] mt-1 font-mono">Community prompts</p>
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
            <span className="text-[11px] font-bold text-[#1a1a1a] dark:text-white tracking-wide">PICKUP</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
            {featuredDocs.map((doc, i) => {
              const title = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 30) || "Untitled";
              return (
                <div
                  key={`featured-${doc.id}`}
                  onClick={() => setSelected(doc)}
                  className={`shrink-0 w-[200px] p-4 rounded-2xl bg-gradient-to-br ${FEATURED_GRADIENTS[i % FEATURED_GRADIENTS.length]} cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3 h-3 text-white/70" />
                    <span className="text-[9px] font-mono text-white/70 uppercase tracking-wider">#{i + 1} Popular</span>
                  </div>
                  <p className="text-white font-bold text-[13px] leading-tight line-clamp-2 mb-2">{title}</p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-white/80 text-[10px]">
                      <Heart className="w-3 h-3" /> {doc.likeCount}
                    </span>
                    {doc.tags[0] && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white/90">{doc.tags[0]}</span>
                    )}
                  </div>
                </div>
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
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
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
          { key: "popular" as const, label: "Popular" },
          { key: "recent" as const, label: "Recent" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`pb-2 font-mono tracking-wide ${
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
          <p className="text-[#d1d5db] text-sm font-mono">Loading...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-28">
          <p className="text-[#d1d5db] text-sm">{searchQuery ? "検索結果がありません" : "No public prompts yet"}</p>
          <p className="text-[#e5e7eb] dark:text-[#444] text-xs mt-1.5 font-mono">{searchQuery ? `"${searchQuery}" に一致するプロンプトが見つかりません` : "Be the first"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 pb-24">
          {filteredDocs.map((doc) => {
            const displayTitle = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 30) || "Untitled";
            const bodyPreview = doc.bodyMd.replace(/^#+\s*.*\n?/, "").replace(/\n/g, " ").slice(0, 50);
            return (
              <div
                key={doc.id}
                onClick={() => setSelected(doc)}
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
                <p className="font-bold text-[12px] text-[#1a1a1a] dark:text-white line-clamp-2 leading-snug mb-1">{displayTitle}</p>

                {/* Preview */}
                <p className="text-[10px] text-[#9ca3af] line-clamp-2 leading-relaxed mb-auto">{bodyPreview}</p>

                {/* Footer: author + stats */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#f5f5f5] dark:border-[#222]">
                  {doc.author && (
                    <span className="text-[9px] text-[#b0b0b0] dark:text-[#555] font-mono truncate max-w-[60px]">
                      {doc.author.name.split(" ")[0]}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto">
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-6 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-4" />
            <h2 className="font-bold text-base tracking-tight mb-2 dark:text-white">{selected.title || "Prompt Detail"}</h2>

            {/* Author in modal */}
            {selected.author && (
              <button
                onClick={() => { setSelected(null); router.push(`/profile?userId=${selected.userId}`); }}
                className="flex items-center gap-1.5 mb-3"
              >
                {selected.author.avatarUrl ? (
                  <img
                    src={selected.author.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-[#e5e7eb] dark:ring-[#444]"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#f3f4f6] dark:bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold text-[#9ca3af] dark:text-[#6b7280]">
                    {selected.author.name[0].toUpperCase()}
                  </span>
                )}
                <span className="text-[11px] text-[#9ca3af] dark:text-[#6b7280] font-mono">
                  {selected.author.name}
                </span>
              </button>
            )}

            <div className="flex gap-1.5 mb-3">
              <span className="text-[10px] text-[#9ca3af] font-mono">{TYPE_CONFIG[selected.type].label}</span>
              {selected.tags.map((t) => <span key={t} className="text-[10px] text-[#d1d5db] font-mono">#{t}</span>)}
            </div>
            <div className="markdown-preview bg-[#fafafa] dark:bg-[#222] p-4 rounded-xl mb-4 border border-[#f0f0f0] dark:border-[#333]">
              <MarkdownPreview content={selected.bodyMd} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopy(selected)} className="flex-1 py-2.5 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#fafafa] dark:hover:bg-[#222] dark:text-[#e5e7eb]">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button
                onClick={() => handleFork(selected)}
                className="flex-1 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-xl text-xs font-medium text-center flex items-center justify-center gap-1"
              >
                <GitFork className="w-3.5 h-3.5" /> Fork
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => handleDownload(selected)}
                className="py-2.5 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#fafafa] dark:hover:bg-[#222] dark:text-[#e5e7eb]"
              >
                <Download className="w-3.5 h-3.5" /> .md
              </button>
              <button
                onClick={() => { setSelected(null); setShareDoc(selected); }}
                className="py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1"
              >
                SNSで共有
              </button>
              <a
                href={`/p/${selected.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#fafafa] dark:hover:bg-[#222] dark:text-[#e5e7eb] no-underline text-[#1a1a1a] dark:text-[#e5e7eb]"
              >
                <ExternalLink className="w-3.5 h-3.5" /> 詳細
              </a>
            </div>
            <button onClick={() => setSelected(null)} className="w-full text-center text-[11px] text-[#d1d5db] py-2 mt-2">Close</button>
          </div>
        </div>
      )}

      {/* SNS Share Sheet */}
      {shareDoc && (
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
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Explore</h1>
          <p className="text-xs text-[#9ca3af] mt-1 font-mono">Loading...</p>
        </div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
