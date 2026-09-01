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

#### v0.6.0 プロンプトライブラリ再構成で学んだこと
- **テンプレート変数の記法は必ず `{{二重波括弧}}`** — `{例：…}` の一重波括弧は `extractVariables()` に拾われず、Variables シートが機能しない。フリーランス系10本がこの状態で放置されていた
- **公式ライブラリを localStorage に複製しない** — 旧 `ensureSeedData()` はサンプルをローカルにコピーしていたため、ライブラリを更新しても既存ユーザーには古い内容が残り続けた。定数から毎回描画し、旧コピーは掃除する
- **Explore の公式プロンプトは DB に実体が無い** — `fork(id)` は id 検索なので `sample-N` では引けず、Fork ボタンが無反応だった。中身を `create()` でコピーする
- **絞り込んでから index で id を振らない** — カテゴリで filter した後に `sample-${i}` を振ると、カテゴリを変えるたび id がずれて「いいね」が別の記事に付く

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

### 主要ファイル
- `src/lib/prompt-library.ts` — 公式プロンプトライブラリ。入門5 / 初級15 / 中級21 / 上級11 の4段階（`STARTER_PROMPTS` / `BASIC_PROMPTS` / `INTERMEDIATE_PROMPTS` / `ADVANCED_PROMPTS`）と `PROMPT_TIPS`
- `src/lib/learn.ts` — はじめかたガイドの中身。`LEARNING_PATH`（ロードマップ）/ `AI_USE_CASES`（できること集）/ `MCP_SERVERS`（MCP集）。プロンプトの参照は title 完全一致で `/feed?q=` に渡す
- `src/lib/personalization.ts` — 個人設定。職種・文体などを localStorage に保存し、`{{私の職種}}` 等の自動補完と「私について」ブロックの生成を行う
- `src/lib/types.ts` — 型定義と `extractVariables` / `fillTemplate`

### 現在のバージョン: v0.7.0
