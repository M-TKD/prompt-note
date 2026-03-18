"use client";

import { useState } from "react";
import { store } from "@/lib/store";
import { PromptDocument, TYPE_CONFIG } from "@/lib/types";
import { Search } from "lucide-react";
import Link from "next/link";

const POPULAR_TAGS = [
  "ビジネス", "マーケティング", "プログラミング", "ライティング",
  "企画書", "メール", "翻訳", "要約", "画像生成",
  "ブレスト", "分析", "ChatGPT", "Claude",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PromptDocument[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      setResults(store.search(q));
      setSearched(true);
    } else {
      setResults([]);
      setSearched(false);
    }
  };

  return (
    <div className="px-5 pt-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">さがす</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="キーワードで検索..."
          className="w-full pl-10 pr-4 py-3 bg-neutral-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-neutral-200 placeholder:text-neutral-300"
        />
      </div>

      {!searched ? (
        <div>
          <h2 className="text-xs font-medium text-neutral-400 mb-3 uppercase tracking-wider">人気のタグ</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="px-3 py-1.5 text-xs text-neutral-500 rounded-full border border-neutral-200 hover:border-neutral-400 hover:text-neutral-700 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-400 text-sm">「{query}」の結果なし</p>
        </div>
      ) : (
        <div className="space-y-0">
          {results.map((doc) => (
            <Link
              key={doc.id}
              href={`/editor?id=${doc.id}`}
              className="flex items-start gap-3 py-3.5 border-b border-neutral-100 last:border-0 active:bg-neutral-50"
            >
              <div className={`w-0.5 h-8 rounded-full mt-0.5 shrink-0 ${
                doc.type === "note" ? "bg-neutral-200" :
                doc.type === "prompt" ? "bg-amber-400" : "bg-neutral-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {doc.title || doc.bodyMd.split("\n")[0]?.slice(0, 40) || "無題"}
                </p>
                <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{doc.bodyMd.replace(/\n/g, " ")}</p>
                {doc.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {doc.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-neutral-400">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
