import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runServerAIReview } from "@/lib/server-ai-review";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

// -----------------------------------------------
// Get monthly usage count for a user
// -----------------------------------------------
async function getMonthlyUsage(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabaseAdmin
    .from("ai_review_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("used_at", startOfMonth);

  if (error) {
    console.error("Usage count error:", error);
    return 0;
  }
  return count || 0;
}

// -----------------------------------------------
// Record usage
// -----------------------------------------------
async function recordUsage(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("ai_review_usage")
    .insert({ user_id: userId });

  if (error) {
    console.error("Record usage error:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bodyMd, provider, apiKey, accessToken } = await req.json();

    if (!bodyMd || bodyMd.trim().length === 0) {
      return NextResponse.json({ error: "空のプロンプトです" }, { status: 400 });
    }

    // 1. If user provided their own API key → no limits
    if (apiKey && provider) {
      if (provider === "openai") {
        return await callOpenAI(apiKey, bodyMd);
      } else if (provider === "anthropic") {
        return await callAnthropic(apiKey, bodyMd);
      }
    }

    // 自前キー以外のサーバー実行は、Groq・Anthropicとも共通ガードへ渡す。
    const groqKey = process.env.GROQ_API_KEY;
    const serverKey = process.env.ANTHROPIC_API_KEY;
    return await runServerAIReview(bodyMd, accessToken, {
      authenticate: async (token) => {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        return error ? null : user?.id || null;
      },
      getMonthlyUsage,
      recordUsage,
      reviewers: {
        groq: groqKey ? (body) => callGroq(groqKey, body) : undefined,
        anthropic: serverKey ? (body) => callAnthropic(serverKey, body) : undefined,
      },
    });
  } catch (error) {
    console.error("AI review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// -----------------------------------------------
// Groq (Llama 3.3 70B - free tier)
// -----------------------------------------------
async function callGroq(apiKey: string, bodyMd: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `以下のプロンプトを評価・改善してください:\n\n${bodyMd}` },
      ],
      max_tokens: 2048,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq API error:", errText);
    if (response.status === 429) {
      return NextResponse.json({ error: "AI Review の利用制限に達しました。しばらくしてからお試しください。" }, { status: 429 });
    }
    if (response.status === 401) {
      return NextResponse.json({ error: "サーバーのAPIキー設定に問題があります" }, { status: 502 });
    }
    return NextResponse.json({ error: "AI添削に失敗しました" }, { status: 502 });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    console.error("Groq: no text in response", JSON.stringify(data));
    return NextResponse.json({ error: "AIの応答を解析できませんでした" }, { status: 502 });
  }
  return parseAndReturn(text);
}

// -----------------------------------------------
// OpenAI (user's own key)
// -----------------------------------------------
async function callOpenAI(apiKey: string, bodyMd: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `以下のプロンプトを評価・改善してください:\n\n${bodyMd}` },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI API error:", errText);
    if (response.status === 401) {
      return NextResponse.json({ error: "APIキーが無効です。Settingsで確認してください。" }, { status: 401 });
    }
    return NextResponse.json({ error: "AI添削に失敗しました" }, { status: 502 });
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  return parseAndReturn(text);
}

// -----------------------------------------------
// Anthropic (user's own key or server key)
// -----------------------------------------------
async function callAnthropic(apiKey: string, bodyMd: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
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
    const errText = await response.text();
    console.error("Anthropic API error:", errText);
    if (response.status === 401) {
      return NextResponse.json({ error: "APIキーが無効です。Settingsで確認してください。" }, { status: 401 });
    }
    return NextResponse.json({ error: "AI添削に失敗しました" }, { status: 502 });
  }

  const data = await response.json();
  const text = data.content[0].text;
  return parseAndReturn(text);
}

// -----------------------------------------------
// Response parser
// -----------------------------------------------
function parseAndReturn(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "AIの応答を解析できませんでした" }, { status: 502 });
  }
  try {
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AIの応答を解析できませんでした" }, { status: 502 });
  }
}
