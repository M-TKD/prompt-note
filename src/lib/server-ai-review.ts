import { getDemoResponse } from "./ai-review-result";

// サーバーキー利用の境界を一か所で検証するための依存関係。
interface ServerReviewDependencies {
  authenticate: (token: string) => Promise<string | null>;
  getMonthlyUsage: (userId: string) => Promise<number>;
  recordUsage: (userId: string) => Promise<void>;
  reviewers: {
    groq?: (bodyMd: string) => Promise<Response>;
    anthropic?: (bodyMd: string) => Promise<Response>;
  };
}

export async function runServerAIReview(
  bodyMd: string,
  accessToken: unknown,
  dependencies: ServerReviewDependencies,
): Promise<Response> {
  // 自前APIキー以外は、providerの構成にかかわらず同じ認証・上限を通す。
  const userId = typeof accessToken === "string" && accessToken
    ? await dependencies.authenticate(accessToken)
    : null;
  if (!userId) return Response.json(getDemoResponse());

  const review = dependencies.reviewers.groq || dependencies.reviewers.anthropic;
  if (!review) return Response.json(getDemoResponse());

  const usage = await dependencies.getMonthlyUsage(userId);
  const limit = 10;
  if (usage >= limit) {
    return Response.json({
      error: "free_limit_reached",
      message: "今月の無料AI評価（10回）を使い切りました。自分のAPIキーを設定すると、そのAPIの利用条件で評価できます。",
      usage,
      limit,
    }, { status: 429 });
  }

  const result = await review(bodyMd);
  if (result.status !== 200) return result;
  await dependencies.recordUsage(userId);
  const data = await result.json();
  return Response.json({ ...data, _usage: { used: usage + 1, limit } });
}
