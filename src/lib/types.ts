export type DocumentType = "note" | "prompt" | "template";
export type DocumentVisibility = "public" | "private";

export interface PromptDocument {
  id: string;
  userId: string;
  title: string | null;
  bodyMd: string;
  type: DocumentType;
  visibility: DocumentVisibility;
  tags: string[];
  likeCount: number;
  saveCount: number;
  forkCount: number;
  createdAt: string;
  updatedAt: string;
  author?: { name: string; avatarUrl?: string };
  forkedFromId?: string;
  variables?: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
}

export interface AIScores {
  clarity: { grade: string; feedback: string };
  specificity: { grade: string; feedback: string };
  structure: { grade: string; feedback: string };
  context: { grade: string; feedback: string };
  constraints: { grade: string; feedback: string };
  overall: string;
}

export interface AIReview {
  id: string;
  documentId: string;
  scores: AIScores;
  suggestionMd: string;
  model: string;
  helpful: boolean | null;
  createdAt: string;
}

export interface AIApp {
  id: string;
  name: string;
  icon: string;
  color: string;
  webUrl: string;
}

export const AI_APPS: AIApp[] = [
  { id: "chatgpt", name: "ChatGPT", icon: "💬", color: "#10a37f", webUrl: "https://chat.openai.com" },
  { id: "claude", name: "Claude", icon: "🧠", color: "#d97706", webUrl: "https://claude.ai" },
  { id: "gemini", name: "Gemini", icon: "💎", color: "#4285f4", webUrl: "https://gemini.google.com" },
  { id: "copilot", name: "Copilot", icon: "🤖", color: "#7c3aed", webUrl: "https://copilot.microsoft.com" },
  { id: "perplexity", name: "Perplexity", icon: "🔍", color: "#20808d", webUrl: "https://www.perplexity.ai" },
  { id: "grok", name: "Grok", icon: "⚡", color: "#1a1a1a", webUrl: "https://grok.com" },
];

export const TYPE_CONFIG = {
  note: { label: "メモ", icon: "📝", color: "gray" },
  prompt: { label: "プロンプト", icon: "✨", color: "blue" },
  template: { label: "テンプレート", icon: "📋", color: "purple" },
} as const;

export const CATEGORIES = ["すべて", "ビジネス", "開発", "ライティング", "画像生成", "その他"];

// Extract {{variables}} from markdown body
export function extractVariables(bodyMd: string): TemplateVariable[] {
  const matches = bodyMd.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  const unique = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, "").trim()))];
  return unique.map(name => ({ name }));
}

// Fill template variables
export function fillTemplate(bodyMd: string, values: Record<string, string>): string {
  let result = bodyMd;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), value);
  }
  return result;
}

// Sample prompts for Explore page
export const SAMPLE_PROMPTS: Omit<PromptDocument, "id" | "createdAt" | "updatedAt">[] = [
  {
    userId: "sample",
    title: "ブログ記事の構成作成",
    bodyMd: "# ブログ記事の構成を作成してください\n\n## 役割\nあなたはSEOに精通したコンテンツストラテジストです。\n\n## タスク\n以下のテーマについて、ブログ記事の構成を作成してください。\n\n- テーマ: {{テーマ}}\n- ターゲット読者: {{ターゲット}}\n- 文字数目安: 3000〜5000文字\n\n## 出力形式\n1. タイトル案（3つ）\n2. 導入文の方向性\n3. H2/H3の見出し構成\n4. まとめの方向性",
    type: "template",
    visibility: "public",
    tags: ["ライティング", "ブログ"],
    likeCount: 42,
    saveCount: 18,
    forkCount: 7,
  },
  {
    userId: "sample",
    title: "コードレビュー依頼",
    bodyMd: "以下のコードをレビューしてください。\n\n## 観点\n- バグの可能性\n- パフォーマンス改善\n- 可読性\n- セキュリティリスク\n\n## コード\n```\n{{コード}}\n```\n\n## 言語\n{{言語}}\n\n重要度順に指摘し、修正例も提示してください。",
    type: "prompt",
    visibility: "public",
    tags: ["開発", "コードレビュー"],
    likeCount: 35,
    saveCount: 12,
    forkCount: 5,
  },
  {
    userId: "sample",
    title: "メール返信の下書き",
    bodyMd: "# メール返信の下書き\n\n## 受信メールの内容\n{{受信メール}}\n\n## 返信の方向性\n- トーン: {{トーン}}\n- 目的: {{目的}}\n\n## 制約\n- 日本語で\n- 200文字以内\n- 敬語を使用",
    type: "template",
    visibility: "public",
    tags: ["ビジネス", "メール"],
    likeCount: 28,
    saveCount: 15,
    forkCount: 9,
  },
  {
    userId: "sample",
    title: "画像生成プロンプト（高品質）",
    bodyMd: "A highly detailed {{subject}}, {{style}} style, {{lighting}} lighting, masterpiece quality, 8k resolution, trending on artstation\n\nNegative: low quality, blurry, distorted, watermark",
    type: "prompt",
    visibility: "public",
    tags: ["画像生成", "Midjourney"],
    likeCount: 56,
    saveCount: 22,
    forkCount: 14,
  },
  {
    userId: "sample",
    title: "議事録の要約",
    bodyMd: "# 議事録の要約\n\n以下の議事録を構造化して要約してください。\n\n## 議事録\n{{議事録テキスト}}\n\n## 出力形式\n### 基本情報\n- 日時 / 参加者 / 目的\n\n### 決定事項\n1. ...\n\n### アクションアイテム\n| 担当 | タスク | 期限 |\n|------|--------|------|\n\n### 次回の予定",
    type: "template",
    visibility: "public",
    tags: ["ビジネス", "要約"],
    likeCount: 31,
    saveCount: 20,
    forkCount: 8,
  },
];
