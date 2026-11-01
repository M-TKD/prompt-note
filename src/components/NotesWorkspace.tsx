"use client";

import { useState, useEffect, useRef, useCallback, TouchEvent } from "react";
import Link from "next/link";
import { useStore } from "@/lib/use-store";
import { useAuth } from "@/lib/auth-context";
import { PromptDocument, TYPE_CONFIG, DocumentType } from "@/lib/types";
import { Trash2, HelpCircle, Upload, Pin, PinOff, Copy, Check, ArrowRight, Compass, FolderOpen, FolderPlus, Plus, FileText, LockKeyhole } from "lucide-react";
import { CollectionSheet } from "@/components/CollectionSheet";
import { CATEGORIES } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { copyPromptText } from "@/lib/official-templates";

export default function NotesWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const hybridStore = useStore();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<PromptDocument[]>([]);
  const [filter, setFilter] = useState<DocumentType | "all">("all");
  const [loading, setLoading] = useState(true);
  const [collectionDocId, setCollectionDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef({ serial: 0 });
  const sourceKey = user?.id ?? "local";
  const [loadedSource, setLoadedSource] = useState<string | null>(null);

  // 認証の確定後だけ、既存方式で端末内のサンプルを準備する。
  useEffect(() => {
    if (!authLoading && !hybridStore.isCloud) {
      hybridStore.ensureSeedData();
    }
  }, [authLoading, hybridStore]);

  // 認証の切り替え前に始まった読み込みが、後の一覧を上書きしないようにする。
  const fetchDocuments = useCallback(async () => {
    if (authLoading) return;
    const request = ++requestRef.current.serial;
    try {
      const docs = await hybridStore.getDocuments();
      if (request === requestRef.current.serial) {
        setDocuments(docs);
        setLoadedSource(sourceKey);
      }
    } finally {
      if (request === requestRef.current.serial) setLoading(false);
    }
  }, [authLoading, hybridStore, sourceKey]);

  useEffect(() => {
    void fetchDocuments();
    const requests = requestRef.current;
    return () => { requests.serial++; };
  }, [fetchDocuments]);

  const filtered = filter === "all" ? documents : documents.filter((d) => d.type === filter);
  const pinnedIds = getPinnedIds();
  const pinned = filtered.filter(d => pinnedIds.includes(d.id));
  const unpinned = filtered.filter(d => !pinnedIds.includes(d.id));

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
    // 同じファイルも再び選べるよう入力を戻す。
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="px-5 pt-7 pb-8 sm:px-6 sm:pt-10">
      {/* 正式ロゴと主要操作を、ノートの見出しより先に揃える。 */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Prompt Notes ホーム" className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F46E5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-horizontal.png" alt="Prompt Notes" className="h-6 max-w-[170px] object-contain dark:invert" />
        </Link>
        <button onClick={() => fileInputRef.current?.click()} className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[#4b5563] hover:bg-[#f5f5f5] dark:text-[#d1d5db] focus-visible:outline-2 focus-visible:outline-[#4F46E5]">
          <Upload className="h-4 w-4" />取り込む
        </button>
        <input ref={fileInputRef} type="file" accept=".md,.txt,.markdown" multiple onChange={handleImport} aria-label="ノートのファイルを取り込む" className="hidden" />
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#1a1a1a] dark:text-white">自分のノート</h1>
          <p className="mt-2 text-sm text-[#6b7280] dark:text-[#9ca3af]">{authLoading || loading || loadedSource !== sourceKey ? "読み込み中…" : `${documents.length}件のメモとプロンプト`}</p>
        </div>
        <Link href="/editor?mode=quick" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F46E5]">
          <Plus className="h-4 w-4" />新規作成
        </Link>
      </header>

      {/* ゲストとログイン利用の保存場所を、重複する案内を増やさず説明する。 */}
      {!authLoading && (
        <aside className="mb-7 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4 text-sm leading-6 text-[#4b5563] dark:border-[#333] dark:bg-[#222] dark:text-[#d1d5db]">
          {user ? <p>ログイン中です。ノートはアカウントに保存され、同じアカウントで同期できます。</p> : (
            <>
              <p className="font-semibold text-[#1a1a1a] dark:text-white">登録不要。このブラウザに保存されます</p>
              <p className="mt-1">同じ端末・ブラウザで再訪すると続きから使えます。ブラウザのデータを削除するとノートも消えます。</p>
              <Link href="/auth?mode=signup" className="mt-2 inline-block font-medium text-[#4F46E5] underline underline-offset-4">他の端末でも使うには無料アカウントを作成</Link>
            </>
          )}
        </aside>
      )}

      <div aria-label="ノートの種類で絞り込む" className="mb-2 flex gap-4 overflow-x-auto border-b border-[#e5e7eb] dark:border-[#333]">
        {[
          { key: "all" as const, label: "すべて" },
          { key: "note" as const, label: "メモ" },
          { key: "prompt" as const, label: "プロンプト" },
          { key: "template" as const, label: "テンプレート" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key} className={`shrink-0 border-b-2 py-3 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4F46E5] ${filter === f.key ? "border-[#1a1a1a] text-[#1a1a1a] dark:border-white dark:text-white" : "border-transparent text-[#6b7280] dark:text-[#9ca3af]"}`}>{f.label}</button>
        ))}
      </div>

      {/* 読み込み完了までは空状態を表示しない。 */}
      {authLoading || loading || loadedSource !== sourceKey ? (
        <div className="space-y-4 py-6" aria-busy="true" aria-label="ノートを読み込み中">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-[#f5f5f5] dark:bg-[#222]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <section className="my-5 rounded-xl bg-[#fafafa] px-5 py-8 dark:bg-[#222] sm:px-7">
          <FileText className="mb-4 h-7 w-7 text-[#4F46E5]" />
          <h2 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">{documents.length ? "この種類のノートはまだありません" : "よく使う指示を、ひとつ保存しましょう"}</h2>
          <p className="mt-2 text-sm leading-7 text-[#4b5563] dark:text-[#d1d5db]">依頼メールの下書き、議事録の整理、アイデア出し。AIに毎回伝えている指示を保存して、次の仕事で使い回せます。</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/editor?mode=quick" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F46E5]"><Plus className="h-4 w-4" />ノートを作る</Link>
            <Link href="/feed" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d1d5db] px-4 py-2.5 text-sm font-medium text-[#1a1a1a] dark:border-[#555] dark:text-white focus-visible:outline-2 focus-visible:outline-[#4F46E5]">テンプレートから始める</Link>
          </div>
        </section>
      ) : (
        <div>
          {pinned.length > 0 && (
            <>
              <p className="pt-5 pb-1 text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">ピン留め</p>
              {pinned.map((doc) => <DocumentRow key={doc.id} doc={doc} isPinned onDelete={() => handleDelete(doc.id)} onTogglePin={() => handleTogglePin(doc.id)} onCollection={user ? () => setCollectionDocId(doc.id) : undefined} />)}
              {unpinned.length > 0 && <p className="pt-6 pb-1 text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">その他のノート</p>}
            </>
          )}
          {unpinned.map((doc) => <DocumentRow key={doc.id} doc={doc} isPinned={false} onDelete={() => handleDelete(doc.id)} onTogglePin={() => handleTogglePin(doc.id)} onCollection={user ? () => setCollectionDocId(doc.id) : undefined} />)}
        </div>
      )}

      {/* 作業一覧を先に見せ、テンプレートや整理の入口は下に置く。 */}
      <section className="mt-8 border-t border-[#e5e7eb] pt-6 dark:border-[#333]">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] dark:text-white"><Compass className="h-4 w-4 text-[#4F46E5]" />仕事に使えるテンプレート</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.filter(c => c !== "すべて").map((cat) => <Link key={cat} href={`/feed?cat=${encodeURIComponent(cat)}`} className="shrink-0 rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-medium text-[#4b5563] hover:border-[#4F46E5] hover:text-[#4F46E5] dark:border-[#444] dark:text-[#d1d5db] focus-visible:outline-2 focus-visible:outline-[#4F46E5]">{cat}</Link>)}
        </div>
        <Link href={user ? "/collections" : "/auth"} className="mt-4 flex items-center gap-3 rounded-xl border border-[#e5e7eb] px-4 py-4 dark:border-[#333] focus-visible:outline-2 focus-visible:outline-[#4F46E5]">
          <FolderOpen className="h-5 w-5 shrink-0 text-[#4F46E5]" />
          <div className="flex-1"><p className="text-sm font-medium text-[#1a1a1a] dark:text-white">コレクションで整理する</p><p className="mt-1 text-xs text-[#6b7280] dark:text-[#9ca3af]">{user ? "ノートをまとめて、仕事ごとに探しやすく" : "ログイン後に利用できます"}</p></div>
          {user ? <ArrowRight className="h-4 w-4 text-[#6b7280]" /> : <LockKeyhole className="h-4 w-4 text-[#6b7280]" />}
        </Link>
      </section>

      <aside className="mt-6 flex items-start gap-3 text-sm leading-6 text-[#6b7280] dark:text-[#9ca3af]">
          <HelpCircle className="mt-1 h-4 w-4 shrink-0" />
          <p className="flex-1">保存した指示はコピーして、普段のAIに貼り付けて使います。<Link href="/howto" className="ml-1 text-[#4F46E5] underline underline-offset-4">使い方を見る</Link></p>
      </aside>
      {collectionDocId && <CollectionSheet documentId={collectionDocId} onClose={() => setCollectionDocId(null)} />}
    </div>
  );
}

function DocumentRow({ doc, isPinned, onDelete, onTogglePin, onCollection }: { doc: PromptDocument; isPinned: boolean; onDelete: () => void; onTogglePin: () => void; onCollection?: () => void }) {
  const { toast } = useToast();
  const config = TYPE_CONFIG[doc.type];
  const displayTitle = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 40) || "無題";
  const bodyPreview = doc.bodyMd.replace(/\n/g, " ").slice(0, 80);
  const timeAgo = getTimeAgo(doc.updatedAt);

  // 横スワイプの状態
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
    // 縦スクロール時は横スワイプを開始しない。
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!await copyPromptText(doc.bodyMd, navigator.clipboard)) {
      toast("コピーできませんでした。ノートを開いて本文を選択してください", "error");
      return;
    }
    setCopied(true);
    toast("コピーしました", "copy");
    setTimeout(() => { setCopied(false); setSwipeX(0); setSwiping(false); }, 1000);
  };

  return (
    <div className="group relative overflow-hidden">
      {/* 横スワイプで表示する操作 */}
      <div inert={!swiping} className="absolute right-0 top-0 bottom-0 flex items-stretch">
        {onCollection && (
          <button aria-label="コレクションに追加" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCollection(); setSwipeX(0); setSwiping(false); }} className="w-[46px] bg-[#8B5CF6] flex items-center justify-center text-white">
            <FolderPlus className="w-4 h-4" />
          </button>
        )}
        <button aria-label={isPinned ? "ピン留めを解除" : "ピン留め"} onClick={(e) => { e.preventDefault(); onTogglePin(); setSwipeX(0); }} className="w-[46px] bg-[#4F46E5] flex items-center justify-center text-white">
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
        <button aria-label="ノートをコピー" onClick={handleCopy} className="w-[46px] bg-[#6b7280] flex items-center justify-center text-white">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <button aria-label="ノートを削除" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="w-[46px] bg-red-500 flex items-center justify-center text-white">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 横に動かすノート行 */}
      <Link
        href={`/editor?id=${doc.id}`}
        className="flex items-start gap-3 py-5 sm:pr-20 border-b border-[#e5e7eb] dark:border-[#333] bg-white dark:bg-[#1a1a1a] relative focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4F46E5]"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => { if (swiping) { e.preventDefault(); } }}
      >
        {/* 種類を示す線 */}
        <div className={`w-0.5 h-8 rounded-full mt-1 shrink-0 ${
          doc.type === "note" ? "bg-[#e5e7eb]" :
          doc.type === "prompt" ? "bg-[#4F46E5]" : "bg-[#9ca3af]"
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isPinned && <Pin className="w-2.5 h-2.5 text-[#4F46E5] shrink-0" />}
            <p className="font-semibold text-base text-[#1a1a1a] dark:text-white truncate">{displayTitle}</p>
          </div>
          {bodyPreview && <p className="text-sm leading-6 text-[#4b5563] dark:text-[#d1d5db] mt-1 line-clamp-2">{bodyPreview}</p>}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
            <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">{config.label}</span>
            {doc.visibility === "public" && <span className="text-xs text-[#4F46E5] font-medium">公開</span>}
            {doc.tags.slice(0, 2).map((tag) => <span key={tag} className="max-w-28 truncate text-xs text-[#6b7280] dark:text-[#9ca3af]">#{tag}</span>)}
            <span className="text-xs text-[#6b7280] dark:text-[#9ca3af] ml-auto shrink-0">{timeAgo}</span>
          </div>
        </div>

      </Link>
      {/* 行を開くリンクと操作ボタンを分け、キーボードからも選べるようにする。 */}
      <div className="absolute right-0 top-5 hidden items-center gap-1 sm:flex">
        <button aria-label="ノートをコピー" title="ノートをコピー" onClick={handleCopy} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f5f5f5] dark:text-[#9ca3af] focus-visible:outline-2 focus-visible:outline-[#4F46E5]">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
        <button aria-label="ノートを削除" title="ノートを削除" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-600 dark:text-[#9ca3af] focus-visible:outline-2 focus-visible:outline-[#4F46E5]"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ピン留め情報は既存の端末内保存を使う。
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
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return `${Math.floor(days / 30)}か月前`;
}
