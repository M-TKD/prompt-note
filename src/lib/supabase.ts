import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 環境変数が無い環境（プレビュー等）でビルド全体を落とさないためのフォールバック。
  // 実際の通信はローカル宛になるため外部には出ず、ログで設定漏れに気づける。
  console.warn(
    "Supabase の環境変数が設定されていません。ログインとクラウド同期は利用できません。"
  );
}

export const supabase = createClient(
  supabaseUrl || "http://localhost:54321",
  supabaseAnonKey || "public-anon-key-not-configured"
);
