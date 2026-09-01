import { PromptDocument } from "./types";

const STORAGE_KEY = "promptnote_documents";
const SEED_KEY = "promptnote_seeded_v2";
const LIBRARY_SYNC_KEY = "promptnote_library_v3";
const DRAFT_KEY = "promptnote_draft";

function getAll(): PromptDocument[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(docs: PromptDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export const store = {
  /**
   * 公式ライブラリは types 側の定数から毎回描画するため、localStorage には複製しない。
   * 旧バージョン（v2以前）でコピーされたサンプルは内容が古くなるので、ここで一度だけ掃除する。
   * ユーザーが Fork したものは userId が "local" なので影響を受けない。
   */
  ensureSeedData() {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(LIBRARY_SYNC_KEY)) return;
    const cleaned = getAll().filter((d) => d.userId !== "sample");
    saveAll(cleaned);
    localStorage.removeItem(SEED_KEY);
    localStorage.setItem(LIBRARY_SYNC_KEY, new Date().toISOString());
  },

  getDocuments(): PromptDocument[] {
    return getAll()
      .filter(d => d.userId !== "sample" && !d.deletedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getDocument(id: string): PromptDocument | undefined {
    return getAll().find((d) => d.id === id);
  },

  getPublicDocuments(sort: "popular" | "recent" = "popular", category?: string): PromptDocument[] {
    let docs = getAll().filter((d) => d.visibility === "public" && d.type !== "note");
    if (category && category !== "すべて") {
      docs = docs.filter((d) => d.tags.includes(category));
    }
    if (sort === "popular") {
      docs.sort((a, b) => b.likeCount - a.likeCount);
    } else {
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return docs;
  },

  search(query: string): PromptDocument[] {
    const q = query.toLowerCase();
    return getAll().filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.bodyMd.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    );
  },

  create(doc: Omit<PromptDocument, "id" | "createdAt" | "updatedAt" | "likeCount" | "saveCount" | "forkCount">): PromptDocument {
    const now = new Date().toISOString();
    const newDoc: PromptDocument = {
      ...doc,
      id: crypto.randomUUID(),
      likeCount: 0,
      saveCount: 0,
      forkCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const docs = getAll();
    docs.push(newDoc);
    saveAll(docs);
    return newDoc;
  },

  update(id: string, updates: Partial<PromptDocument>): PromptDocument | undefined {
    const docs = getAll();
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) return undefined;
    docs[index] = { ...docs[index], ...updates, updatedAt: new Date().toISOString() };
    saveAll(docs);
    return docs[index];
  },

  delete(id: string) {
    const docs = getAll();
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) return;
    docs[index] = { ...docs[index], deletedAt: new Date().toISOString() };
    saveAll(docs);
  },

  getTrash(): PromptDocument[] {
    return getAll()
      .filter(d => !!d.deletedAt)
      .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  },

  restore(id: string) {
    const docs = getAll();
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) return;
    const { deletedAt, ...rest } = docs[index];
    docs[index] = { ...rest, deletedAt: null } as PromptDocument;
    saveAll(docs);
  },

  permanentDelete(id: string) {
    const docs = getAll().filter((d) => d.id !== id);
    saveAll(docs);
  },

  emptyTrash() {
    const docs = getAll().filter((d) => !d.deletedAt);
    saveAll(docs);
  },

  toggleLike(id: string) {
    const likedKey = `promptnote_liked_${id}`;
    const docs = getAll();
    const doc = docs.find((d) => d.id === id);
    if (doc) {
      const alreadyLiked = localStorage.getItem(likedKey);
      if (alreadyLiked) {
        doc.likeCount = Math.max(0, (doc.likeCount || 0) - 1);
        localStorage.removeItem(likedKey);
      } else {
        doc.likeCount = (doc.likeCount || 0) + 1;
        localStorage.setItem(likedKey, "1");
      }
      saveAll(docs);
    }
  },

  isLiked(id: string): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(`promptnote_liked_${id}`);
  },

  fork(id: string): PromptDocument | undefined {
    const docs = getAll();
    const original = docs.find((d) => d.id === id);
    if (!original) return undefined;
    original.forkCount = (original.forkCount || 0) + 1;
    saveAll(docs);
    return this.create({
      userId: "local",
      title: original.title ? `${original.title} (fork)` : null,
      bodyMd: original.bodyMd,
      type: original.type,
      visibility: "private",
      tags: [...original.tags],
      forkedFromId: original.id,
    });
  },

  saveDraft(data: { title: string; bodyMd: string; type: string; tags: string[] }) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  },

  getDraft(): { title: string; bodyMd: string; type: string; tags: string[]; savedAt: number } | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (Date.now() - draft.savedAt > 86400000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  },

  clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  },
};
