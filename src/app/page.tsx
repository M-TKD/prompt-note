"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { PromptDocument, TYPE_CONFIG, DocumentType } from "@/lib/types";
import { Trash2, FileText } from "lucide-react";

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
    <div className="px-5 pt-12">
      <h1 className="text-3xl font-bold tracking-tight mb-1">ノート</h1>
      <p className="text-sm text-neutral-400 mb-6">{documents.length}件</p>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all" as const, label: "すべて" },
          { key: "note" as const, label: "メモ" },
          { key: "prompt" as const, label: "プロンプト" },
          { key: "template" as const, label: "テンプレート" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === f.key
                ? "bg-neutral-900 text-white"
                : "bg-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Promotion suggestion */}
      {showSuggestion && (
        <div className="mb-5 p-4 border border-amber-200 bg-amber-50/50 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm">メモをPromptに整理しませんか？</p>
              <p className="text-xs text-neutral-500 mt-1">
                Promptに昇格するとAI添削や共有ができます
              </p>
            </div>
            <button onClick={() => setSuggestionDismissed(true)} className="text-neutral-400 text-xs ml-2">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <FileText className="w-8 h-8 text-neutral-200 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-neutral-400 text-sm">ノートがありません</p>
          <p className="text-neutral-300 text-xs mt-1">＋ボタンで始めましょう</p>
        </div>
      ) : (
        <div className="space-y-0">
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
    doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 40) || "無題";
  const bodyPreview = doc.bodyMd.replace(/\n/g, " ").slice(0, 80);
  const timeAgo = getTimeAgo(doc.updatedAt);

  return (
    <Link
      href={`/editor?id=${doc.id}`}
      className="flex items-start gap-3 py-3.5 px-1 border-b border-neutral-100 last:border-0 active:bg-neutral-50 transition"
    >
      <div className={`w-0.5 h-10 rounded-full mt-0.5 shrink-0 ${
        doc.type === "note" ? "bg-neutral-200" :
        doc.type === "prompt" ? "bg-amber-400" : "bg-neutral-400"
      }`} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{displayTitle}</p>
        {bodyPreview && (
          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{bodyPreview}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-neutral-400 font-medium">
            {config.label}
          </span>
          {doc.visibility === "public" && (
            <span className="text-[10px] text-amber-600 font-medium">公開</span>
          )}
          {doc.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-neutral-400">#{tag}</span>
          ))}
          <span className="text-[10px] text-neutral-300 ml-auto">{timeAgo}</span>
        </div>
      </div>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
        className="text-neutral-200 hover:text-red-400 transition p-1 mt-1"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </Link>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return `${Math.floor(days / 30)}ヶ月前`;
}
