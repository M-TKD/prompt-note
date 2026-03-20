/**
 * Hybrid Store
 * ログイン中 → Supabase (cloudStore)
 * 未ログイン → localStorage (store)
 *
 * 各ページでこれを使えば、認証状態に応じて自動切替される
 */

import { store } from "./store";
import { cloudStore } from "./cloud-store";
import { PromptDocument } from "./types";

export function createHybridStore(userId: string | null) {
  const isCloud = !!userId;

  return {
    isCloud,

    // -----------------------------------------------
    // 自分のドキュメント一覧
    // -----------------------------------------------
    async getDocuments(): Promise<PromptDocument[]> {
      if (isCloud) {
        return cloudStore.getDocuments(userId!);
      }
      return store.getDocuments();
    },

    // -----------------------------------------------
    // ドキュメント1件取得
    // -----------------------------------------------
    async getDocument(id: string): Promise<PromptDocument | null | undefined> {
      if (isCloud) {
        return cloudStore.getDocument(id);
      }
      return store.getDocument(id);
    },

    // -----------------------------------------------
    // 公開ドキュメント一覧
    // -----------------------------------------------
    async getPublicDocuments(
      sort: "popular" | "recent" = "popular",
      category?: string
    ): Promise<PromptDocument[]> {
      if (isCloud) {
        return cloudStore.getPublicDocuments(sort, category);
      }
      return store.getPublicDocuments(sort, category);
    },

    // -----------------------------------------------
    // 検索
    // -----------------------------------------------
    async search(query: string): Promise<PromptDocument[]> {
      if (isCloud) {
        return cloudStore.search(query, userId!);
      }
      return store.search(query);
    },

    // -----------------------------------------------
    // 作成
    // -----------------------------------------------
    async create(
      doc: Omit<PromptDocument, "id" | "createdAt" | "updatedAt" | "likeCount" | "saveCount" | "forkCount">
    ): Promise<PromptDocument | null> {
      if (isCloud) {
        return cloudStore.create({ ...doc, userId: userId! });
      }
      return store.create(doc);
    },

    // -----------------------------------------------
    // 更新
    // -----------------------------------------------
    async update(
      id: string,
      updates: Partial<PromptDocument>
    ): Promise<PromptDocument | null | undefined> {
      if (isCloud) {
        return cloudStore.update(id, updates);
      }
      return store.update(id, updates);
    },

    // -----------------------------------------------
    // 削除
    // -----------------------------------------------
    async delete(id: string): Promise<void> {
      if (isCloud) {
        await cloudStore.delete(id);
      } else {
        store.delete(id);
      }
    },

    // -----------------------------------------------
    // いいねトグル
    // -----------------------------------------------
    async toggleLike(documentId: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.toggleLike(userId!, documentId);
      }
      store.toggleLike(documentId);
      return store.isLiked(documentId);
    },

    // -----------------------------------------------
    // いいね済み確認
    // -----------------------------------------------
    async isLiked(documentId: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.isLiked(userId!, documentId);
      }
      return store.isLiked(documentId);
    },

    // -----------------------------------------------
    // Fork
    // -----------------------------------------------
    async fork(documentId: string): Promise<PromptDocument | null | undefined> {
      if (isCloud) {
        return cloudStore.fork(userId!, documentId);
      }
      return store.fork(documentId);
    },

    // -----------------------------------------------
    // localStorage → クラウドへの移行
    // -----------------------------------------------
    async migrateLocalData(): Promise<number> {
      if (!isCloud) return 0;
      return cloudStore.migrateFromLocalStorage(userId!);
    },

    // -----------------------------------------------
    // ドラフト（常にlocalStorage）
    // -----------------------------------------------
    saveDraft: store.saveDraft,
    getDraft: store.getDraft,
    clearDraft: store.clearDraft,

    // -----------------------------------------------
    // シードデータ（localStorageのみ）
    // -----------------------------------------------
    ensureSeedData: store.ensureSeedData,
  };
}
