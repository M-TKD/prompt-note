import { supabase } from "./supabase";
import { PromptDocument, TemplateVariable, Collection, DocumentVersion } from "./types";

// SupabaseのDB行 → DocumentVersion型に変換
function toVersion(row: Record<string, unknown>): DocumentVersion {
  return {
    id: row.id as string,
    documentId: row.document_id as string,
    userId: row.user_id as string,
    title: row.title as string | null,
    bodyMd: row.body_md as string,
    versionNumber: row.version_number as number,
    createdAt: row.created_at as string,
  };
}

// SupabaseのDB行 → アプリのPromptDocument型に変換
function toDocument(row: Record<string, unknown>): PromptDocument {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string | null,
    bodyMd: row.body_md as string,
    type: row.type as PromptDocument["type"],
    visibility: row.visibility as PromptDocument["visibility"],
    tags: (row.tags as string[]) || [],
    likeCount: (row.like_count as number) || 0,
    saveCount: (row.save_count as number) || 0,
    forkCount: (row.fork_count as number) || 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    forkedFromId: row.forked_from_id as string | undefined,
    variables: row.variables as TemplateVariable[] | undefined,
    deletedAt: row.deleted_at as string | null | undefined,
  };
}

export const cloudStore = {
  // -----------------------------------------------
  // 自分のドキュメント一覧
  // -----------------------------------------------
  async getDocuments(userId: string): Promise<PromptDocument[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("getDocuments error:", JSON.stringify(error));
      return [];
    }
    return (data || []).map(toDocument);
  },

  // -----------------------------------------------
  // ドキュメント1件取得
  // -----------------------------------------------
  async getDocument(id: string): Promise<PromptDocument | null> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return toDocument(data);
  },

  // -----------------------------------------------
  // 公開ドキュメント一覧（Exploreページ用）
  // -----------------------------------------------
  async getPublicDocuments(
    sort: "popular" | "recent" = "popular",
    category?: string
  ): Promise<PromptDocument[]> {
    let query = supabase
      .from("documents")
      .select("*, profiles:user_id(display_name, avatar_url)")
      .eq("visibility", "public")
      .neq("type", "note")
      .is("deleted_at", null);

    if (category && category !== "すべて") {
      query = query.contains("tags", [category]);
    }

    if (sort === "popular") {
      query = query.order("like_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.limit(50);

    let { data, error } = await query;

    // If the profiles JOIN fails (missing FK), retry without the JOIN
    if (error) {
      console.warn("getPublicDocuments JOIN failed, retrying without profiles:", JSON.stringify(error));
      let fallbackQuery = supabase
        .from("documents")
        .select("*")
        .eq("visibility", "public")
        .neq("type", "note")
        .is("deleted_at", null);

      if (category && category !== "すべて") {
        fallbackQuery = fallbackQuery.contains("tags", [category]);
      }
      if (sort === "popular") {
        fallbackQuery = fallbackQuery.order("like_count", { ascending: false });
      } else {
        fallbackQuery = fallbackQuery.order("created_at", { ascending: false });
      }
      fallbackQuery = fallbackQuery.limit(50);

      const fallback = await fallbackQuery;
      if (fallback.error) {
        console.error("getPublicDocuments fallback error:", JSON.stringify(fallback.error));
        return [];
      }
      data = fallback.data;
      error = null;
    }

    return (data || []).map((row) => {
      const doc = toDocument(row);
      const profile = (row as Record<string, unknown>).profiles as { display_name: string | null; avatar_url: string | null } | null;
      if (profile) {
        doc.author = {
          name: profile.display_name || "Anonymous",
          avatarUrl: profile.avatar_url || undefined,
        };
      }
      return doc;
    });
  },

  // -----------------------------------------------
  // 検索
  // -----------------------------------------------
  async search(query: string, userId?: string): Promise<PromptDocument[]> {
    const q = `%${query}%`;
    let dbQuery = supabase
      .from("documents")
      .select("*")
      .or(`title.ilike.${q},body_md.ilike.${q}`);

    // ログイン中: 自分のドキュメント + 公開ドキュメント
    if (userId) {
      dbQuery = dbQuery.or(`user_id.eq.${userId},visibility.eq.public`);
    } else {
      dbQuery = dbQuery.eq("visibility", "public");
    }

    dbQuery = dbQuery.order("updated_at", { ascending: false }).limit(30);

    const { data, error } = await dbQuery;
    if (error) {
      console.error("search error:", JSON.stringify(error));
      return [];
    }
    return (data || []).map(toDocument);
  },

  // -----------------------------------------------
  // 作成
  // -----------------------------------------------
  async create(
    doc: Omit<PromptDocument, "id" | "createdAt" | "updatedAt" | "likeCount" | "saveCount" | "forkCount">
  ): Promise<PromptDocument | null> {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: doc.userId,
        title: doc.title,
        body_md: doc.bodyMd,
        type: doc.type,
        visibility: doc.visibility,
        tags: doc.tags,
        forked_from_id: doc.forkedFromId || null,
        variables: doc.variables || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("create error:", JSON.stringify(error));
      return null;
    }
    return toDocument(data);
  },

  // -----------------------------------------------
  // 更新
  // -----------------------------------------------
  async update(
    id: string,
    updates: Partial<PromptDocument>
  ): Promise<PromptDocument | null> {
    // アプリのフィールド名 → DB カラム名に変換
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.bodyMd !== undefined) dbUpdates.body_md = updates.bodyMd;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.visibility !== undefined) dbUpdates.visibility = updates.visibility;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.variables !== undefined) dbUpdates.variables = updates.variables;
    if (updates.forkedFromId !== undefined) dbUpdates.forked_from_id = updates.forkedFromId;

    const { data, error } = await supabase
      .from("documents")
      .update(dbUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("update error:", JSON.stringify(error));
      return null;
    }
    return toDocument(data);
  },

  // -----------------------------------------------
  // ソフト削除（ゴミ箱へ移動）
  // -----------------------------------------------
  async softDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.error("softDelete error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // ゴミ箱から復元
  // -----------------------------------------------
  async restore(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("documents")
      .update({ deleted_at: null })
      .eq("id", id);
    if (error) {
      console.error("restore error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // 完全削除
  // -----------------------------------------------
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      console.error("delete error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // ゴミ箱一覧
  // -----------------------------------------------
  async getTrash(userId: string): Promise<PromptDocument[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (error) {
      console.error("getTrash error:", JSON.stringify(error));
      return [];
    }
    return (data || []).map(toDocument);
  },

  // -----------------------------------------------
  // ゴミ箱を空にする（30日以上前のものを削除）
  // -----------------------------------------------
  async emptyOldTrash(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("documents")
      .delete()
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo)
      .select("id");

    if (error) {
      console.error("emptyOldTrash error:", JSON.stringify(error));
      return 0;
    }
    return (data || []).length;
  },

  // -----------------------------------------------
  // いいね（トグル）
  // -----------------------------------------------
  async toggleLike(userId: string, documentId: string): Promise<boolean> {
    // 既にいいね済みか確認
    const { data: existing } = await supabase
      .from("likes")
      .select("user_id")
      .eq("user_id", userId)
      .eq("document_id", documentId)
      .single();

    if (existing) {
      // いいね解除
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("document_id", documentId);
      return false; // unliked
    } else {
      // いいね追加
      await supabase
        .from("likes")
        .insert({ user_id: userId, document_id: documentId });
      return true; // liked
    }
  },

  // -----------------------------------------------
  // いいね済みか確認
  // -----------------------------------------------
  async isLiked(userId: string, documentId: string): Promise<boolean> {
    const { data } = await supabase
      .from("likes")
      .select("user_id")
      .eq("user_id", userId)
      .eq("document_id", documentId)
      .single();
    return !!data;
  },

  // -----------------------------------------------
  // Fork
  // -----------------------------------------------
  async fork(userId: string, documentId: string): Promise<PromptDocument | null> {
    // 元のドキュメントを取得
    const original = await this.getDocument(documentId);
    if (!original) return null;

    // fork_count を increment
    try {
      await supabase
        .from("documents")
        .update({ fork_count: (original.forkCount || 0) + 1 })
        .eq("id", documentId);
    } catch (e) {
      console.error("fork count update error:", e);
    }

    // 新しいドキュメントとして作成
    return this.create({
      userId,
      title: original.title ? `${original.title} (fork)` : null,
      bodyMd: original.bodyMd,
      type: original.type,
      visibility: "private",
      tags: [...original.tags],
      forkedFromId: original.id,
      variables: original.variables,
    });
  },

  // -----------------------------------------------
  // localStorage → Supabase へのデータ移行
  // -----------------------------------------------
  async migrateFromLocalStorage(userId: string): Promise<number> {
    const STORAGE_KEY = "promptnote_documents";
    const MIGRATED_KEY = "promptnote_migrated_to_cloud";

    // 既に移行済みならスキップ
    if (typeof window === "undefined") return 0;
    if (localStorage.getItem(MIGRATED_KEY)) return 0;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
      return 0;
    }

    const localDocs: PromptDocument[] = JSON.parse(raw);
    // サンプルデータとuser=localのドキュメントだけ移行
    const userDocs = localDocs.filter(
      (d) => d.userId === "local" || d.userId === ""
    );

    if (userDocs.length === 0) {
      localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
      return 0;
    }

    let migrated = 0;
    for (const doc of userDocs) {
      const result = await this.create({
        userId,
        title: doc.title,
        bodyMd: doc.bodyMd,
        type: doc.type,
        visibility: doc.visibility,
        tags: doc.tags,
        forkedFromId: doc.forkedFromId,
        variables: doc.variables,
      });
      if (result) migrated++;
    }

    localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
    return migrated;
  },

  // -----------------------------------------------
  // プロフィール確保（なければ作成）
  // -----------------------------------------------
  async ensureProfile(userId: string, name?: string, avatarUrl?: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!data) {
      // プロフィールが無い（既存ユーザー）→ 作成
      await supabase.from("profiles").insert({
        id: userId,
        display_name: name || "User",
        avatar_url: avatarUrl || null,
      });
    }
    return data;
  },

  // -----------------------------------------------
  // プロフィール取得
  // -----------------------------------------------
  async getProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  },

  // -----------------------------------------------
  // プロフィール更新
  // -----------------------------------------------
  async updateProfile(userId: string, updates: { display_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) console.error("updateProfile error:", error);
    return data;
  },

  // -----------------------------------------------
  // コレクション一覧
  // -----------------------------------------------
  async getCollections(userId: string): Promise<Collection[]> {
    const { data, error } = await supabase
      .from("collections")
      .select("*, collection_items(count)")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("getCollections error:", JSON.stringify(error));
      return [];
    }
    return (data || []).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      name: row.name as string,
      description: row.description as string | null,
      emoji: row.emoji as string | null,
      sortOrder: row.sort_order as number,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      documentCount: ((row.collection_items as { count: number }[])?.[0]?.count) || 0,
    }));
  },

  // -----------------------------------------------
  // コレクション作成
  // -----------------------------------------------
  async createCollection(userId: string, name: string, emoji?: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: userId,
        name,
        emoji: emoji || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("createCollection error:", JSON.stringify(error));
      return null;
    }
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      emoji: data.emoji,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      documentCount: 0,
    };
  },

  // -----------------------------------------------
  // コレクション更新
  // -----------------------------------------------
  async updateCollection(id: string, updates: { name?: string; emoji?: string; description?: string }): Promise<boolean> {
    const { error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id);
    if (error) {
      console.error("updateCollection error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // コレクション削除
  // -----------------------------------------------
  async deleteCollection(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("deleteCollection error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // コレクションにドキュメント追加
  // -----------------------------------------------
  async addToCollection(collectionId: string, documentId: string): Promise<boolean> {
    const { error } = await supabase
      .from("collection_items")
      .insert({ collection_id: collectionId, document_id: documentId });
    if (error) {
      console.error("addToCollection error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // コレクションからドキュメント削除
  // -----------------------------------------------
  async removeFromCollection(collectionId: string, documentId: string): Promise<boolean> {
    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("document_id", documentId);
    if (error) {
      console.error("removeFromCollection error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // コレクション内のドキュメント取得
  // -----------------------------------------------
  async getCollectionDocuments(collectionId: string): Promise<PromptDocument[]> {
    const { data, error } = await supabase
      .from("collection_items")
      .select("document_id, documents(*)")
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("getCollectionDocuments error:", JSON.stringify(error));
      return [];
    }
    return (data || [])
      .filter((row) => row.documents)
      .map((row) => toDocument(row.documents as unknown as Record<string, unknown>));
  },

  // -----------------------------------------------
  // ドキュメントが属するコレクション一覧
  // -----------------------------------------------
  async getDocumentCollections(documentId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("collection_items")
      .select("collection_id")
      .eq("document_id", documentId);
    if (error) {
      console.error("getDocumentCollections error:", JSON.stringify(error));
      return [];
    }
    return (data || []).map((row) => row.collection_id as string);
  },

  // -----------------------------------------------
  // バージョン保存
  // -----------------------------------------------
  async saveVersion(
    userId: string,
    documentId: string,
    title: string | null,
    bodyMd: string
  ): Promise<DocumentVersion | null> {
    // 現在の最大version_numberを取得
    const { data: maxData } = await supabase
      .from("document_versions")
      .select("version_number")
      .eq("document_id", documentId)
      .order("version_number", { ascending: false })
      .limit(1);

    const nextVersion = (maxData && maxData.length > 0 ? (maxData[0].version_number as number) : 0) + 1;

    const { data, error } = await supabase
      .from("document_versions")
      .insert({
        document_id: documentId,
        user_id: userId,
        title,
        body_md: bodyMd,
        version_number: nextVersion,
      })
      .select("*")
      .single();

    if (error) {
      console.error("saveVersion error:", JSON.stringify(error));
      return null;
    }
    return toVersion(data);
  },

  // -----------------------------------------------
  // バージョン一覧取得
  // -----------------------------------------------
  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", documentId)
      .order("version_number", { ascending: false });

    if (error) {
      console.error("getVersions error:", JSON.stringify(error));
      return [];
    }
    return (data || []).map(toVersion);
  },

  // -----------------------------------------------
  // バージョン1件取得
  // -----------------------------------------------
  async getVersion(versionId: string): Promise<DocumentVersion | null> {
    const { data, error } = await supabase
      .from("document_versions")
      .select("*")
      .eq("id", versionId)
      .single();

    if (error || !data) return null;
    return toVersion(data);
  },

  // -----------------------------------------------
  // バージョン復元（ドキュメントの内容を上書き）
  // -----------------------------------------------
  async restoreVersion(documentId: string, versionId: string): Promise<boolean> {
    const version = await this.getVersion(versionId);
    if (!version) return false;

    const { error } = await supabase
      .from("documents")
      .update({
        title: version.title,
        body_md: version.bodyMd,
      })
      .eq("id", documentId);

    if (error) {
      console.error("restoreVersion error:", JSON.stringify(error));
      return false;
    }
    return true;
  },

  // -----------------------------------------------
  // 全ドキュメント削除（クラウドデータクリア）
  // -----------------------------------------------
  async deleteAllDocuments(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("user_id", userId);
    if (error) {
      console.error("deleteAllDocuments error:", JSON.stringify(error));
      return false;
    }
    return true;
  },
};
