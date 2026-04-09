"use client";

import { useState, useEffect, useRef, useCallback, TouchEvent } from "react";
import Link from "next/link";
import { useStore } from "@/lib/use-store";
import { useAuth } from "@/lib/auth-context";
import { PromptDocument, TYPE_CONFIG, DocumentType } from "@/lib/types";
import { Trash2, HelpCircle, Upload, Pin, PinOff, Copy, Check, ArrowRight, Compass, FolderOpen, FolderPlus } from "lucide-react";
import { CollectionSheet } from "@/components/CollectionSheet";
import { CATEGORIES } from "@/lib/types";
import { useToast } from "@/components/Toast";
import LandingPage from "@/components/LandingPage";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const hybridStore = useStore();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<PromptDocument[]>([]);
  const [filter, setFilter] = useState<DocumentType | "all">("all");
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [signupDismissed, setSignupDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collectionDocId, setCollectionDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed data for local-only mode
  useEffect(() => {
    if (!hybridStore.isCloud) {
      hybridStore.ensureSeedData();
    }
  }, [hybridStore.isCloud]);

  // Load documents
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await hybridStore.getDocuments();
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  }, [hybridStore]);

  useEffect(() => {
    fetchDocuments();
    const seen = localStorage.getItem("promptnote_onboarding_seen");
    if (!seen) setShowOnboarding(true);
  }, [fetchDocuments]);

  const filtered = filter === "all" ? documents : documents.filter((d) => d.type === filter);
  const pinnedIds = getPinnedIds();
  const pinned = filtered.filter(d => pinnedIds.includes(d.id));
  const unpinned = filtered.filter(d => !pinnedIds.includes(d.id));

  const noteCount = documents.filter((d) => d.type === "note").length;
  const promptCount = documents.filter((d) => d.type === "prompt").length;
  const showSuggestion = !suggestionDismissed && noteCount >= 3 && promptCount === 0;

  const handleDelete = async (id: string) => {
    if (confirm("削除しますか？")) {
      await hybridStore.delete(id);
      await fetchDocuments();
      toast("削除しました", "delete");
    }
  };

  const handleTogglePin = async (id: string) => {
    const wasPinned = getPinnedIds().includes(id);
    togglePin(id);
    await fetchDocuments();
    toast(wasPinned ? "ピン留め解除しました" : "ピン留めしました");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    let imported = 0;
    for (const file of Array.from(files)) {
      if (file.name.endsWith(".md") || file.name.endsWith(".txt") || file.name.endsWith(".markdown")) {
        const text = await file.text();
        const titleFromFile = file.name.replace(/\.(md|txt|markdown)$/, "");
        await hybridStore.create({
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
      await fetchDocuments();
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Show landing page for non-logged-in users
  if (!authLoading && !user) {
    return <LandingPage />;
  }

  return (
    <div className="px-6 pt-8">
      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-horizontal.png" alt="PromptNotes" className="h-5 mb-8 opacity-40 dark:invert dark:opacity-30" />

      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Notes</h1>
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
      <div className="flex gap-4 mb-8 border-b border-[#f0f0f0] dark:border-[#333]">
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
              filter === f.key ? "text-[#1a1a1a] dark:text-white border-b-2 border-[#1a1a1a] dark:border-white" : "text-[#d1d5db] dark:text-[#6b7280]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quick Access: Explore categories & Collections */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest">Explore</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.filter(c => c !== "すべて").map((cat) => (
            <Link
              key={cat}
              href={`/feed?cat=${encodeURIComponent(cat)}`}
              className="shrink-0 px-3 py-2 rounded-lg border border-[#f0f0f0] dark:border-[#333] bg-[#fafafa] dark:bg-[#222] text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors"
            >
              {cat}
            </Link>
          ))}
          <Link
            href="/feed"
            className="shrink-0 px-3 py-2 rounded-lg border border-[#4F46E5]/20 bg-[#EEF2FF] dark:bg-[#4F46E5]/10 text-xs font-medium text-[#4F46E5] hover:bg-[#4F46E5]/20 transition-colors"
          >
            すべて見る →
          </Link>
        </div>
        <Link
          href="/collections"
          className="mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#f0f0f0] dark:border-[#333] bg-[#fafafa] dark:bg-[#222] hover:border-[#4F46E5] transition-colors"
        >
          <FolderOpen className="w-4 h-4 text-[#4F46E5]" />
          <span className="text-xs font-medium text-[#1a1a1a] dark:text-white">コレクション</span>
          <ArrowRight className="w-3 h-3 text-[#d1d5db] ml-auto" />
        </Link>
      </div>

      {/* Boost suggestion */}
      {showSuggestion && (
        <div className="mb-6 p-4 border border-[#EEF2FF] dark:border-[#333] bg-[#EEF2FF]/30 dark:bg-[#222] rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-sm text-[#1a1a1a] dark:text-white">PromptにBoostしませんか？</p>
              <p className="text-xs text-[#9ca3af] mt-1">AI添削や共有が使えます</p>
            </div>
            <button onClick={() => setSuggestionDismissed(true)} className="text-[#d1d5db] text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Onboarding */}
      {showOnboarding && (
        <div className="mb-6 p-4 bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] dark:bg-white flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-white dark:text-[#1a1a1a]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-[#1a1a1a] dark:text-white">PromptNotes へようこそ</p>
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
        <div className="mb-6 p-4 bg-[#1a1a1a] dark:bg-[#222] dark:border dark:border-[#333] rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm text-white">アカウントを作成しませんか？</p>
              <p className="text-[11px] text-[#9ca3af] mt-0.5 leading-relaxed">データのバックアップやデバイス間の同期ができます</p>
              <Link href="/auth" className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-medium text-[#4F46E5] bg-white dark:bg-[#333] px-3 py-1.5 rounded-full">
                Sign up free <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <button onClick={() => setSignupDismissed(true)} className="text-[#6b7280] text-xs ml-2">✕</button>
          </div>
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#f5f5f5] dark:bg-[#222] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-28">
          <p className="text-[#d1d5db] text-sm">No notes yet</p>
          <p className="text-[#e5e7eb] dark:text-[#444] text-xs mt-1.5">Tap + to start, or Import .md files</p>
        </div>
      ) : (
        <div>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <>
              <p className="text-[9px] text-[#9ca3af] font-mono uppercase tracking-widest mb-2">Pinned</p>
              {pinned.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} isPinned onDelete={() => handleDelete(doc.id)} onTogglePin={() => handleTogglePin(doc.id)} onCollection={user ? () => setCollectionDocId(doc.id) : undefined} />
              ))}
              {unpinned.length > 0 && <div className="border-t border-[#f0f0f0] dark:border-[#333] my-3" />}
            </>
          )}
          {/* Rest */}
          {unpinned.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} isPinned={false} onDelete={() => handleDelete(doc.id)} onTogglePin={() => handleTogglePin(doc.id)} onCollection={user ? () => setCollectionDocId(doc.id) : undefined} />
          ))}
        </div>
      )}

      {/* Collection Sheet */}
      {collectionDocId && (
        <CollectionSheet
          documentId={collectionDocId}
          onClose={() => setCollectionDocId(null)}
        />
      )}
    </div>
  );
}

function DocumentRow({ doc, isPinned, onDelete, onTogglePin, onCollection }: { doc: PromptDocument; isPinned: boolean; onDelete: () => void; onTogglePin: () => void; onCollection?: () => void }) {
  const { toast } = useToast();
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
      const maxSwipe = onCollection ? -184 : -140;
      setSwipeX(Math.min(0, Math.max(maxSwipe, dx)));
    }
  };
  const handleTouchEnd = () => {
    const snapTo = onCollection ? -184 : -140;
    if (swipeX < -80) {
      setSwipeX(snapTo);
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
    toast("コピーしました", "copy");
    setTimeout(() => { setCopied(false); setSwipeX(0); setSwiping(false); }, 1000);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe actions (behind) */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch">
        {onCollection && (
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCollection(); setSwipeX(0); setSwiping(false); }} className="w-[46px] bg-[#8B5CF6] flex items-center justify-center text-white">
            <FolderPlus className="w-4 h-4" />
          </button>
        )}
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
        className="group flex items-start gap-3 py-4 border-b border-[#f0f0f0] dark:border-[#333] last:border-0 bg-white dark:bg-[#1a1a1a] relative"
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
            <p className="font-medium text-sm text-[#1a1a1a] dark:text-white truncate">{displayTitle}</p>
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
