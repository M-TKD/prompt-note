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

export const CATEGORIES = ["すべて", "ビジネス", "開発", "ライティング", "画像生成", "フリーランス", "その他"];

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
  // --- 追加: 実用プロンプト10選 ---
  {
    userId: "sample", title: "プレゼン資料のストーリー構成",
    bodyMd: "# プレゼン資料の構成を作成\n\nあなたはプレゼンテーションデザインの専門家です。\n\n## テーマ\n{{プレゼンのテーマ}}\n\n## 聴衆\n{{誰に向けて}}\n\n## 目的\n{{説得/報告/提案/教育}}\n\n## 持ち時間\n{{分数}}\n\n## 出力形式\n各スライドを以下の形式で：\n\n### スライド1: タイトル\n- **見出し**: ...\n- **伝えたいこと**: ...\n- **ビジュアルの提案**: ...\n- **話す内容のメモ**: ...\n\n## 制約\n- 1スライド1メッセージの原則\n- 文字は最小限、ビジュアル重視\n- 「結論→根拠→具体例」の構成",
    type: "template", visibility: "public", tags: ["ビジネス", "その他"], likeCount: 82, saveCount: 47, forkCount: 22,
  },
  {
    userId: "sample", title: "ユーザーインタビュー質問設計",
    bodyMd: "# ユーザーインタビューの質問設計\n\n## プロダクト/サービス\n{{プロダクト名と概要}}\n\n## インタビュー目的\n{{何を明らかにしたいか}}\n\n## ターゲットユーザー\n{{ペルソナの特徴}}\n\n## 出力してほしいもの\n1. **アイスブレイク**（2問）\n2. **行動に関する質問**（5問）- 実際にどうしているか\n3. **感情に関する質問**（3問）- どう感じたか\n4. **ニーズに関する質問**（3問）- 理想の状態は\n5. **クロージング**（1問）\n\n## ルール\n- 誘導質問を避ける\n- 「はい/いいえ」で終わらないオープン質問\n- 各質問に「なぜこの質問をするか」の意図を付記",
    type: "template", visibility: "public", tags: ["ビジネス", "その他"], likeCount: 61, saveCount: 35, forkCount: 14,
  },
  {
    userId: "sample", title: "競合分析レポート",
    bodyMd: "# 競合分析\n\n## 自社プロダクト\n{{自社の概要}}\n\n## 競合リスト\n{{競合名をカンマ区切り}}\n\n## 分析項目\n各競合について以下を分析：\n\n| 項目 | 自社 | 競合A | 競合B |\n|------|------|-------|-------|\n| ターゲット | | | |\n| 価格帯 | | | |\n| 主要機能 | | | |\n| 強み | | | |\n| 弱み | | | |\n| UI/UX | | | |\n| マーケティング | | | |\n\n## さらに\n- 差別化ポイントの提案（3つ）\n- 競合が見落としている市場機会\n- 自社が注力すべき領域",
    type: "template", visibility: "public", tags: ["ビジネス", "その他"], likeCount: 55, saveCount: 30, forkCount: 11,
  },
  {
    userId: "sample", title: "React コンポーネント設計",
    bodyMd: "# Reactコンポーネントを設計・実装\n\n## コンポーネント概要\n{{何を作りたいか}}\n\n## 要件\n- 機能: {{機能の詳細}}\n- スタイル: {{Tailwind/CSS Modules/styled-components}}\n- 状態管理: {{useState/useReducer/Zustand}}\n\n## 出力\n1. **コンポーネント設計**（Props型定義、状態の洗い出し）\n2. **実装コード**（TypeScript + 指定スタイル）\n3. **Storybook用ストーリー**\n4. **テストコード**（React Testing Library）\n\n## 制約\n- TypeScript strict mode\n- アクセシビリティ（ARIA属性）を考慮\n- レスポンシブ対応\n- エラーハンドリングを含める",
    type: "template", visibility: "public", tags: ["開発", "その他"], likeCount: 69, saveCount: 39, forkCount: 17,
  },
  {
    userId: "sample", title: "SQL クエリ最適化アドバイザー",
    bodyMd: "# SQLクエリを最適化\n\n## 現在のクエリ\n```sql\n{{SQLクエリ}}\n```\n\n## テーブル情報\n{{テーブル構造・レコード数・インデックス情報}}\n\n## 問題\n{{遅い/結果が間違っている/もっと効率化したい}}\n\n## 出力\n1. **問題の分析** - なぜ遅い/問題があるか\n2. **最適化版クエリ** - 改善したSQL\n3. **実行計画の解説** - 何が変わったか\n4. **インデックス提案** - 追加すべきインデックス\n5. **注意点** - データ量増加時の考慮事項",
    type: "template", visibility: "public", tags: ["開発", "その他"], likeCount: 48, saveCount: 27, forkCount: 10,
  },
  {
    userId: "sample", title: "YouTube台本（10分動画）",
    bodyMd: "# YouTube動画の台本を作成\n\n## 動画テーマ\n{{テーマ}}\n\n## チャンネルのジャンル\n{{ジャンル}}\n\n## ターゲット視聴者\n{{想定視聴者}}\n\n## 動画の長さ\n約10分（2,500〜3,000文字の台本）\n\n## 構成\n### 0:00 フック（冒頭15秒）\n視聴者の注意を引く一言。「〇〇したことありませんか？」\n\n### 0:15 テーマ紹介（30秒）\n今日話す内容の概要\n\n### 0:45 本題（8分）\n3つのポイントに分けて解説\n\n### 8:45 まとめ（1分）\n要点の振り返り + CTA（チャンネル登録）\n\n## トーン\n{{親しみやすい/プロフェッショナル/エンタメ}}",
    type: "template", visibility: "public", tags: ["ライティング", "その他"], likeCount: 77, saveCount: 44, forkCount: 25,
  },
  {
    userId: "sample", title: "カスタマーサポート返信テンプレ",
    bodyMd: "# カスタマーサポート返信\n\nあなたはカスタマーサポートの専門家です。\n\n## お客様の問い合わせ\n{{問い合わせ内容}}\n\n## 状況\n- 製品/サービス: {{製品名}}\n- 問題の種類: {{バグ/質問/クレーム/要望}}\n- 緊急度: {{高/中/低}}\n\n## 返信ルール\n- 共感から始める（お気持ちの理解）\n- 問題の原因を簡潔に説明\n- 具体的な解決策をステップで提示\n- 不明点があれば確認する姿勢\n- 最後にフォローアップを約束\n- 敬語だが温かみのあるトーン\n- 200〜300文字",
    type: "template", visibility: "public", tags: ["ビジネス", "メール"], likeCount: 44, saveCount: 25, forkCount: 13,
  },
  {
    userId: "sample", title: "データ分析レポート作成",
    bodyMd: "# データ分析レポート\n\nあなたはデータアナリストです。\n\n## データの説明\n{{データの概要と形式}}\n\n## 分析してほしいこと\n{{具体的な問い}}\n\n## 出力形式\n### 1. エグゼクティブサマリー\n3行で結論\n\n### 2. 主要な発見\n- 発見1: [データ根拠付き]\n- 発見2: [データ根拠付き]\n- 発見3: [データ根拠付き]\n\n### 3. 可視化の提案\nどんなグラフで見せるべきか\n\n### 4. 推奨アクション\n分析結果から取るべきアクション\n\n### 5. 注意点・限界\nデータの制約や注意すべき点",
    type: "template", visibility: "public", tags: ["ビジネス", "その他"], likeCount: 53, saveCount: 31, forkCount: 12,
  },
  {
    userId: "sample", title: "LP コピーライティング",
    bodyMd: "# ランディングページのコピーを作成\n\n## プロダクト\n{{プロダクト名と概要}}\n\n## ターゲット\n{{理想の顧客像}}\n\n## 解決する課題\n{{顧客が抱える問題}}\n\n## セクション別に作成\n### ヒーロー\n- キャッチコピー（10文字以内）\n- サブコピー（30文字以内）\n- CTA文言\n\n### 課題提起\n顧客の痛みを3つ\n\n### 解決策\n機能紹介×3（特徴 + ベネフィット）\n\n### 社会的証明\nテスティモニアル案×3\n\n### 料金\n無料プランと有料プランの比較\n\n### FAQ\n5問\n\n### 最終CTA\n行動を促すコピー",
    type: "template", visibility: "public", tags: ["ライティング", "ビジネス"], likeCount: 65, saveCount: 37, forkCount: 18,
  },
  {
    userId: "sample", title: "日報を30秒で書く",
    bodyMd: "# 日報生成\n\n以下のメモから日報を作成してください。\n\n## 今日やったこと（箇条書きでOK）\n{{やったこと}}\n\n## 出力形式\n```\n【日報】{{日付}}\n\n■ 本日の成果\n- ...\n\n■ 進捗状況\n| タスク | ステータス | 備考 |\n|--------|-----------|------|\n\n■ 明日の予定\n- ...\n\n■ 共有事項・相談\n- ...\n```\n\n## ルール\n- 箇条書きメモから自動で整形\n- 成果は具体的な数字を含める（あれば）\n- 簡潔に（全体200文字以内）",
    type: "template", visibility: "public", tags: ["ビジネス", "その他"], likeCount: 95, saveCount: 52, forkCount: 30,
  },
  // --- フリーランスの実務プロンプトテンプレート10選 (by Craftbase) ---
  {
    userId: "sample", title: "クライアントへの提案メール",
    bodyMd: "# クライアントへの提案メール\n\n新規・既存クライアントへの提案メール。相手の課題解決を軸に、売り込みすぎない自然な営業文面を作成。\n\n## プロンプト\n\nあなたはフリーランスの営業支援アシスタントです。\n\n以下の情報をもとに、クライアントへの提案メールを作成してください。\n\n【入力情報】\n- 自分の職種：{例：Webデザイナー}\n- 提案先：{例：株式会社ABC マーケティング部 田中様}\n- 提案内容：{例：コーポレートサイトのリニューアル}\n- 相手の課題（わかる範囲で）：{例：サイトが古く、スマホ対応ができていない}\n- 自分の強み：{例：レスポンシブデザイン実績50件以上}\n- 希望するトーン：{丁寧だが親しみやすい / フォーマル / カジュアル}\n\n【ルール】\n- 件名も作成すること\n- 300文字以内で簡潔にまとめる\n- 売り込みすぎない。相手の課題解決を軸にする\n- 最後に具体的なアクション（打ち合わせ日程の提案など）を入れる\n\n## 💡 使い方のコツ\n\n「相手の課題」を具体的に書くほど、テンプレっぽさが消えて通る提案になる。",
    type: "template", visibility: "public", tags: ["フリーランス", "メール", "営業"], likeCount: 124, saveCount: 68, forkCount: 35,
  },
  {
    userId: "sample", title: "プロジェクト完了後のフォローアップメール",
    bodyMd: "# プロジェクト完了後のフォローアップメール\n\n納品後のフォローアップでリピート率を上げる。感謝を先に、営業は控えめに。\n\n## プロンプト\n\nあなたはフリーランスのクライアント関係管理のアシスタントです。\n\nプロジェクト完了後のフォローアップメールを作成してください。\n\n【入力情報】\n- クライアント名：{例：株式会社ABC 田中様}\n- 完了したプロジェクト：{例：コーポレートサイトリニューアル}\n- 納品日：{例：2026年3月28日}\n- 特に感謝したいポイント：{例：素材の準備が早く、スムーズに進んだ}\n- 次に提案したいこと（あれば）：{例：SNS運用サポート}\n\n【ルール】\n- 感謝を先に、営業は控えめに\n- 「何かあればいつでも相談してください」のスタンスで\n- 200〜300文字程度\n- 次の提案は「もしご興味があれば」程度の軽さで触れる\n\n## 💡 使い方のコツ\n\n納品後1週間以内に送るのがベスト。テンプレートを用意しておけば「面倒だから後で…」が防げる。",
    type: "template", visibility: "public", tags: ["フリーランス", "メール", "フォローアップ"], likeCount: 98, saveCount: 54, forkCount: 27,
  },
  {
    userId: "sample", title: "提案書・企画書のドラフト",
    bodyMd: "# 提案書・企画書のドラフト\n\nクライアント向け提案書の骨格をAIに作らせる。ゼロからの2〜3時間が30分に。\n\n## プロンプト\n\nあなたはビジネスコンサルタントです。\n以下の情報をもとに、クライアント向けの提案書ドラフトを作成してください。\n\n【入力情報】\n- プロジェクト名：{例：ECサイト構築プロジェクト}\n- クライアント：{例：アパレルブランドD社}\n- クライアントの課題：{例：実店舗の売上が減少、EC販路を持っていない}\n- 提案する解決策：{例：Shopifyを使ったECサイト構築}\n- 予算感：{例：80〜120万円}\n- スケジュール：{例：2ヶ月}\n\n【構成】\n1. 課題の整理（クライアントの現状と課題を端的にまとめる）\n2. 提案内容（解決策の概要とアプローチ）\n3. スケジュール（フェーズごとのマイルストーン）\n4. 見積概算（大項目レベルで）\n5. なぜ自分に任せるべきか（実績・強み）\n\n【ルール】\n- 各セクションは3〜5行で簡潔に\n- 専門用語は使わず、クライアントが理解できる言葉で\n- 数字や具体例を入れて説得力を出す\n\n## 💡 使い方のコツ\n\nAIの出力をそのまま使うのではなく、クライアント固有の文脈（過去のやり取り、担当者の好み）を自分で加筆するのが重要。",
    type: "template", visibility: "public", tags: ["フリーランス", "提案書", "ドキュメント"], likeCount: 112, saveCount: 62, forkCount: 31,
  },
  {
    userId: "sample", title: "議事録の構造化（フリーランス版）",
    bodyMd: "# 議事録の構造化\n\n会議後のダラダラしたメモを5分で整った議事録に変換。決定事項・未解決・アクション表に分離。\n\n## プロンプト\n\nあなたは議事録作成の専門家です。\n以下の会議メモを、構造化された議事録に変換してください。\n\n【会議メモ（そのまま貼り付け）】\n{ここに走り書きのメモや文字起こしテキストを貼る}\n\n【出力形式】\n## 会議概要\n- 日時：\n- 参加者：\n- 議題：\n\n## 決定事項\n（番号付きリストで）\n\n## 未解決事項・持ち越し\n（番号付きリストで）\n\n## 次のアクション\n| 担当者 | アクション | 期限 |\n|--------|-----------|------|\n\n【ルール】\n- メモに書かれていない情報を捏造しない\n- 曖昧な表現は「（要確認）」と注記する\n- 箇条書きで端的にまとめる\n\n## 💡 使い方のコツ\n\n会議中に雑にメモを取るだけでOK。「整理する作業」はAIに任せる。人間は会議の内容に集中できる。",
    type: "template", visibility: "public", tags: ["フリーランス", "議事録", "会議"], likeCount: 136, saveCount: 74, forkCount: 42,
  },
  {
    userId: "sample", title: "見積書の項目・金額の叩き台",
    bodyMd: "# 見積書の項目・金額の叩き台\n\n「いくらで見積もればいい？」にAIを壁打ち相手にする。項目の漏れチェックにも有効。\n\n## プロンプト\n\nあなたはフリーランスの料金設定アドバイザーです。\n以下のプロジェクトの見積書の叩き台を作成してください。\n\n【入力情報】\n- 職種：{例：Webデザイナー}\n- 案件内容：{例：コーポレートサイト制作（トップ+下層5ページ）}\n- 想定作業期間：{例：1.5ヶ月}\n- クライアント規模：{例：従業員30名の中小企業}\n- 含めるべき作業：{例：デザイン、コーディング、レスポンシブ対応、WordPress構築}\n\n【出力形式】\n| 項目 | 内容 | 金額（税抜） |\n|------|------|-------------|\n\n- 合計金額も算出\n- 備考欄に「含まれないもの」も記載\n\n【ルール】\n- 相場感に基づいた金額を提示（安売りしすぎない）\n- 項目は細かく分けすぎない（クライアントが理解しやすい粒度で）\n- あくまで叩き台であることを明記\n\n## 💡 使い方のコツ\n\nAIの出力金額は参考値。最終的な金額は自分の経験と市場感覚で決める。ただし「項目の漏れ」をチェックするのにはかなり使える。",
    type: "template", visibility: "public", tags: ["フリーランス", "見積書", "経理"], likeCount: 108, saveCount: 59, forkCount: 28,
  },
  {
    userId: "sample", title: "経費の仕分けルール作成",
    bodyMd: "# 経費の仕分けルール作成\n\n確定申告のたびに「これ何費？」と悩む問題を年度初めに解決。仕分けルール表を一発生成。\n\n## プロンプト\n\nあなたは個人事業主の税務に詳しいアシスタントです。\n以下の経費項目について、勘定科目の仕分けルール表を作成してください。\n\n【自分の職種】{例：フリーランスWebデザイナー}\n\n【仕分けに迷う経費リスト】\n{以下に箇条書きで列挙}\n- 自宅のインターネット回線費\n- カフェでの作業時の飲み物代\n- Adobe Creative Cloud月額\n- ChatGPT Plus月額\n- 打ち合わせの交通費\n- 業務関連の書籍\n- コワーキングスペース利用料\n\n【出力形式】\n| 経費項目 | 勘定科目 | 按分割合（該当する場合） | 備考 |\n|---------|---------|----------------------|------|\n\n【ルール】\n- 一般的なフリーランスの仕分け慣行に基づく\n- 判断が分かれるものは「※税理士に要確認」と注記する\n- 按分割合は一般的な目安を記載\n\n## 💡 使い方のコツ\n\nこのルール表を年度初めに1回作っておくと、1年間の経費処理が劇的に楽になる。",
    type: "template", visibility: "public", tags: ["フリーランス", "経費", "確定申告"], likeCount: 91, saveCount: 52, forkCount: 22,
  },
  {
    userId: "sample", title: "SNS投稿文の作成（フリーランス向け）",
    bodyMd: "# SNS投稿文の作成\n\nX（Twitter）投稿のネタ出し〜文面作成。テーマと切り口だけ決めれば3パターン生成。\n\n## プロンプト\n\nあなたはフリーランス向けのSNSマーケティングの専門家です。\n以下の条件でX（旧Twitter）の投稿文を3パターン作成してください。\n\n【入力情報】\n- テーマ：{例：プロンプトの書き方のコツ}\n- ターゲット：{例：AI初心者のフリーランス}\n- トーン：{実践的・具体的 / 共感を呼ぶ / 質問形式}\n- 含めたいキーワード：{例：プロンプト、ChatGPT}\n- 宣伝要素：{なし / さりげなく / 明確に}\n\n【ルール】\n- 各パターン280文字以内\n- 1投稿に1メッセージ（詰め込まない）\n- ハッシュタグは2〜3個\n- 「いいね」ではなく「保存」されるような有用性を意識する\n- 改行を使って読みやすく\n\n## 💡 使い方のコツ\n\n3パターン出してもらい、一番しっくり来るものを選んで自分の言葉で微調整する。",
    type: "template", visibility: "public", tags: ["フリーランス", "SNS", "マーケティング"], likeCount: 87, saveCount: 48, forkCount: 24,
  },
  {
    userId: "sample", title: "自己紹介・ポートフォリオ要約",
    bodyMd: "# 自己紹介・ポートフォリオ要約\n\nSNSプロフィール・提案書・Webサイト向けに3パターンの自己紹介文を一括生成。\n\n## プロンプト\n\nあなたはフリーランスのブランディング専門家です。\n以下の情報をもとに、自己紹介文を作成してください。\n\n【入力情報】\n- 名前：{例：田中太郎}\n- 職種：{例：フリーランスWebデザイナー}\n- 経歴の要約：{例：制作会社で5年勤務後、独立して3年目}\n- 得意分野：{例：コーポレートサイト、LP制作、UI/UXデザイン}\n- 実績：{例：制作実績80件以上、大手メーカー3社のサイトリニューアル}\n- 人柄・スタンス：{例：丁寧なヒアリングを大事にしている}\n\n【出力】\n以下の3パターンで作成：\n1. **SNSプロフィール用**（140文字以内）\n2. **提案書・ポートフォリオ冒頭用**（200〜300文字）\n3. **Webサイト「About」ページ用**（400〜500文字）\n\n【ルール】\n- 実績の数字を効果的に使う\n- 自慢ではなく「相手にとってのメリット」を軸にする\n- 硬すぎず、親しみやすいトーンで\n\n## 💡 使い方のコツ\n\n3パターン一気に作っておくと、場面に応じて使い分けられる。",
    type: "template", visibility: "public", tags: ["フリーランス", "自己紹介", "ブランディング"], likeCount: 76, saveCount: 43, forkCount: 19,
  },
  {
    userId: "sample", title: "単価交渉の事前シミュレーション",
    bodyMd: "# 単価交渉の事前シミュレーション\n\n値上げ交渉の根拠・想定反論・代替案をAIと壁打ちして事前に固める。\n\n## プロンプト\n\nあなたはフリーランスの単価交渉のコーチです。\n以下の状況で、クライアントへの単価改定の交渉戦略を一緒に考えてください。\n\n【現状】\n- 現在の単価：{例：月額30万円}\n- 希望単価：{例：月額38万円}\n- 契約期間：{例：1年半継続中}\n- 自分の貢献：{例：サイトリニューアル後、PVが2倍に増加}\n- クライアントとの関係：{例：良好。担当者と信頼関係がある}\n\n【出力してほしいこと】\n1. 値上げの根拠となるポイント3つ\n2. 想定される相手の反論と、それへの返答案\n3. 交渉メールの文面ドラフト（200〜300文字）\n4. 交渉がまとまらなかった場合の代替案\n\n【ルール】\n- 相手の立場も考慮した、Win-Winの提案にする\n- 感情的にならない、論理的な交渉術を意識\n- 値上げ幅の妥当性も率直にコメントする\n\n## 💡 使い方のコツ\n\n実際に送る前に、AIと2〜3ラウンドやり取りして交渉ロジックを磨く。",
    type: "template", visibility: "public", tags: ["フリーランス", "単価交渉", "キャリア"], likeCount: 103, saveCount: 57, forkCount: 26,
  },
  {
    userId: "sample", title: "週間タスクの優先度整理",
    bodyMd: "# 週間タスクの優先度整理\n\nやることが多すぎる月曜の朝に。タスクリストを優先度順に整理し、週間スケジュールに落とす。\n\n## プロンプト\n\nあなたはフリーランスの生産性コーチです。\n以下のタスクリストを優先度順に整理し、週間スケジュールを提案してください。\n\n【今週のタスクリスト】\n{以下に箇条書きで列挙}\n- {例：A社のデザイン修正（金曜納品）}\n- {例：B社への提案書作成}\n- {例：確定申告の領収書整理}\n- {例：ポートフォリオ更新}\n- {例：note記事の執筆}\n- {例：C社との打ち合わせ準備}\n\n【条件】\n- 稼働日：{例：月〜金、1日6時間}\n- 固定予定：{例：水曜14時 C社打ち合わせ}\n\n【出力形式】\n| 曜日 | 午前（3h） | 午後（3h） |\n|------|-----------|----------|\n\n【ルール】\n- 締め切りが近いものを優先\n- 集中力が必要な作業は午前に配置\n- 事務作業は午後の後半に\n- 「やらなくてもいいこと」があれば指摘する\n\n## 💡 使い方のコツ\n\n毎週月曜の朝にこのテンプレートにタスクを流し込む習慣を作ると、「何からやろう」と悩む時間がゼロになる。",
    type: "template", visibility: "public", tags: ["フリーランス", "タスク管理", "生産性"], likeCount: 118, saveCount: 65, forkCount: 33,
  },
];
