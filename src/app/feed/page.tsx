"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/use-store";
import { PromptDocument, CATEGORIES, TYPE_CONFIG } from "@/lib/types";
import { Heart, GitFork, Copy, Check } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { useToast } from "@/components/Toast";

export default function FeedPage() {
  const router = useRouter();
  const hybridStore = useStore();
  const { toast } = useToast();
  const [docs, setDocs] = useState<PromptDocument[]>([]);
  const [category, setCategory] = useState("すべて");
  const [sort, setSort] = useState<"popular" | "recent">("popular");
  const [selected, setSelected] = useState<PromptDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

      {/* Categories */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded text-[11px] font-mono whitespace-nowrap ${
              category === cat
                ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]"
                : "text-[#d1d5db] dark:text-[#6b7280] hover:text-[#6b7280]"
            }`}
          >
            {cat}
          </button>
        ))}
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
        <div>
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelected(doc)}
              className="py-4 border-b border-[#f0f0f0] dark:border-[#333] last:border-0 cursor-pointer"
            >
              <p className="font-medium text-sm text-[#1a1a1a] dark:text-white mb-1">{doc.title || doc.bodyMd.split("\n")[0]?.slice(0, 40)}</p>
              <p className="text-xs text-[#9ca3af] line-clamp-2 mb-2 leading-relaxed">{doc.bodyMd.replace(/\n/g, " ")}</p>

              {doc.tags.length > 0 && (
                <div className="flex gap-1.5 mb-2">
                  {doc.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] text-[#d1d5db] font-mono">#{t}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-[10px] text-[#d1d5db] font-mono">
                <button onClick={(e) => { e.stopPropagation(); handleLike(doc.id); }} className={`flex items-center gap-1 hover:text-[#4F46E5] ${likedIds.has(doc.id) ? "text-[#4F46E5]" : ""}`}>
                  <Heart className={`w-3 h-3 ${likedIds.has(doc.id) ? "fill-current" : ""}`} /> {doc.likeCount}
                </button>
                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {doc.forkCount}</span>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(doc); }} className="ml-auto hover:text-[#6b7280]">
                  {copiedId === doc.id ? <Check className="w-3 h-3 text-[#4F46E5]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-6 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-4" />
            <h2 className="font-bold text-base tracking-tight mb-2 dark:text-white">{selected.title || "Prompt Detail"}</h2>
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
            <button onClick={() => setSelected(null)} className="w-full text-center text-[11px] text-[#d1d5db] py-2 mt-2">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
