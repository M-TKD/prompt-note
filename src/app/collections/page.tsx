"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/use-store";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import type { Collection, PromptDocument } from "@/lib/types";
import { TYPE_CONFIG } from "@/lib/types";
import {
  ArrowLeft,
  Plus,
  FolderOpen,
  ChevronRight,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Suspense } from "react";

function CollectionsContent() {
  const { user, loading: authLoading } = useAuth();
  const hybridStore = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const viewId = searchParams.get("id");

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // For viewing a single collection's documents
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [collectionDocs, setCollectionDocs] = useState<PromptDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // Create new collection
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  // Edit collection
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  const EMOJI_OPTIONS = ["", "\uD83D\uDCC1", "\u2B50", "\uD83D\uDE80", "\uD83D\uDCA1", "\uD83D\uDCBC", "\uD83C\uDFA8", "\uD83D\uDD27", "\uD83D\uDCDA", "\uD83C\uDFAF", "\u2764\uFE0F", "\uD83D\uDD25", "\uD83C\uDF1F"];

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const cols = await hybridStore.getCollections();
      setCollections(cols);
    } finally {
      setLoading(false);
    }
  }, [hybridStore]);

  const fetchCollectionDocs = useCallback(async (col: Collection) => {
    setDocsLoading(true);
    try {
      const docs = await hybridStore.getCollectionDocuments(col.id);
      setCollectionDocs(docs);
      setActiveCollection(col);
    } finally {
      setDocsLoading(false);
    }
  }, [hybridStore]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCollections();
    }
    if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchCollections]);

  // If viewId is present, open that collection
  useEffect(() => {
    if (viewId && collections.length > 0 && !activeCollection) {
      const col = collections.find((c) => c.id === viewId);
      if (col) fetchCollectionDocs(col);
    }
  }, [viewId, collections, activeCollection, fetchCollectionDocs]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const col = await hybridStore.createCollection(newName.trim(), newEmoji || undefined);
    if (col) {
      toast("コレクションを作成しました");
      setShowCreate(false);
      setNewName("");
      setNewEmoji("");
      await fetchCollections();
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    const ok = await hybridStore.updateCollection(id, {
      name: editName.trim(),
      emoji: editEmoji || undefined,
    });
    if (ok) {
      toast("更新しました");
      setEditingId(null);
      await fetchCollections();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このコレクションを削除しますか？（ドキュメントは削除されません）")) return;
    const ok = await hybridStore.deleteCollection(id);
    if (ok) {
      toast("コレクションを削除しました");
      await fetchCollections();
    }
  };

  const handleRemoveFromCollection = async (docId: string) => {
    if (!activeCollection) return;
    const ok = await hybridStore.removeFromCollection(activeCollection.id, docId);
    if (ok) {
      toast("コレクションから削除しました");
      setCollectionDocs((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <button onClick={() => router.back()} className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Collections</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <FolderOpen className="w-10 h-10 text-[#d1d5db]" />
            <p className="text-sm text-[#9ca3af]">サインインするとコレクションが使えます</p>
            <Link href="/auth" className="mt-2 px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-full">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <button onClick={() => router.back()} className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Collections</h1>
          </div>
          <div className="space-y-3 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#f5f5f5] dark:bg-[#222] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Viewing a single collection's documents
  if (activeCollection) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => {
                setActiveCollection(null);
                setCollectionDocs([]);
                if (viewId) router.push("/collections");
              }}
              className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a] dark:text-white truncate">
                {activeCollection.emoji && <span className="mr-1.5">{activeCollection.emoji}</span>}
                {activeCollection.name}
              </h1>
              <p className="text-xs text-[#9ca3af] font-mono mt-0.5">
                {collectionDocs.length} items
              </p>
            </div>
          </div>

          {docsLoading ? (
            <div className="space-y-3 py-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-[#f5f5f5] dark:bg-[#222] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : collectionDocs.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-8 h-8 mx-auto mb-3 text-[#d1d5db]" />
              <p className="text-sm text-[#9ca3af]">このコレクションは空です</p>
              <p className="text-xs text-[#d1d5db] mt-1">
                エディタからドキュメントを追加できます
              </p>
            </div>
          ) : (
            <div>
              {collectionDocs.map((doc) => {
                const config = TYPE_CONFIG[doc.type];
                const displayTitle = doc.title || doc.bodyMd.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 40) || "Untitled";
                return (
                  <div key={doc.id} className="group flex items-start gap-3 py-4 border-b border-[#f0f0f0] dark:border-[#333] last:border-0">
                    <div className={`w-0.5 h-8 rounded-full mt-1 shrink-0 ${doc.type === "note" ? "bg-[#e5e7eb]" : doc.type === "prompt" ? "bg-[#4F46E5]" : "bg-[#9ca3af]"}`} />
                    <Link href={`/editor?id=${doc.id}`} className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1a1a1a] dark:text-white truncate">{displayTitle}</p>
                      <span className="text-[10px] text-[#9ca3af] font-mono mt-1">{config.label}</span>
                    </Link>
                    <button
                      onClick={() => handleRemoveFromCollection(doc.id)}
                      className="text-[#d1d5db] hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Collections list
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white flex-1">
            Collections
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="text-[11px] flex items-center gap-1.5 text-[#4F46E5] font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            新規作成
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 p-4 border border-[#f0f0f0] dark:border-[#333] rounded-xl bg-white dark:bg-[#141414]">
            <p className="text-xs font-medium text-[#1a1a1a] dark:text-white mb-3">新しいコレクション</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border ${newEmoji === e ? "border-[#4F46E5] bg-[#EEF2FF] dark:bg-[#4F46E5]/20" : "border-[#f0f0f0] dark:border-[#333]"}`}
                >
                  {e || "-"}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="コレクション名"
              className="w-full text-sm bg-transparent border border-[#f0f0f0] dark:border-[#333] rounded-lg px-3 py-2 text-[#1a1a1a] dark:text-white placeholder-[#d1d5db] outline-none focus:border-[#4F46E5]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") { setShowCreate(false); setNewName(""); setNewEmoji(""); }
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setShowCreate(false); setNewName(""); setNewEmoji(""); }} className="text-xs text-[#9ca3af] px-3 py-1.5">
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="text-xs text-white bg-[#4F46E5] px-4 py-1.5 rounded-full disabled:opacity-40"
              >
                作成
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {collections.length === 0 && !showCreate ? (
          <div className="text-center py-20">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 text-[#d1d5db]" />
            <p className="text-sm text-[#9ca3af]">コレクションがありません</p>
            <p className="text-xs text-[#d1d5db] mt-1">プロンプトをフォルダで整理できます</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 text-sm text-[#4F46E5] font-medium"
            >
              最初のコレクションを作成
            </button>
          </div>
        ) : (
          <div>
            {collections.map((col) => (
              <div key={col.id} className="group border-b border-[#f0f0f0] dark:border-[#333] last:border-0">
                {editingId === col.id ? (
                  <div className="py-3">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {EMOJI_OPTIONS.map((e) => (
                        <button
                          key={e}
                          onClick={() => setEditEmoji(e)}
                          className={`w-7 h-7 rounded text-xs flex items-center justify-center border ${editEmoji === e ? "border-[#4F46E5] bg-[#EEF2FF] dark:bg-[#4F46E5]/20" : "border-[#f0f0f0] dark:border-[#333]"}`}
                        >
                          {e || "-"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 text-sm bg-transparent border border-[#f0f0f0] dark:border-[#333] rounded-lg px-3 py-1.5 text-[#1a1a1a] dark:text-white outline-none focus:border-[#4F46E5]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(col.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button onClick={() => handleUpdate(col.id)} className="text-[#4F46E5]">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-[#9ca3af]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center py-4">
                    <button
                      onClick={() => fetchCollectionDocs(col)}
                      className="flex-1 flex items-center gap-3 min-w-0 text-left"
                    >
                      <span className="text-lg w-7 text-center shrink-0">
                        {col.emoji || "\uD83D\uDCC1"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a] dark:text-white truncate">
                          {col.name}
                        </p>
                        <p className="text-[10px] text-[#9ca3af] font-mono mt-0.5">
                          {col.documentCount || 0} items
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#d1d5db] shrink-0" />
                    </button>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(col.id);
                          setEditName(col.name);
                          setEditEmoji(col.emoji || "");
                        }}
                        className="text-[#9ca3af] hover:text-[#4F46E5] p-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="text-[#d1d5db] hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="h-8 w-32 bg-[#f5f5f5] dark:bg-[#222] rounded animate-pulse" />
        </div>
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
