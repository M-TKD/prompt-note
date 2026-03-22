/**
 * Hybrid Store
 * ログイン中 → Supabase (cloudStore)
 * 未ログイン → localStorage (store)
 *
 * 各ページでこれを使えば、認証状態に応じて自動切替される
 */

import { store } from "./store";
import { cloudStore } from "./cloud-store";
import { PromptDocument, Collection, DocumentVersion } from "./types";

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
    // 削除（ゴミ箱へ移動）
    // -----------------------------------------------
    async delete(id: string): Promise<void> {
      if (isCloud) {
        await cloudStore.softDelete(id);
      } else {
        store.delete(id);
      }
    },

    // -----------------------------------------------
    // ゴミ箱一覧
    // -----------------------------------------------
    async getTrash(): Promise<PromptDocument[]> {
      if (isCloud) {
        return cloudStore.getTrash(userId!);
      }
      return store.getTrash();
    },

    // -----------------------------------------------
    // ゴミ箱から復元
    // -----------------------------------------------
    async restore(id: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.restore(id);
      }
      store.restore(id);
      return true;
    },

    // -----------------------------------------------
    // 完全削除
    // -----------------------------------------------
    async permanentDelete(id: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.delete(id);
      }
      store.permanentDelete(id);
      return true;
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

    // -----------------------------------------------
    // コレクション（クラウド専用）
    // -----------------------------------------------
    async getCollections(): Promise<Collection[]> {
      if (isCloud) {
        return cloudStore.getCollections(userId!);
      }
      return [];
    },

    async createCollection(name: string, emoji?: string): Promise<Collection | null> {
      if (isCloud) {
        return cloudStore.createCollection(userId!, name, emoji);
      }
      return null;
    },

    async updateCollection(id: string, updates: { name?: string; emoji?: string; description?: string }): Promise<boolean> {
      if (isCloud) {
        return cloudStore.updateCollection(id, updates);
      }
      return false;
    },

    async deleteCollection(id: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.deleteCollection(id);
      }
      return false;
    },

    async addToCollection(collectionId: string, documentId: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.addToCollection(collectionId, documentId);
      }
      return false;
    },

    async removeFromCollection(collectionId: string, documentId: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.removeFromCollection(collectionId, documentId);
      }
      return false;
    },

    async getCollectionDocuments(collectionId: string): Promise<PromptDocument[]> {
      if (isCloud) {
        return cloudStore.getCollectionDocuments(collectionId);
      }
      return [];
    },

    async getDocumentCollections(documentId: string): Promise<string[]> {
      if (isCloud) {
        return cloudStore.getDocumentCollections(documentId);
      }
      return [];
    },

    // -----------------------------------------------
    // バージョン履歴（クラウド専用）
    // -----------------------------------------------
    async saveVersion(documentId: string, title: string | null, bodyMd: string): Promise<DocumentVersion | null> {
      if (isCloud) {
        return cloudStore.saveVersion(userId!, documentId, title, bodyMd);
      }
      return null;
    },

    async getVersions(documentId: string): Promise<DocumentVersion[]> {
      if (isCloud) {
        return cloudStore.getVersions(documentId);
      }
      return [];
    },

    async getVersion(versionId: string): Promise<DocumentVersion | null> {
      if (isCloud) {
        return cloudStore.getVersion(versionId);
      }
      return null;
    },

    async restoreVersion(documentId: string, versionId: string): Promise<boolean> {
      if (isCloud) {
        return cloudStore.restoreVersion(documentId, versionId);
      }
      return false;
    },

    // -----------------------------------------------
    // 全データ削除（クラウド）
    // -----------------------------------------------
    async deleteAllDocuments(): Promise<boolean> {
      if (isCloud) {
        return cloudStore.deleteAllDocuments(userId!);
      }
      return false;
    },
  };
}
