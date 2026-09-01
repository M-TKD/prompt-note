export type DocumentType = "note" | "prompt" | "template";
export type DocumentVisibility = "public" | "private";

/**
 * プロンプトの難易度レベル。
 * basic    = 基本の型。毎日使う定番。
 * advanced = 実践テクニック。精度・再現性を上げるためのもの。
 */
export type PromptLevel = "basic" | "advanced";

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
  deletedAt?: string | null;
  /** 公式ライブラリのプロンプトのみ持つメタ情報（DBには保存しない） */
  level?: PromptLevel;
  summary?: string;
  technique?: string;
  tips?: string[];
}

export interface TemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  userId: string;
  title: string | null;
  bodyMd: string;
  versionNumber: number;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  emoji: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  documentCount?: number;
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
  { id: "chatgpt", name: "ChatGPT", icon: "💬", color: "#10a37f", webUrl: "https://chatgpt.com" },
  { id: "claude", name: "Claude", icon: "🧠", color: "#d97706", webUrl: "https://claude.ai/new" },
  { id: "gemini", name: "Gemini", icon: "💎", color: "#4285f4", webUrl: "https://gemini.google.com/app" },
  { id: "copilot", name: "Copilot", icon: "🤖", color: "#7c3aed", webUrl: "https://copilot.microsoft.com" },
  { id: "perplexity", name: "Perplexity", icon: "🔍", color: "#20808d", webUrl: "https://www.perplexity.ai" },
  { id: "grok", name: "Grok", icon: "⚡", color: "#1a1a1a", webUrl: "https://grok.com" },
];

export const TYPE_CONFIG = {
  note: { label: "メモ", icon: "📝", color: "gray" },
  prompt: { label: "プロンプト", icon: "✨", color: "blue" },
  template: { label: "テンプレート", icon: "📋", color: "purple" },
} as const;

export const CATEGORIES = ["すべて", "テクニック", "ビジネス", "開発", "ライティング", "画像生成", "フリーランス", "その他"];

// Extract {{variables}} from markdown body
export function extractVariables(bodyMd: string): TemplateVariable[] {
  const matches = bodyMd.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  const unique = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, "").trim()))];
  return unique.map(name => ({ name }));
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Fill template variables
export function fillTemplate(bodyMd: string, values: Record<string, string>): string {
  let result = bodyMd;
  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
    result = result.replace(new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, "g"), value);
  }
  return result;
}
