"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cloudStore } from "@/lib/cloud-store";
import { store } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { PromptDocument } from "@/lib/types";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  note: { label: "メモ", className: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
  prompt: { label: "プロンプト", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  template: { label: "テンプレート", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

function daysAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今日";
  if (days === 1) return "1日前";
  return `${days}日前`;
}

export default function TrashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<PromptDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await cloudStore.getTrash(user.id);
        setItems(data);
      } else {
        setItems(store.getTrash());
      }
    } catch {
      toast("ゴミ箱の読み込みに失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (id: string) => {
    try {
      if (user) {
        await cloudStore.restore(id);
      } else {
        store.restore(id);
      }
      setItems((prev) => prev.filter((d) => d.id !== id));
      toast("復元しました", "success");
    } catch {
      toast("復元に失敗しました", "error");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      if (user) {
        await cloudStore.delete(id);
      } else {
        store.permanentDelete(id);
      }
      setItems((prev) => prev.filter((d) => d.id !== id));
      toast("完全に削除しました", "delete");
    } catch {
      toast("削除に失敗しました", "error");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirmDeleteAll) {
      setConfirmDeleteAll(true);
      return;
    }
    try {
      if (user) {
        for (const item of items) {
          await cloudStore.delete(item.id);
        }
      } else {
        store.emptyTrash();
      }
      setItems([]);
      setConfirmDeleteAll(false);
      toast("ゴミ箱を空にしました", "delete");
    } catch {
      toast("削除に失敗しました", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="戻る"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">ゴミ箱</h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleDeleteAll}
              onBlur={() => setConfirmDeleteAll(false)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                confirmDeleteAll
                  ? "bg-red-600 text-white"
                  : "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              }`}
            >
              {confirmDeleteAll ? "本当に削除?" : "すべて削除"}
            </button>
          )}
        </header>

        {/* Info banner */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2.5">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>削除したアイテムは30日後に自動で完全削除されます</span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900 p-4 space-y-3"
              >
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="h-8 w-14 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-600">
            <Trash2 size={48} strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium">ゴミ箱は空です</p>
          </div>
        )}

        {/* Trash list */}
        {!loading && items.length > 0 && (
          <ul className="mt-4 space-y-3">
            {items.map((item) => {
              const badge = TYPE_BADGE[item.type] || TYPE_BADGE.note;
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4"
                >
                  <p className="font-medium text-sm truncate">
                    {item.title || "無題"}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {item.deletedAt ? daysAgo(item.deletedAt) : ""}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRestore(item.id)}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                    >
                      <RotateCcw size={13} />
                      復元
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 size={13} />
                      完全削除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
