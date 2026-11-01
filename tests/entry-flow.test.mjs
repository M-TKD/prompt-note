import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEntrySurface, initialAuthMode } from '../src/lib/entry-flow.ts';

// ゲスト体験をLPへ戻す分岐に戻ると、この回帰確認が失敗する。
test('未ログインでもノート画面は作業画面へ進める', () => {
  assert.equal(resolveEntrySurface('/notes', false, false), 'workspace');
  assert.equal(resolveEntrySurface('/', false, false), 'landing');
});

// 私有ノートは認証判定前に読み込まず、認証済みのホーム経路も維持する。
test('認証判定中はノート内容を表示せず既存ユーザーのホームを保つ', () => {
  assert.equal(resolveEntrySurface('/notes', true, false), 'loading');
  assert.equal(resolveEntrySurface('/', false, true), 'workspace');
});

test('登録URLの指定だけが新規登録を開き通常URLはログインを開く', () => {
  assert.equal(initialAuthMode('signup'), 'signup');
  assert.equal(initialAuthMode(null), 'signin');
  assert.equal(initialAuthMode('unexpected'), 'signin');
});

test('認証と法務ページは認証状態によらず紹介用の枠を使う', () => {
  for (const path of ['/auth', '/terms', '/privacy', '/howto']) {
    assert.equal(resolveEntrySurface(path, true, false), 'public');
    assert.equal(resolveEntrySurface(path, false, true), 'public');
  }
});

// 認証が未確定のSSRでも、紹介と共有本文を読み込み表示で隠さない。
test('公開入口は認証待ちでも本文を表示し認証済みだけホームを切り替える', () => {
  assert.equal(resolveEntrySurface('/', true, false), 'landing');
  assert.equal(resolveEntrySurface('/', true, true), 'landing');
  assert.equal(resolveEntrySurface('/', false, true), 'workspace');
  assert.equal(resolveEntrySurface('/p/public-prompt', true, false), 'public');
  assert.equal(resolveEntrySurface('/p/public-prompt', false, true), 'public');
  for (const path of ['/notes', '/editor', '/search', '/collections', '/profile', '/settings', '/trash']) {
    assert.equal(resolveEntrySurface(path, true, false), 'loading');
  }
});
