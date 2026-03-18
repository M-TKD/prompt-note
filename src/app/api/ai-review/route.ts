import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `あなたはプロンプトエンジニアリングの専門家です。
ユーザーが書いたAI向けプロンプトを以下の5つの軸で評価し、改善版を提案してください。

## 評価軸（各A〜Dで評価）
1. **明確性** (clarity): 意図や目的が明確に伝わるか
2. **具体性** (specificity): 具体的な条件、数値、例が含まれているか
3. **構造** (structure): 見出し・箇条書き・セクション分けなど整理された構成か
4. **コンテキスト** (context): 背景情報、役割設定、前提条件が十分か
5. **制約条件** (constraints): 出力形式、文字数、トーン、言語などの制限が明示されているか

## 評価基準
- A: 非常に良い。改善の余地がほとんどない
- B: 良い。小さな改善点がある
- C: 普通。明確な改善点がある
- D: 改善が必要。重要な要素が欠けている

## 回答形式（厳密にこのJSON形式で返してください。JSONのみ出力し、前後に余計なテキストを含めないでください）
{
  "scores": {
    "clarity": { "grade": "A", "feedback": "..." },
    "specificity": { "grade": "B", "feedback": "..." },
    "structure": { "grade": "A", "feedback": "..." },
    "context": { "grade": "C", "feedback": "..." },
    "constraints": { "grade": "B", "feedback": "..." }
  },
  "overall": "B",
  "suggestionMd": "改善版のプロンプト全文（Markdown形式）"
}

feedbackは各20文字以内で簡潔に。suggestionMdは元のプロンプトを改善した完全版を出力してください。`;

export async function POST(req: NextRequest) {
  try {
    const { bodyMd } = await req.json();

    if (!bodyMd || bodyMd.trim().length === 0) {
      return NextResponse.json({ error: "空のプロンプトです" }, { status: 400 });
    }

    // If no API key, return a demo response
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(getDemoResponse());
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: `以下のプロンプトを評価・改善してください:\n\n${bodyMd}` },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", await response.text());
      return NextResponse.json({ error: "AI添削に失敗しました" }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AIの応答を解析できませんでした" }, { status: 502 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Demo response for when no API key is configured
function getDemoResponse() {
  return {
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

## 具体的な指示
1. [ステップ1]
2. [ステップ2]
3. [ステップ3]

---
*💡 ヒント: APIキーを設定すると、AIが実際にプロンプトを分析・改善します*`,
  };
}
