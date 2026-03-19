"use client";

import { useState, useEffect, useRef, TouchEvent } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { PromptDocument, TYPE_CONFIG, DocumentType } from "@/lib/types";
import { Trash2, HelpCircle, Upload, Pin, PinOff, Copy, Check, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<PromptDocument[]>([]);
  const [filter, setFilter] = useState<DocumentType | "all">("all");
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [signupDismissed, setSignupDismissed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocuments(store.getDocuments());
    const seen = localStorage.getItem("promptnote_onboarding_seen");
    if (!seen) setShowOnboarding(true);
  }, []);

  const filtered = filter === "all" ? documents : documents.filter((d) => d.type === filter);
  const pinnedIds = getPinnedIds();
  const pinned = filtered.filter(d => pinnedIds.includes(d.id));
  const unpinned = filtered.filter(d => !pinnedIds.includes(d.id));

  const noteCount = documents.filter((d) => d.type === "note").length;
  const promptCount = documents.filter((d) => d.type === "prompt").length;
  const showSuggestion = !suggestionDismissed && noteCount >= 3 && promptCount === 0;

  const handleDelete = (id: string) => {
    if (confirm("削除しますか？")) {
      store.delete(id);
      setDocuments(store.getDocuments());
    }
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
    setDocuments([...store.getDocuments()]);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    let imported = 0;
    for (const file of Array.from(files)) {
      if (file.name.endsWith(".md") || file.name.endsWith(".txt") || file.name.endsWith(".markdown")) {
        const text = await file.text();
        const titleFromFile = file.name.replace(/\.(md|txt|markdown)$/, "");
        store.create({
          userId: "local",
          title: titleFromFile,
          bodyMd: text,
          type: "note",
          visibility: "private",
          tags: [],
        });
        imported++;
      }
    }
    if (imported > 0) {
      setDocuments(store.getDocuments());
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="px-6 pt-14">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Notes</h1>
          <p className="text-xs text-[#9ca3af] mt-1 font-mono">{documents.length} items</p>
        </div>
        {/* Import button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[11px] flex items-center gap-1.5 text-[#9ca3af] hover:text-[#6b7280] font-mono"
        >
          <Upload className="w-3.5 h-3.5" />
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.markdown"
          multiple
          onChange={handleImport}
          className="hidden"
        />
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
              filter === f.key ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#d1d5db]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Boost suggestion */}
      {showSuggestion && (
        <div className="mb-6 p-4 border border-[#EEF2FF] bg-[#EEF2FF]/30 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-sm text-[#1a1a1a]">PromptにBoostしませんか？</p>
              <p className="text-xs text-[#9ca3af] mt-1">AI添削や共有が使えます</p>
            </div>
            <button onClick={() => setSuggestionDismissed(true)} className="text-[#d1d5db] text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Onboarding */}
      {showOnboarding && (
        <div className="mb-6 p-4 bg-[#fafafa] border border-[#f0f0f0] rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-[#1a1a1a]">PromptNote へようこそ</p>
              <p className="text-xs text-[#9ca3af] mt-0.5 leading-relaxed">メモを書いて、Promptに磨いて、AIに送る。</p>
              <div className="flex items-center gap-3 mt-3">
                <Link href="/howto" className="text-[11px] font-medium text-[#4F46E5]">使い方を見る →</Link>
                <button onClick={() => { setShowOnboarding(false); localStorage.setItem("promptnote_onboarding_seen", "1"); }} className="text-[11px] text-[#d1d5db]">閉じる</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign up CTA (only when not logged in and not dismissed) */}
      {!authLoading && !user && !signupDismissed && documents.length >= 1 && (
        <div className="mb-6 p-4 bg-[#1a1a1a] rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm text-white">アカウントを作成しませんか？</p>
              <p className="text-[11px] text-[#9ca3af] mt-0.5 leading-relaxed">データのバックアップやデバイス間の同期ができます</p>
              <Link href="/auth" className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-medium text-[#4F46E5] bg-white px-3 py-1.5 rounded-full">
                Sign up free <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <button onClick={() => setSignupDismissed(true)} className="text-[#6b7280] text-xs ml-2">✕</button>
          </div>
        </div>
      )}

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="text-center py-28">
          <p className="text-[#d1d5db] text-sm">No notes yet</p>
          <p className="text-[#e5e7eb] text-xs mt-1.5">Tap + to start, or Import .md files</p>
        </div>
      ) : (
        <div>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <>
              <p className="text-[9px] text-[#9ca3af] font-mono uppercase tracking-widest mb-2">Pinned</p>
              {pinned.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} isPinned onDelete={() => handleDelete(doc.id)} onTogglePin={() => handleTogglePin(doc.id)} />
              ))}
              {unpinned.length > 0 && <div className="border-t border-[#f0f0f0] my-3" />}
            </>
          )}
          {/* Rest */}
          {unpinned.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} isPinned={false} onDelete={() => handleDelete(doc.id)} onTogglePin={() => handleTogglePin(doc.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentRow({ doc, isPinned, onDelete, onTogglePin }: { doc: PromptDocument; isPinned: boolean; onDelete: () => void; onTogglePin: () => void }) {
  const config = TYPE_CONFIG[doc.type];
  const displayTitle = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 40) || "Untitled";
  const bodyPreview = doc.bodyMd.replace(/\n/g, " ").slice(0, 80);
  const timeAgo = getTimeAgo(doc.updatedAt);

  // Swipe state
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const [copied, setCopied] = useState(false);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setSwiping(false);
  };
  const handleTouchMove = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // Only horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      setSwiping(true);
      setSwipeX(Math.min(0, Math.max(-140, dx)));
    }
  };
  const handleTouchEnd = () => {
    if (swipeX < -80) {
      setSwipeX(-140);
    } else {
      setSwipeX(0);
      setSwiping(false);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(doc.bodyMd);
    setCopied(true);
    setTimeout(() => { setCopied(false); setSwipeX(0); setSwiping(false); }, 1000);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe actions (behind) */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch">
        <button onClick={(e) => { e.preventDefault(); onTogglePin(); setSwipeX(0); }} className="w-[46px] bg-[#4F46E5] flex items-center justify-center text-white">
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
        <button onClick={handleCopy} className="w-[46px] bg-[#6b7280] flex items-center justify-center text-white">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="w-[46px] bg-red-500 flex items-center justify-center text-white">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main row (slides) */}
      <Link
        href={`/editor?id=${doc.id}`}
        className="group flex items-start gap-3 py-4 border-b border-[#f0f0f0] last:border-0 bg-white relative"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => { if (swiping) { e.preventDefault(); } }}
      >
        {/* Type indicator */}
        <div className={`w-0.5 h-8 rounded-full mt-1 shrink-0 ${
          doc.type === "note" ? "bg-[#e5e7eb]" :
          doc.type === "prompt" ? "bg-[#4F46E5]" : "bg-[#9ca3af]"
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isPinned && <Pin className="w-2.5 h-2.5 text-[#4F46E5] shrink-0" />}
            <p className="font-medium text-sm text-[#1a1a1a] truncate">{displayTitle}</p>
          </div>
          {bodyPreview && <p className="text-xs text-[#9ca3af] mt-0.5 line-clamp-1">{bodyPreview}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-[#9ca3af] font-mono">{config.label}</span>
            {doc.visibility === "public" && <span className="text-[10px] text-[#4F46E5] font-medium">Public</span>}
            {doc.tags.slice(0, 2).map((tag) => <span key={tag} className="text-[10px] text-[#d1d5db]">#{tag}</span>)}
            <span className="text-[10px] text-[#d1d5db] ml-auto font-mono">{timeAgo}</span>
          </div>
        </div>

        {/* Desktop delete (hover only) */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
          className="text-[#e5e7eb] hover:text-red-400 p-1 mt-1 opacity-0 group-hover:opacity-100 hidden sm:block"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );
}

// --- Pin helpers ---
function getPinnedIds(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("promptnote_pinned");
  return raw ? JSON.parse(raw) : [];
}

function togglePin(id: string) {
  const ids = getPinnedIds();
  if (ids.includes(id)) {
    localStorage.setItem("promptnote_pinned", JSON.stringify(ids.filter(i => i !== id)));
  } else {
    localStorage.setItem("promptnote_pinned", JSON.stringify([id, ...ids]));
  }
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
