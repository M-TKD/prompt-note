// 実際の保存・分類・コピー結果を確認するための回帰テスト。
import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';

// Next.js用の拡張子なしTS importを、NodeのネイティブTS実行でも解決する。
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !extname(specifier) && context.parentURL?.endsWith('.ts')) {
      return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const samples = await import('../src/lib/official-templates.ts');
const reviews = await import('../src/lib/ai-review-result.ts');
const { store } = await import('../src/lib/store.ts');
const { SAMPLE_PROMPTS } = await import('../src/lib/types.ts');

// フィルター後の採番へ戻ると、同じIDが別の本文を指すため失敗する。
test('カテゴリを変えても公式テンプレートのIDと本文が一致する', () => {
  const all = samples.getOfficialTemplates();
  const development = samples.getOfficialTemplates('開発');
  assert.ok(development.length > 0);
  for (const doc of development) {
    const originalIndex = SAMPLE_PROMPTS.findIndex(sample => sample.title === doc.title);
    assert.equal(doc.id, `sample-${originalIndex}`);
    assert.equal(all.find(item => item.id === doc.id).bodyMd, doc.bodyMd);
    assert.equal(doc.createdAt, '');
    assert.equal(doc.likeCount, 0);
  }
});

// サンプルIDを永続ストアへ問い合わせる実装では、複製に失敗する。
test('未保存の公式テンプレートを本文から非公開で複製し、既存データを保つ', async () => {
  const data = new Map();
  global.window = {};
  global.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const existing = store.create({ userId: 'local', title: '既存', bodyMd: '既存の本文', type: 'prompt', visibility: 'private', tags: [] });
  const sample = samples.getOfficialTemplates('開発')[0];
  const copy = await samples.duplicateOfficialTemplate(sample, doc => store.create(doc));
  assert.equal(copy.visibility, 'private');
  assert.equal(copy.bodyMd, sample.bodyMd);
  assert.notEqual(copy.id, sample.id);
  assert.equal(copy.forkedFromId, undefined);
  assert.equal(store.getDocument(existing.id).bodyMd, '既存の本文');
  assert.equal(store.getDocuments().length, 2);
  store.ensureSeedData();
  assert.equal(store.getDocuments().length, 2);
  assert.equal(JSON.parse(data.get('promptnote_documents')).length, 2);
});

// Clipboardが拒否したのに成功扱いすると、この結果が逆転して失敗する。
test('コピーは非同期処理の完了を待ち、権限拒否を失敗として返す', async () => {
  let resolve;
  let completed = false;
  const result = samples.copyPromptText('本文', { writeText: () => new Promise(done => { resolve = done; }) }).then(value => { completed = true; return value; });
  await Promise.resolve();
  assert.equal(completed, false);
  resolve();
  assert.equal(await result, true);
  assert.equal(await samples.copyPromptText('本文', { writeText: async () => { throw new Error('denied'); } }), false);
  assert.equal(await samples.copyPromptText('本文', undefined), false);
});

// デモの固定案を通常の編集本文へ渡せるようにすると失敗する。
test('固定AI応答をデモとして識別し、適用できる提案から除外する', () => {
  const demo = reviews.getDemoResponse();
  assert.equal(demo._demo, true);
  assert.equal(reviews.getApplicableSuggestion(demo), null);
  assert.equal(reviews.getApplicableSuggestion({ suggestionMd: '実分析の改善案' }), '実分析の改善案');
});
