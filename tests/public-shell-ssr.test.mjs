// 実際のAppShellをSSRし、認証確定前にも共有本文がHTMLへ残ることを確認する。
import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname } from 'node:path';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime.js';

// Next.jsの別名とTSXを実行時に解決し、コンポーネント自体は置き換えない。
registerHooks({
  resolve(specifier, context, nextResolve) {
    let candidate;
    if (specifier.startsWith('@/')) candidate = new URL(`../src/${specifier.slice(2)}`, import.meta.url);
    else if (specifier.startsWith('.') && /\.tsx?$/.test(context.parentURL ?? '') && !extname(specifier)) candidate = new URL(specifier, context.parentURL);
    if (candidate) {
      for (const extension of ['.ts', '.tsx']) {
        const target = new URL(`${candidate.href}${extension}`);
        if (existsSync(fileURLToPath(target))) return nextResolve(target.href, context);
      }
    }
    if (specifier === 'next/navigation' || specifier === 'next/link') return nextResolve(`${specifier}.js`, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.tsx')) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
      return { format: 'module', source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

// AuthProviderを起動しないため通信は行わず、既定の認証確認中の状態を使う。
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-only-anonymous-key';
const { AppShell } = await import('../src/components/AppShell.tsx');

test('認証確認中でもLPと共有ページのSSR本文を外枠が消さない', () => {
  for (const pathname of ['/', '/p/public-prompt']) {
    const html = renderToStaticMarkup(createElement(PathnameContext.Provider, { value: pathname }, createElement(AppShell, null, createElement('article', null, '公開ページの本文'))));
    assert.ok(html.includes('<article>公開ページの本文</article>'), `${pathname}の本文がSSRで消えた`);
    assert.equal(html.includes('aria-busy="true"'), false);
  }
});
