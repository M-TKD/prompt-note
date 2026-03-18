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
];

export const TYPE_CONFIG = {
  note: { label: "メモ", icon: "📝", color: "gray" },
  prompt: { label: "プロンプト", icon: "✨", color: "blue" },
  template: { label: "テンプレート", icon: "📋", color: "purple" },
} as const;

export const CATEGORIES = ["すべて", "ビジネス", "開発", "ライティング", "画像生成", "その他"];
