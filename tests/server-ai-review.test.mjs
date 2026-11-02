import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';

// Next.js用の拡張子なしTS importをNodeでも解決する。
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !extname(specifier) && context.parentURL?.endsWith('.ts')) {
      return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const { runServerAIReview } = await import('../src/lib/server-ai-review.ts');

// Groqのない構成でも、ゲストや不正な認証情報がサーバーキーに到達してはならない。
test('未ログイン・不正token・異なる型のtokenはAnthropic fallbackも固定見本になる', async () => {
  for (const token of [undefined, '', 'invalid-token', { access_token: 'invalid-token' }]) {
    let invoked = 0;
    let recorded = 0;
    const response = await runServerAIReview('私の本文', token, {
      authenticate: async () => null,
      getMonthlyUsage: async () => 0,
      recordUsage: async () => { recorded++; },
      reviewers: { anthropic: async () => { invoked++; return Response.json({ suggestionMd: '実分析' }); } },
    });
    assert.equal((await response.json())._demo, true);
    assert.equal(invoked, 0);
    assert.equal(recorded, 0);
  }
});

// 片方のproviderだけ上限処理を迂回する変更を検出する。
test('GroqとAnthropicのどちらも月10回で止まり、外部評価を実行しない', async () => {
  for (const provider of ['groq', 'anthropic']) {
    let invoked = 0;
    const response = await runServerAIReview('本文', 'valid-token', {
      authenticate: async () => 'user-1',
      getMonthlyUsage: async () => 10,
      recordUsage: async () => { throw new Error('上限時に記録してはいけない'); },
      reviewers: { [provider]: async () => { invoked++; return Response.json({ suggestionMd: '実分析' }); } },
    });
    assert.equal(response.status, 429);
    const result = await response.json();
    assert.equal(result.error, 'free_limit_reached');
    assert.equal(result.usage, 10);
    assert.equal(result.limit, 10);
    assert.equal(invoked, 0);
  }
});

// 認証済みの正規利用を維持し、両providerの成功だけ同じ利用台帳へ記録する。
test('両providerとも認証を一度だけ検証し、成功した評価を本人の利用回数へ記録する', async () => {
  for (const provider of ['groq', 'anthropic']) {
    let authentications = 0;
    const recorded = [];
    const response = await runServerAIReview('元の本文', 'valid-token', {
      authenticate: async token => { assert.equal(token, 'valid-token'); authentications++; return 'user-1'; },
      getMonthlyUsage: async userId => { assert.equal(userId, 'user-1'); return 9; },
      recordUsage: async userId => { recorded.push(userId); },
      reviewers: { [provider]: async body => { assert.equal(body, '元の本文'); return Response.json({ suggestionMd: '実分析の改善案' }); } },
    });
    assert.equal(authentications, 1);
    assert.deepEqual(recorded, ['user-1']);
    assert.deepEqual(await response.json(), { suggestionMd: '実分析の改善案', _usage: { used: 10, limit: 10 } });
  }
});

test('providerエラーはそのまま返し、成功回数には含めない', async () => {
  const response = await runServerAIReview('本文', 'valid-token', {
    authenticate: async () => 'user-1',
    getMonthlyUsage: async () => 3,
    recordUsage: async () => { throw new Error('失敗時に記録してはいけない'); },
    reviewers: { anthropic: async () => Response.json({ error: 'provider-failed' }, { status: 502 }) },
  });
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: 'provider-failed' });
});

// fallback追加後も、従来のGroq優先と未設定時の見本を維持する。
test('両provider設定時はGroqを優先し、未設定なら無料回数を消費しない', async () => {
  const common = {
    authenticate: async () => 'user-1',
    getMonthlyUsage: async () => 2,
    recordUsage: async () => {},
  };
  const response = await runServerAIReview('本文', 'valid-token', {
    ...common,
    reviewers: {
      groq: async () => Response.json({ suggestionMd: 'Groqの評価' }),
      anthropic: async () => { throw new Error('Groq設定時はfallbackを実行してはいけない'); },
    },
  });
  assert.equal((await response.json()).suggestionMd, 'Groqの評価');
  const demo = await runServerAIReview('本文', 'valid-token', {
    ...common,
    getMonthlyUsage: async () => { throw new Error('未設定時に無料回数を照会してはいけない'); },
    recordUsage: async () => { throw new Error('未設定時に無料回数を記録してはいけない'); },
    reviewers: {},
  });
  assert.equal((await demo.json())._demo, true);
});
