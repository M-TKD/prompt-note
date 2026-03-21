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

#### 一般的な学び
- **ユーザーは非エンジニア** — 手動操作を最小限にし、可能な限り自動化する
- **ビルド確認は必ず行う** — コード変更後は `npx next build` でエラーチェック
- **複数ファイルの並行編集はAgentを活用** — 効率的に進められる

## プロジェクト情報

### 認証情報（参照用）
- Supabase Project Ref: `yslvwdphqpusgyfuzhzh`
- Supabase URL: `https://yslvwdphqpusgyfuzhzh.supabase.co`
- Management API Token: `sbp_599e8eaba232725217d6939ef946e94d52f06e22`
- GitHub OAuth Client ID: `Ov23liESfU1dPa08QCE7`
- Google OAuth Client ID: `846280936842-8gsn3plcb2qatdqca34rcped42gsclp1.apps.googleusercontent.com`
- Production URL: `https://prompt-note-red.vercel.app`
- GitHub Repo: `https://github.com/M-TKD/prompt-note`

### 技術スタック
- Next.js 16.1.7 (Turbopack)
- Tailwind CSS v4 (`@custom-variant dark`)
- Supabase Auth + Database
- Vercel (auto-deploy from GitHub)
- Design: モノクロ + アクセント #4F46E5 (indigo)

### 現在のバージョン: v0.4.1
