import type { DocumentVisibility } from "./types";

// 端末内のデータとメモは、外部に公開される保存物として扱わない。
export function getSavedVisibility(isCloud: boolean, isNote: boolean, requested: DocumentVisibility): DocumentVisibility {
  return !isCloud || isNote ? "private" : requested;
}

// サーバーに存在しないローカルID・公式サンプルから共有URLを作らない。
export function canSharePublicDocument(isCloud: boolean, visibility: DocumentVisibility, documentId?: string | null): boolean {
  return isCloud && visibility === "public" && !!documentId && !documentId.startsWith("sample-");
}
