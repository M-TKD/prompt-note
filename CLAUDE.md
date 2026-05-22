# PromptNotes - プロジェクトメモリー

## 開発プロセスルール

### 次のタスクに進む前に必ずやること
1. **チーム打ち合わせ** — 次に実装すべき内容をチームで議論・優先順位を決める
2. **前タスクの振り返り（レトロスペクティブ）** — 何がうまくいったか、何が問題だったか
3. **ミスの改善策をメモリー** — 同じミスを繰り返さないよう学びを記録

### 過去の学び（ミス防止）

#### v0.4.0 Supabase DB移行で学んだこと
- **Supabase SQL Editorで実行しただけでは不十分な場合がある** — テーブルが作られても GRANT が正しく適用されないことがある。必ず service_role key でアクセス確認すること
- **service_role にも明示的に GRANT が必要** — `GRANT ALL ON ... TO authenticated` だけでなく `TO service_role` も必要
- **Supabase の site_url はデフォルトで localhost:3000** — 本番デプロイ時に必ず本番URLに変更すること（Management API: PATCH /v1/projects/{ref}/config/auth）
- **Pooler接続が "Tenant or user not found" の場合** — DBパスワードが間違っているか、Pooler未設定。Management API（access token）経由でSQL実行が確実
- **Management API が最も信頼できるDB操作方法** — `POST https://api.supabase.com/v1/projects/{ref}/database/query` + Supabase access token
- **テーブル構造はコードと一致させること** — 先にスキーマを定義してからコードを書く、またはコードに合わせてスキーマを作る。二重管理は事故の元

#### v0.4.1 Markdownビューワー強化で学んだこと
- **依存を追加・変更したら必ず `next build` を実行する** — `tsc --noEmit` はバンドル段階の失敗を検出できない。`isomorphic-dompurify` に切り替えた際に `next build` を回さずプッシュし、Vercelビルドが2回失敗した
- **`isomorphic-dompurify` は使わない** — 内部で `jsdom` を取り込み、Next.js(Turbopack)ビルドで失敗する。`dompurify` はブラウザ専用なので、サニタイズはクライアント専用にする方式が安全：`import("dompurify")` を `useEffect` 内で動的importし、サーバーは `markdown-it` の `html: false` でHTMLをエスケープした安全な状態で出力する（サーバー側はサニタイザー不要）
- **`@types/*` は本体が型を同梱していれば不要** — `dompurify` v3 は型同梱済み。`@types/dompurify` を追加すると型が競合してビルドが壊れる。`node_modules/<pkg>/package.json` の `"types"` フィールドを先に確認する
- **ローカルでビルドが完走しない場合はダミーの `.env.local` を用意する** — 環境変数不足でビルドが途中終了すると、SSR/バンドル起因の不具合をVercelビルドで初めて発見することになる。ダミー値の `.env.local`（gitignore済み）で `next build` を最後まで通して検証する

#### 一般的な学び
- **ユーザーは非エンジニア** — 手動操作を最小限にし、可能な限り自動化する
- **ビルド確認は必ず行う** — コード変更後は `npx next build` でエラーチェック
- **複数ファイルの並行編集はAgentを活用** — 効率的に進められる

## プロジェクト情報

### 認証情報
- **認証情報は `.env.local` に管理** — CLAUDE.md にトークン等を直接記載しない
- Supabase Project Ref: `yslvwdphqpusgyfuzhzh`
- Production URL: `https://prompt-note-red.vercel.app`
- GitHub Repo: `https://github.com/M-TKD/prompt-note`
- その他のキー（Supabase URL, API Token, OAuth Client ID, Stripe等）は `.env.local` を参照

### 技術スタック
- Next.js 16.1.7 (Turbopack)
- Tailwind CSS v4 (`@custom-variant dark`)
- Supabase Auth + Database
- Vercel (auto-deploy from GitHub)
- Design: モノクロ + アクセント #4F46E5 (indigo)

### 現在のバージョン: v0.4.1
