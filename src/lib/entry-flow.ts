// 入口の分岐を一か所に集め、画面と外枠の判断を揃える。
export function resolveEntrySurface(pathname: string, authLoading: boolean, hasUser: boolean): 'loading' | 'landing' | 'workspace' | 'public' {
  // 紹介と共有本文は認証確認を待たずSSRにも残す。
  if (['/auth', '/terms', '/privacy', '/howto'].includes(pathname) || pathname.startsWith('/p/')) return 'public';
  if (pathname === '/') return !authLoading && hasUser ? 'workspace' : 'landing';
  // 私有データを扱う画面だけは、保存先が確定するまで待つ。
  if (authLoading) return 'loading';
  return 'workspace';
}

// 認証フォームの初期状態をURLの指定から決める。
export function initialAuthMode(mode: string | null): 'signin' | 'signup' {
  return mode === 'signup' ? 'signup' : 'signin';
}
