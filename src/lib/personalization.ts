/**
 * パーソナライズ（個人設定）
 *
 * ユーザーの職種・専門分野・文体などを1度だけ設定しておき、
 * - テンプレートの {{私の職種}} などを自動で埋める
 * - AIに送る前に「私について」ブロックを先頭に付ける
 * - AI Review の講評を職種・レベルに合わせる
 * ために使う。
 *
 * 保存先はブラウザの localStorage のみ（サーバーには送らない）。
 * AI Review / Send to AI で明示的に使う時だけ本文に混ぜて送信される。
 */

export type ToneKey = "polite" | "casual" | "formal" | "logical" | "friendly";
export type ExpertiseKey = "beginner" | "intermediate" | "expert";
export type LengthKey = "short" | "normal" | "long";
export type LanguageKey = "ja" | "en" | "auto";

export interface UserPreferences {
  /** 表示名・署名などに使う名前 */
  displayName: string;
  /** 職種（例: フリーランスWebデザイナー） */
  role: string;
  /** 業界・事業ドメイン（例: BtoB SaaS） */
  industry: string;
  /** 得意分野・専門領域（例: LP制作、UI/UX） */
  expertiseArea: string;
  /** AIに求める説明のレベル */
  expertise: ExpertiseKey;
  /** 文体・トーン */
  tone: ToneKey;
  /** 出力言語 */
  language: LanguageKey;
  /** 出力の長さの好み */
  length: LengthKey;
  /** よく使うAIアプリのID（AI_APPS の id） */
  favoriteAI: string;
  /** 自由記述の追加指示（NGワード、固有名詞、社内ルールなど） */
  customInstructions: string;
  /** Send to AI 時に「私について」ブロックを自動で付けるか */
  autoAttachContext: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: "",
  role: "",
  industry: "",
  expertiseArea: "",
  expertise: "intermediate",
  tone: "polite",
  language: "ja",
  length: "normal",
  favoriteAI: "",
  customInstructions: "",
  autoAttachContext: false,
};

export const TONE_LABELS: Record<ToneKey, string> = {
  polite: "丁寧",
  casual: "カジュアル",
  formal: "フォーマル",
  logical: "論理的・簡潔",
  friendly: "親しみやすい",
};

export const EXPERTISE_LABELS: Record<ExpertiseKey, string> = {
  beginner: "初心者（専門用語は噛み砕く）",
  intermediate: "中級者（要点重視）",
  expert: "上級者（前置き不要・密度重視）",
};

export const LENGTH_LABELS: Record<LengthKey, string> = {
  short: "短め（要点のみ）",
  normal: "標準",
  long: "詳しく（背景・根拠まで）",
};

export const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  ja: "日本語",
  en: "English",
  auto: "入力に合わせる",
};

const STORAGE_KEY = "promptnote_preferences";

/** 保存済みの設定を読む。未設定なら null（デフォルトとの区別が必要な場面用） */
export function readStoredPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<UserPreferences>) };
  } catch {
    return null;
  }
}

export function loadPreferences(): UserPreferences {
  return readStoredPreferences() ?? { ...DEFAULT_PREFERENCES };
}

export function savePreferences(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearPreferences() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** 1つでも意味のある値が入っているか（未設定の案内を出し分けるため） */
export function hasPreferences(prefs: UserPreferences): boolean {
  return Boolean(
    prefs.displayName.trim() ||
      prefs.role.trim() ||
      prefs.industry.trim() ||
      prefs.expertiseArea.trim() ||
      prefs.customInstructions.trim()
  );
}

/**
 * テンプレート内で自動補完される個人トークン。
 * ここに載っている {{変数}} は Variables シートで初期値が入る。
 */
export const PERSONAL_TOKENS: { name: string; describe: string; resolve: (p: UserPreferences) => string }[] = [
  { name: "私の名前", describe: "表示名", resolve: (p) => p.displayName },
  { name: "私の職種", describe: "職種", resolve: (p) => p.role },
  { name: "私の業界", describe: "業界・事業ドメイン", resolve: (p) => p.industry },
  { name: "私の専門分野", describe: "得意分野", resolve: (p) => p.expertiseArea },
  { name: "文体", describe: "トーン", resolve: (p) => TONE_LABELS[p.tone] },
  { name: "出力言語", describe: "出力言語", resolve: (p) => (p.language === "auto" ? "入力と同じ言語" : LANGUAGE_LABELS[p.language]) },
  { name: "出力の長さ", describe: "長さの好み", resolve: (p) => LENGTH_LABELS[p.length] },
  { name: "私のレベル", describe: "説明のレベル", resolve: (p) => EXPERTISE_LABELS[p.expertise] },
];

/** テンプレート変数のうち、個人設定から埋められるものの初期値を返す */
export function resolvePersonalValues(
  variableNames: string[],
  prefs: UserPreferences = loadPreferences()
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const name of variableNames) {
    const token = PERSONAL_TOKENS.find((t) => t.name === name);
    if (!token) continue;
    const value = token.resolve(prefs).trim();
    if (value) values[name] = value;
  }
  return values;
}

export function isPersonalToken(name: string): boolean {
  return PERSONAL_TOKENS.some((t) => t.name === name);
}

/**
 * AIに渡す「私について」ブロック。
 * プロンプト本文の前に置くことで、毎回同じ前提を書かなくて済む。
 */
export function buildPersonalContext(prefs: UserPreferences = loadPreferences()): string {
  const lines: string[] = [];
  if (prefs.role.trim()) lines.push(`- 私の職種: ${prefs.role.trim()}`);
  if (prefs.industry.trim()) lines.push(`- 業界 / 事業ドメイン: ${prefs.industry.trim()}`);
  if (prefs.expertiseArea.trim()) lines.push(`- 得意分野: ${prefs.expertiseArea.trim()}`);
  lines.push(`- 説明のレベル: ${EXPERTISE_LABELS[prefs.expertise]}`);
  lines.push(`- トーン: ${TONE_LABELS[prefs.tone]}`);
  lines.push(`- 出力言語: ${prefs.language === "auto" ? "入力と同じ言語" : LANGUAGE_LABELS[prefs.language]}`);
  lines.push(`- 分量: ${LENGTH_LABELS[prefs.length]}`);
  if (prefs.customInstructions.trim()) {
    lines.push(`- 追加の指示:\n${indent(prefs.customInstructions.trim())}`);
  }

  return ["## 私について（この条件を守って回答してください）", ...lines].join("\n");
}

function indent(text: string): string {
  return text
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

/** プロンプト本文の先頭に個人コンテキストを付ける */
export function withPersonalContext(bodyMd: string, prefs: UserPreferences = loadPreferences()): string {
  if (!hasPreferences(prefs)) return bodyMd;
  return `${buildPersonalContext(prefs)}\n\n---\n\n${bodyMd}`;
}

/** AI Review のシステムプロンプトに足す、講評の宛先情報（短く） */
export function buildReviewerHint(prefs: UserPreferences = loadPreferences()): string {
  const parts: string[] = [];
  if (prefs.role.trim()) parts.push(`職種: ${prefs.role.trim()}`);
  if (prefs.industry.trim()) parts.push(`業界: ${prefs.industry.trim()}`);
  parts.push(`理解レベル: ${EXPERTISE_LABELS[prefs.expertise]}`);
  parts.push(`好みのトーン: ${TONE_LABELS[prefs.tone]}`);
  if (prefs.customInstructions.trim()) parts.push(`個別ルール: ${prefs.customInstructions.trim().slice(0, 300)}`);
  return parts.join(" / ");
}
