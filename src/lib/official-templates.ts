import { SAMPLE_PROMPTS, type PromptDocument } from "./types";

type NewDocument = Omit<PromptDocument, "id" | "createdAt" | "updatedAt" | "likeCount" | "saveCount" | "forkCount">;

// カテゴリ絞り込みより先に採番し、同じIDが常に同じテンプレートを指すようにする。
const officialTemplates: PromptDocument[] = SAMPLE_PROMPTS.map((sample, index) => ({
  ...sample,
  id: `sample-${index}`,
  likeCount: 0,
  saveCount: 0,
  forkCount: 0,
  createdAt: "",
  updatedAt: "",
  author: { name: "Prompt Notes 公式テンプレート" },
}));

// 作成日時や利用実績のない公式資料を、ユーザーの投稿と区別して返す。
export function getOfficialTemplates(category?: string): PromptDocument[] {
  return officialTemplates.filter(doc => !category || category === "すべて" || doc.tags.includes(category));
}

export function isOfficialTemplate(doc: PromptDocument): boolean {
  return doc.userId === "sample";
}

// DBに存在しないサンプルIDを参照せず、本文から通常の非公開ドキュメントを作る。
export async function duplicateOfficialTemplate(
  doc: PromptDocument,
  create: (doc: NewDocument) => Promise<PromptDocument | null> | PromptDocument,
): Promise<PromptDocument | null> {
  return create({
    userId: "local",
    title: doc.title,
    bodyMd: doc.bodyMd,
    type: doc.type,
    visibility: "private",
    tags: [...doc.tags],
  });
}

// 権限拒否や非対応環境も成功に見せず、呼び出し元で再試行を案内する。
export async function copyPromptText(bodyMd: string, clipboard?: Pick<Clipboard, "writeText">): Promise<boolean> {
  try {
    if (!clipboard) return false;
    await clipboard.writeText(bodyMd);
    return true;
  } catch {
    return false;
  }
}
