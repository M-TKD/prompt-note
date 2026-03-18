// Simple local storage-based store for MVP (no Supabase needed to start)
// This lets the app work immediately without any backend setup

import { PromptDocument } from "./types";

const STORAGE_KEY = "promptnote_documents";

function getAll(): PromptDocument[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(docs: PromptDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export const store = {
  getDocuments(): PromptDocument[] {
    return getAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
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
        (d.visibility === "public" || true) && // search own docs too
        (d.title?.toLowerCase().includes(q) ||
          d.bodyMd.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)))
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
    const docs = getAll().filter((d) => d.id !== id);
    saveAll(docs);
  },

  toggleLike(id: string) {
    const docs = getAll();
    const doc = docs.find((d) => d.id === id);
    if (doc) {
      doc.likeCount = (doc.likeCount || 0) + 1;
      saveAll(docs);
    }
  },

  fork(id: string): PromptDocument | undefined {
    const original = getAll().find((d) => d.id === id);
    if (!original) return undefined;
    return this.create({
      userId: "local",
      title: original.title ? `${original.title} (フォーク)` : null,
      bodyMd: original.bodyMd,
      type: original.type,
      visibility: "private",
      tags: [...original.tags],
      forkedFromId: original.id,
    });
  },
};
