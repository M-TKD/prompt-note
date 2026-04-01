"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/use-store";
import { PromptDocument, CATEGORIES, TYPE_CONFIG } from "@/lib/types";
import { Heart, GitFork, Copy, Check, Share2, ExternalLink } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
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
  const [sharedId, setSharedId] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      hybridStore.ensureSeedData();
      const documents = await hybridStore.getPublicDocuments(sort, category);
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
    // Refetch documents to update like counts
    const documents = await hybridStore.getPublicDocuments(sort, category);
    setDocs(documents);
  };

  const handleCopy = (doc: PromptDocument) => {
    navigator.clipboard.writeText(doc.bodyMd);
    setCopiedId(doc.id);
    toast("コピーしました", "copy");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleShare = (doc: PromptDocument) => {
    const url = `https://prompt-notes.ai/p/${doc.id}`;
    navigator.clipboard.writeText(url);
    setSharedId(doc.id);
    toast("シェアURLをコピーしました", "copy");
    setTimeout(() => setSharedId(null), 1500);
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
      ) : docs.length === 0 ? (
        <div className="text-center py-28">
          <p className="text-[#d1d5db] text-sm">No public prompts yet</p>
          <p className="text-[#e5e7eb] dark:text-[#444] text-xs mt-1.5 font-mono">Be the first</p>
        </div>
      ) : (
        <div className="space-y-3 pb-24">
          {docs.map((doc) => {
            const displayTitle = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 40) || "Untitled";
            const bodyPreview = doc.bodyMd.replace(/^#+\s*.*\n?/, "").replace(/\n/g, " ").slice(0, 80);
            return (
              <div
                key={doc.id}
                onClick={() => setSelected(doc)}
                className="p-4 rounded-xl border border-[#f0f0f0] dark:border-[#333] bg-white dark:bg-[#141414] cursor-pointer hover:border-[#4F46E5]/30 active:bg-[#fafafa] dark:active:bg-[#1a1a1a]"
              >
                {/* Title + Author row */}
                <div className="flex items-start gap-3 mb-2">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#4F46E5] text-sm font-bold">{TYPE_CONFIG[doc.type].icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1a1a1a] dark:text-white truncate">{displayTitle}</p>
                    <p className="text-xs text-[#9ca3af] line-clamp-2 mt-0.5 leading-relaxed">{bodyPreview}</p>
                  </div>
                </div>

                {/* Bottom: tags + stats */}
                <div className="flex items-center gap-2 mt-3">
                  {/* Category tags */}
                  {doc.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f5f5f5] dark:bg-[#222] text-[#6b7280] dark:text-[#9ca3af] font-medium">
                      {t}
                    </span>
                  ))}

                  {/* Author */}
                  {doc.author && (
                    <span className="text-[10px] text-[#9ca3af] dark:text-[#6b7280] font-mono ml-auto mr-2 truncate max-w-[100px]">
                      by {doc.author.name}
                    </span>
                  )}

                  {/* Like badge */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLike(doc.id); }}
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      likedIds.has(doc.id)
                        ? "bg-[#4F46E5]/10 text-[#4F46E5]"
                        : "bg-[#f5f5f5] dark:bg-[#222] text-[#9ca3af] hover:text-[#4F46E5]"
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${likedIds.has(doc.id) ? "fill-current" : ""}`} />
                    {doc.likeCount}
                  </button>

                  {/* Fork badge */}
                  {doc.forkCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-[#065F46]/20 text-[#059669] font-medium">
                      <GitFork className="w-3 h-3" />
                      {doc.forkCount}
                    </span>
                  )}
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
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleShare(selected)}
                className="flex-1 py-2.5 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#fafafa] dark:hover:bg-[#222] dark:text-[#e5e7eb]"
              >
                {sharedId === selected.id ? <Check className="w-3.5 h-3.5 text-[#4F46E5]" /> : <Share2 className="w-3.5 h-3.5" />}
                Share URL
              </button>
              <a
                href={`/p/${selected.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#fafafa] dark:hover:bg-[#222] dark:text-[#e5e7eb] no-underline text-[#1a1a1a] dark:text-[#e5e7eb]"
              >
                <ExternalLink className="w-3.5 h-3.5" /> 詳細ページ
              </a>
            </div>
            <button onClick={() => setSelected(null)} className="w-full text-center text-[11px] text-[#d1d5db] py-2 mt-2">Close</button>
          </div>
        </div>
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
