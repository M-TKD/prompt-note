"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { PromptDocument, TYPE_CONFIG, DocumentType } from "@/lib/types";
import { Trash2 } from "lucide-react";

export default function HomePage() {
  const [documents, setDocuments] = useState<PromptDocument[]>([]);
  const [filter, setFilter] = useState<DocumentType | "all">("all");
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  useEffect(() => {
    setDocuments(store.getDocuments());
  }, []);

  const filtered = filter === "all" ? documents : documents.filter((d) => d.type === filter);

  const noteCount = documents.filter((d) => d.type === "note").length;
  const promptCount = documents.filter((d) => d.type === "prompt").length;
  const showSuggestion = !suggestionDismissed && noteCount >= 3 && promptCount === 0;

  const handleDelete = (id: string) => {
    if (confirm("削除しますか？")) {
      store.delete(id);
      setDocuments(store.getDocuments());
    }
  };

  return (
    <div className="px-6 pt-14">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Notes</h1>
        <p className="text-xs text-[#9ca3af] mt-1 font-mono">{documents.length} items</p>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-8 border-b border-[#f0f0f0]">
        {[
          { key: "all" as const, label: "All" },
          { key: "note" as const, label: "Memo" },
          { key: "prompt" as const, label: "Prompt" },
          { key: "template" as const, label: "Template" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`pb-2.5 text-xs font-medium tracking-wide ${
              filter === f.key
                ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]"
                : "text-[#d1d5db]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Promotion suggestion */}
      {showSuggestion && (
        <div className="mb-6 p-4 border border-[#EEF2FF] bg-[#EEF2FF]/30 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-sm text-[#1a1a1a]">Promptに昇格しませんか？</p>
              <p className="text-xs text-[#9ca3af] mt-1">AI添削や共有が使えます</p>
            </div>
            <button onClick={() => setSuggestionDismissed(true)} className="text-[#d1d5db] text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="text-center py-28">
          <p className="text-[#d1d5db] text-sm">No notes yet</p>
          <p className="text-[#e5e7eb] text-xs mt-1.5">Tap + to start</p>
        </div>
      ) : (
        <div>
          {filtered.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onDelete={() => handleDelete(doc.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentRow({ doc, onDelete }: { doc: PromptDocument; onDelete: () => void }) {
  const config = TYPE_CONFIG[doc.type];
  const displayTitle =
    doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 40) || "Untitled";
  const bodyPreview = doc.bodyMd.replace(/\n/g, " ").slice(0, 80);
  const timeAgo = getTimeAgo(doc.updatedAt);

  return (
    <Link
      href={`/editor?id=${doc.id}`}
      className="group flex items-start gap-3 py-4 border-b border-[#f0f0f0] last:border-0"
    >
      {/* Type indicator */}
      <div className={`w-0.5 h-8 rounded-full mt-1 shrink-0 ${
        doc.type === "note" ? "bg-[#e5e7eb]" :
        doc.type === "prompt" ? "bg-[#4F46E5]" : "bg-[#9ca3af]"
      }`} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-[#1a1a1a] truncate">{displayTitle}</p>
        {bodyPreview && (
          <p className="text-xs text-[#9ca3af] mt-0.5 line-clamp-1">{bodyPreview}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-[#9ca3af] font-mono">{config.label}</span>
          {doc.visibility === "public" && (
            <span className="text-[10px] text-[#4F46E5] font-medium">Public</span>
          )}
          {doc.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-[#d1d5db]">#{tag}</span>
          ))}
          <span className="text-[10px] text-[#d1d5db] ml-auto font-mono">{timeAgo}</span>
        </div>
      </div>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
        className="text-[#e5e7eb] hover:text-red-400 p-1 mt-1 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </Link>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}
