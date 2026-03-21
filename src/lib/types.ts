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
  deletedAt?: string | null;
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
  // --- ビジネス ---
  {
    userId: "sample", title: "議事録 → 構造化サマリー",
    bodyMd: "# 議事録を構造化して要約\n\n以下の議事録を読み、構造化された要約を作成してください。\n\n## 議事録\n{{議事録テキスト}}\n\n## 出力形式\n### 概要（3行以内）\n\n### 決定事項\n- [ ] ...\n\n### アクションアイテム\n| 担当者 | タスク | 期限 | 優先度 |\n|--------|--------|------|--------|\n\n### 未解決の論点\n\n### 次回アジェンダ案",
    type: "template", visibility: "public", tags: ["ビジネス", "要約"], likeCount: 89, saveCount: 45, forkCount: 18,
  },
  {
    userId: "sample", title: "週次レポート自動生成",
    bodyMd: "# 週次レポートを作成\n\nあなたはプロジェクトマネージャーのアシスタントです。\n以下の情報から、上司向けの週次レポートを作成してください。\n\n## 今週やったこと\n{{今週の実績}}\n\n## 発生した問題\n{{課題・問題}}\n\n## 出力形式\n1. **サマリー**（3行）\n2. **進捗** - 完了/進行中/未着手\n3. **リスクと対策**\n4. **来週の予定**\n5. **相談事項**\n\nトーンは簡潔かつプロフェッショナルに。",
    type: "template", visibility: "public", tags: ["ビジネス", "レポート"], likeCount: 67, saveCount: 38, forkCount: 12,
  },
  {
    userId: "sample", title: "メール返信ジェネレーター",
    bodyMd: "# ビジネスメール返信\n\n## 受信メール\n{{受信メール}}\n\n## 返信方針\n- トーン: {{丁寧/カジュアル/フォーマル}}\n- 目的: {{承諾/辞退/質問/提案}}\n- 含めたいポイント: {{ポイント}}\n\n## 制約\n- 日本語ビジネスメール形式\n- 件名も提案\n- 200〜400文字\n- 敬語レベルは相手に合わせる",
    type: "template", visibility: "public", tags: ["ビジネス", "メール"], likeCount: 54, saveCount: 31, forkCount: 15,
  },
  {
    userId: "sample", title: "1on1 準備シート",
    bodyMd: "# 1on1ミーティング準備\n\nマネージャーとの1on1の準備を手伝ってください。\n\n## 前回からの振り返り\n{{前回の内容}}\n\n## 今の状況\n- 業務: {{現在の業務}}\n- 困っていること: {{課題}}\n- うまくいっていること: {{成果}}\n\n## 出力してほしいもの\n1. 話すべきトピック（優先順位付き）\n2. 各トピックの伝え方のアドバイス\n3. 上司に聞くべき質問案\n4. キャリアの話につなげる切り口",
    type: "template", visibility: "public", tags: ["ビジネス", "その他"], likeCount: 43, saveCount: 22, forkCount: 9,
  },
  // --- 開発 ---
  {
    userId: "sample", title: "コードレビュー（6軸評価）",
    bodyMd: "以下のコードを6つの観点でレビューしてください。\n\n## コード\n```{{言語}}\n{{コード}}\n```\n\n## レビュー観点\n1. **バグ** - 論理エラー、エッジケース\n2. **セキュリティ** - インジェクション、認証漏れ\n3. **パフォーマンス** - N+1、不要な計算\n4. **可読性** - 命名、構造、コメント\n5. **テスタビリティ** - テストしやすい設計か\n6. **ベストプラクティス** - 言語/FWの慣習\n\n## 出力形式\n各観点ごとに ✅ OK / ⚠️ 要改善 / ❌ 要修正 で評価し、修正例を提示。",
    type: "template", visibility: "public", tags: ["開発", "コードレビュー"], likeCount: 78, saveCount: 42, forkCount: 21,
  },
  {
    userId: "sample", title: "エラーデバッグアシスタント",
    bodyMd: "# デバッグを手伝ってください\n\n## エラーメッセージ\n```\n{{エラー}}\n```\n\n## やりたかったこと\n{{目的}}\n\n## 環境\n- 言語/FW: {{環境}}\n- OS: {{OS}}\n\n## すでに試したこと\n{{試したこと}}\n\n---\n\n以下の形式で回答してください：\n1. **原因の推定**（可能性が高い順）\n2. **解決策**（ステップバイステップ）\n3. **再発防止策**\n4. **関連する公式ドキュメントのキーワード**",
    type: "template", visibility: "public", tags: ["開発", "デバッグ"], likeCount: 92, saveCount: 55, forkCount: 28,
  },
  {
    userId: "sample", title: "Git コミットメッセージ生成",
    bodyMd: "以下の変更差分から、Conventional Commits形式のコミットメッセージを生成してください。\n\n## 差分\n```diff\n{{diff}}\n```\n\n## ルール\n- 形式: `type(scope): description`\n- type: feat, fix, docs, style, refactor, test, chore\n- 日本語でも英語でもOK（{{言語}}で）\n- 1行目は50文字以内\n- body は「なぜ」この変更をしたかを説明\n- 破壊的変更があれば BREAKING CHANGE を追記",
    type: "template", visibility: "public", tags: ["開発", "その他"], likeCount: 45, saveCount: 28, forkCount: 11,
  },
  {
    userId: "sample", title: "API設計レビュー",
    bodyMd: "以下のAPI設計をRESTful観点でレビューしてください。\n\n## エンドポイント一覧\n{{API一覧}}\n\n## チェック観点\n- URL命名規則（リソース指向か）\n- HTTPメソッドの適切さ\n- ステータスコードの使い分け\n- ページネーション設計\n- エラーレスポンス形式\n- 認証/認可の考慮\n- バージョニング戦略\n\n改善案をコード例付きで提示してください。",
    type: "prompt", visibility: "public", tags: ["開発", "その他"], likeCount: 38, saveCount: 19, forkCount: 7,
  },
  // --- ライティング ---
  {
    userId: "sample", title: "ブログ記事構成（SEO対応）",
    bodyMd: "# SEO対応ブログ記事の構成\n\n## 役割\nSEOとコンテンツマーケティングの専門家\n\n## テーマ\n{{テーマ}}\n\n## ターゲット\n- 読者: {{ターゲット読者}}\n- 検索意図: {{情報収集/比較検討/購入}}\n\n## 出力\n1. **タイトル案**（5つ、クリック率を意識）\n2. **メタディスクリプション**（120文字）\n3. **H2/H3構成**（読者の疑問に答える順序で）\n4. **各セクションの要点**（2-3行）\n5. **内部リンク候補キーワード**\n6. **CTA案**",
    type: "template", visibility: "public", tags: ["ライティング", "ブログ"], likeCount: 71, saveCount: 40, forkCount: 16,
  },
  {
    userId: "sample", title: "SNS投稿マルチ生成",
    bodyMd: "# 1つのネタからSNS投稿を5パターン生成\n\n## 元ネタ\n{{伝えたい内容}}\n\n## ターゲット\n{{誰に向けて}}\n\n## 生成してほしいもの\n1. **Twitter/X**（140文字、フック重視）\n2. **Instagram キャプション**（ストーリー調、ハッシュタグ付き）\n3. **LinkedIn**（プロフェッショナル、学びの共有）\n4. **note/ブログ導入文**（300文字、続きが読みたくなる）\n5. **YouTube サムネイルタイトル案**（3つ）\n\n各投稿に最適な絵文字とトーンを使い分けてください。",
    type: "template", visibility: "public", tags: ["ライティング", "その他"], likeCount: 63, saveCount: 35, forkCount: 19,
  },
  {
    userId: "sample", title: "文章リライト（トーン変換）",
    bodyMd: "以下の文章を、指定されたトーンにリライトしてください。\n意味は変えず、表現とニュアンスだけ変更します。\n\n## 元の文章\n{{文章}}\n\n## 変換先トーン\n{{カジュアル/フォーマル/学術的/子供向け/熱量高め}}\n\n## 追加指示\n- 文字数は元と同程度\n- 専門用語は{{残す/噛み砕く}}\n- 箇条書きは{{維持/文章化}}",
    type: "template", visibility: "public", tags: ["ライティング", "その他"], likeCount: 47, saveCount: 26, forkCount: 13,
  },
  // --- 画像生成 ---
  {
    userId: "sample", title: "Midjourney プロンプトビルダー",
    bodyMd: "A {{medium}} of {{subject}}, {{style}} style, {{mood}} mood, {{lighting}} lighting, {{color_palette}} palette, {{camera_angle}} angle, {{detail_level}} detail, --ar {{aspect_ratio}} --v 6\n\n## カスタマイズガイド\n- medium: photo, illustration, 3D render, watercolor, oil painting\n- style: cinematic, anime, minimalist, surreal, cyberpunk, studio ghibli\n- mood: serene, dramatic, mysterious, cheerful, melancholic\n- lighting: golden hour, neon, soft diffused, dramatic side, backlit\n- camera_angle: eye level, bird's eye, low angle, close-up, wide shot",
    type: "template", visibility: "public", tags: ["画像生成", "Midjourney"], likeCount: 104, saveCount: 58, forkCount: 32,
  },
  {
    userId: "sample", title: "DALL-E ロゴデザイン",
    bodyMd: "Design a modern logo for {{ブランド名}}.\n\nStyle: {{ミニマル/遊び心/高級感/テック}}\nColors: {{色指定}}\nSymbol: {{シンボルの方向性}}\n\nRequirements:\n- Clean vector style\n- Works on white and dark backgrounds\n- Scalable from favicon to billboard\n- No text in the logo\n- Simple enough to be memorable\n\nGenerate 4 variations with different approaches.",
    type: "template", visibility: "public", tags: ["画像生成", "その他"], likeCount: 52, saveCount: 29, forkCount: 14,
  },
  // --- 学習・分析 ---
  {
    userId: "sample", title: "ファインマン・テクニック学習法",
    bodyMd: "# ファインマン・テクニックで学習を深める\n\nあなたは優秀な家庭教師です。\n以下のトピックについて、ファインマン・テクニックに基づいて説明してください。\n\n## トピック\n{{学びたいこと}}\n\n## 私のレベル\n{{初心者/中級者/上級者}}\n\n## ステップ\n1. **小学生にもわかる説明**（専門用語なし）\n2. **具体的な例え話**（日常の体験に置き換え）\n3. **よくある誤解**とその修正\n4. **理解度チェック質問**（3問）\n5. **次に学ぶべきこと**\n\n図や表を使って構造的に説明してください。",
    type: "template", visibility: "public", tags: ["その他", "学習"], likeCount: 86, saveCount: 50, forkCount: 24,
  },
  {
    userId: "sample", title: "SWOT分析フレームワーク",
    bodyMd: "# SWOT分析\n\n## 対象\n{{分析対象（製品/企業/プロジェクト）}}\n\n## 背景情報\n{{業界や状況の補足}}\n\n## 分析してほしいこと\n\n### Strengths（強み）\n内部の優位性を5つ\n\n### Weaknesses（弱み）\n内部の課題を5つ\n\n### Opportunities（機会）\n外部環境のチャンスを5つ\n\n### Threats（脅威）\n外部環境のリスクを5つ\n\n## さらに\n- クロスSWOT戦略（SO/WO/ST/WT）を提案\n- 優先度の高いアクション3つを提示",
    type: "template", visibility: "public", tags: ["ビジネス", "その他"], likeCount: 58, saveCount: 33, forkCount: 15,
  },
  {
    userId: "sample", title: "英語 → 自然な日本語翻訳",
    bodyMd: "以下の英文を自然な日本語に翻訳してください。\n\n## 英文\n{{英語テキスト}}\n\n## 翻訳ルール\n- 直訳ではなく、日本語として自然な表現を優先\n- 専門用語は原文を（）内に残す\n- 文化的なニュアンスも適切に変換\n- 主語の省略など日本語らしい文体に\n\n## 出力形式\n1. **翻訳文**\n2. **意訳した箇所の補足**（なぜその訳にしたか）\n3. **難しい単語リスト**（英語: 日本語: 解説）",
    type: "template", visibility: "public", tags: ["ライティング", "その他"], likeCount: 73, saveCount: 41, forkCount: 20,
  },
];
