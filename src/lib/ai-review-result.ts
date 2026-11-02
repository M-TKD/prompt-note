// 入力を分析していない固定の見本には必ずデモ識別子を付ける。
export function getDemoResponse() {
  return {
    _demo: true as const,
    scores: {
      clarity: { grade: "B", feedback: "意図は明確だが、もう少し具体化できる" },
      specificity: { grade: "C", feedback: "具体的な条件や例が不足している" },
      structure: { grade: "B", feedback: "基本的な構造はあるが改善の余地あり" },
      context: { grade: "C", feedback: "背景情報を追加するとより良い" },
      constraints: { grade: "D", feedback: "出力形式や制限を明示すべき" },
    },
    overall: "C",
    suggestionMd: `# 改善版プロンプト

## 役割
あなたは[具体的な専門家の役割]です。

## タスク
以下の内容について[具体的なアクション]を行ってください。

## 条件
- 出力形式: [Markdown / 箇条書き / テーブル等]
- 文字数: [目安の文字数]
- トーン: [カジュアル / フォーマル等]

## コンテキスト
[背景情報や前提条件をここに記載]

---
*これは入力した本文を分析した結果ではありません。*`,
  };
}

// デモを編集本文へ適用すると通常の保存対象になるため、この境界で遮断する。
export function getApplicableSuggestion(result: { _demo?: boolean; suggestionMd?: string }): string | null {
  return result._demo ? null : result.suggestionMd || null;
}
