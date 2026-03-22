import { supabase } from "./supabase";
import { PromptDocument, TemplateVariable } from "./types";

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
      .neq("type", "note");

    if (category && category !== "すべて") {
      query = query.contains("tags", [category]);
    }

    if (sort === "popular") {
      query = query.order("like_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.limit(50);

    const { data, error } = await query;
    if (error) {
      console.error("getPublicDocuments error:", JSON.stringify(error));
      return [];
    }
    return (data || []).map((row) => {
      const doc = toDocument(row);
      const profile = row.profiles as { display_name: string | null; avatar_url: string | null } | null;
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
};
