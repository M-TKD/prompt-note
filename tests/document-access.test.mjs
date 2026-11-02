import test from 'node:test';
import assert from 'node:assert/strict';
import { canSharePublicDocument, getSavedVisibility } from '../src/lib/document-access.ts';

// 端末内だけの保存を、サーバーに存在する公開URLとして扱わない。
test('ゲストの公開設定は非公開で保存し、共有URLを作らない', () => {
  assert.equal(getSavedVisibility(false, false, 'public'), 'private');
  assert.equal(canSharePublicDocument(false, 'public', 'local-id'), false);
});

test('クラウド保存済みの公開指示だけが共有でき、メモと未保存データは除外する', () => {
  assert.equal(getSavedVisibility(true, false, 'public'), 'public');
  assert.equal(getSavedVisibility(true, true, 'public'), 'private');
  assert.equal(canSharePublicDocument(true, 'public', 'cloud-id'), true);
  assert.equal(canSharePublicDocument(true, 'private', 'cloud-id'), false);
  assert.equal(canSharePublicDocument(true, 'public', null), false);
  assert.equal(canSharePublicDocument(true, 'public', 'sample-0'), false);
});
