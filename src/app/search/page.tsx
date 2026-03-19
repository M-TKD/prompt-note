"use client";

import { useState } from "react";
import { store } from "@/lib/store";
import { PromptDocument, TYPE_CONFIG } from "@/lib/types";
import { Search } from "lucide-react";
import Link from "next/link";

const POPULAR_TAGS = [
  "business", "marketing", "programming", "writing",
  "proposal", "email", "translation", "summary", "image",
  "brainstorm", "analysis", "ChatGPT", "Claude",
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
    <div className="px-6 pt-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Search</h1>
      </div>

      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d1d5db]" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#fafafa] border border-[#f0f0f0] rounded-lg text-sm outline-none focus:border-[#d1d5db] placeholder:text-[#d1d5db] font-mono"
        />
      </div>

      {!searched ? (
        <div>
          <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">Popular tags</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="px-2.5 py-1 text-[11px] text-[#9ca3af] rounded border border-[#f0f0f0] hover:border-[#d1d5db] hover:text-[#6b7280] font-mono"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-[#9ca3af] text-xs font-mono">No results for &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div>
          {results.map((doc) => (
            <Link
              key={doc.id}
              href={`/editor?id=${doc.id}`}
              className="flex items-start gap-3 py-3.5 border-b border-[#f0f0f0] last:border-0"
            >
              <div className={`w-0.5 h-7 rounded-full mt-0.5 shrink-0 ${
                doc.type === "note" ? "bg-[#e5e7eb]" :
                doc.type === "prompt" ? "bg-[#4F46E5]" : "bg-[#9ca3af]"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1a1a1a] truncate">
                  {doc.title || doc.bodyMd.split("\n")[0]?.slice(0, 40) || "Untitled"}
                </p>
                <p className="text-xs text-[#9ca3af] line-clamp-1 mt-0.5">{doc.bodyMd.replace(/\n/g, " ")}</p>
                {doc.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {doc.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-[#d1d5db] font-mono">#{t}</span>
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
