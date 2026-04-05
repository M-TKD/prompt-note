"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/use-store";
import { useToast } from "@/components/Toast";
import { Check } from "lucide-react";

export function CollectionSheet({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const hybridStore = useStore();
  const { toast } = useToast();
  const [collections, setCollections] = useState<
    { id: string; name: string; emoji: string | null }[]
  >([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [cols, docCols] = await Promise.all([
        hybridStore.getCollections(),
        hybridStore.getDocumentCollections(documentId),
      ]);
      setCollections(
        cols.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))
      );
      setMemberIds(docCols);
      setLoading(false);
    };
    load();
  }, [hybridStore, documentId]);

  const toggle = async (colId: string) => {
    if (memberIds.includes(colId)) {
      const ok = await hybridStore.removeFromCollection(colId, documentId);
      if (ok) {
        setMemberIds((prev) => prev.filter((id) => id !== colId));
        toast("コレクションから削除しました");
      }
    } else {
      const ok = await hybridStore.addToCollection(colId, documentId);
      if (ok) {
        setMemberIds((prev) => [...prev, colId]);
        toast("コレクションに追加しました");
      }
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const col = await hybridStore.createCollection(newName.trim());
    if (col) {
      setCollections((prev) => [
        ...prev,
        { id: col.id, name: col.name, emoji: col.emoji },
      ]);
      await hybridStore.addToCollection(col.id, documentId);
      setMemberIds((prev) => [...prev, col.id]);
      setNewName("");
      toast("コレクションを作成して追加しました");
    }
    setCreating(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-t-2xl p-5 pb-10 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-white">
            コレクションに追加
          </h3>
          <button onClick={onClose} className="text-[#9ca3af] text-xs">
            閉じる
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#9ca3af]">
            読み込み中...
          </div>
        ) : (
          <>
            {collections.length === 0 && (
              <p className="text-xs text-[#9ca3af] mb-4">
                コレクションがありません。下のフォームから作成できます。
              </p>
            )}
            <div className="space-y-1 mb-4">
              {collections.map((col) => {
                const isMember = memberIds.includes(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => toggle(col.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#222] text-left"
                  >
                    <span className="text-base w-5 text-center">
                      {col.emoji || "📁"}
                    </span>
                    <span className="flex-1 text-sm text-[#1a1a1a] dark:text-white">
                      {col.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isMember
                          ? "bg-[#4F46E5] border-[#4F46E5]"
                          : "border-[#d1d5db] dark:border-[#555]"
                      }`}
                    >
                      {isMember && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 border-t border-[#f0f0f0] dark:border-[#333] pt-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="新しいコレクション名"
                className="flex-1 text-sm bg-transparent border border-[#f0f0f0] dark:border-[#333] rounded-lg px-3 py-2 text-[#1a1a1a] dark:text-white placeholder-[#d1d5db] outline-none focus:border-[#4F46E5]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="text-xs text-white bg-[#4F46E5] px-3 py-2 rounded-lg disabled:opacity-40"
              >
                作成
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
