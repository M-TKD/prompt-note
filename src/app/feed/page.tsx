"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { PromptDocument, CATEGORIES, TYPE_CONFIG } from "@/lib/types";
import { Heart, GitFork, Copy, Check } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import Link from "next/link";

export default function FeedPage() {
  const [docs, setDocs] = useState<PromptDocument[]>([]);
  const [category, setCategory] = useState("すべて");
  const [sort, setSort] = useState<"popular" | "recent">("popular");
  const [selected, setSelected] = useState<PromptDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setDocs(store.getPublicDocuments(sort, category));
  }, [sort, category]);

  const handleLike = (id: string) => {
    store.toggleLike(id);
    setDocs(store.getPublicDocuments(sort, category));
  };

  const handleCopy = (doc: PromptDocument) => {
    navigator.clipboard.writeText(doc.bodyMd);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="px-5 pt-12">
      <h1 className="text-3xl font-bold tracking-tight mb-1">みつける</h1>
      <p className="text-sm text-neutral-400 mb-6">みんなのプロンプト</p>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              category === cat
                ? "bg-neutral-900 text-white"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-3 mb-5 text-xs">
        {[
          { key: "popular" as const, label: "人気" },
          { key: "recent" as const, label: "新着" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`font-medium transition ${
              sort === s.key ? "text-neutral-900 underline underline-offset-4" : "text-neutral-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {docs.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-neutral-300 text-sm">まだ公開Promptがありません</p>
          <p className="text-neutral-200 text-xs mt-1">最初の投稿者になりましょう</p>
        </div>
      ) : (
        <div className="space-y-0">
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelected(doc)}
              className="py-4 border-b border-neutral-100 last:border-0 cursor-pointer active:bg-neutral-50 transition"
            >
              <p className="font-semibold text-sm mb-1">{doc.title || doc.bodyMd.split("\n")[0]?.slice(0, 40)}</p>
              <p className="text-xs text-neutral-400 line-clamp-2 mb-2 leading-relaxed">{doc.bodyMd.replace(/\n/g, " ")}</p>

              {doc.tags.length > 0 && (
                <div className="flex gap-1.5 mb-2">
                  {doc.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] text-neutral-400">#{t}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-[11px] text-neutral-300">
                <button onClick={(e) => { e.stopPropagation(); handleLike(doc.id); }} className="flex items-center gap-1 hover:text-amber-500">
                  <Heart className="w-3.5 h-3.5" /> {doc.likeCount}
                </button>
                <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {doc.forkCount}</span>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(doc); }} className="ml-auto hover:text-neutral-600">
                  {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-amber-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-1 bg-neutral-200 rounded-full mx-auto mb-4" />
            <h2 className="font-bold text-lg tracking-tight mb-2">{selected.title || "プロンプト詳細"}</h2>
            <div className="flex gap-1.5 mb-3">
              <span className="text-[11px] text-neutral-400 font-medium">{TYPE_CONFIG[selected.type].label}</span>
              {selected.tags.map((t) => <span key={t} className="text-[11px] text-neutral-400">#{t}</span>)}
            </div>
            <div className="markdown-preview bg-neutral-50 p-4 rounded-xl mb-4">
              <MarkdownPreview content={selected.bodyMd} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopy(selected)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium flex items-center justify-center gap-1 hover:bg-neutral-50">
                <Copy className="w-4 h-4" /> コピー
              </button>
              <Link href={`/editor?mode=quick`} onClick={() => { store.fork(selected.id); }} className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-1 active:scale-[0.98] transition-transform">
                <GitFork className="w-4 h-4" /> フォーク
              </Link>
            </div>
            <button onClick={() => setSelected(null)} className="w-full text-center text-xs text-neutral-400 py-2 mt-2">閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
