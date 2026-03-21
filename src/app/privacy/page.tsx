"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-14 mb-8">
        <button onClick={() => router.back()} className="text-[#1a1a1a] dark:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">プライバシーポリシー</h1>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 text-sm leading-relaxed text-[#404040] dark:text-[#9ca3af]">
        <p className="text-[10px] font-mono text-[#9ca3af] mb-6">最終更新日: 2026年3月21日</p>

        <p className="mb-4">
          本プライバシーポリシー（以下「本ポリシー」）は、PromptNotes（以下「本サービス」）におけるユーザー情報の取り扱いについて説明するものです。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">1. 収集する情報</h2>
        <p className="mb-2">本サービスでは、以下の情報を収集します。</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><span className="font-medium">アカウント情報</span> — OAuth認証を通じて取得するメールアドレス、表示名、プロフィール画像URL</li>
          <li><span className="font-medium">認証情報</span> — Google または GitHub のOAuthトークン（認証処理にのみ使用）</li>
          <li><span className="font-medium">プロンプトデータ</span> — ユーザーが作成・保存したプロンプトの内容、タグ、公開設定等</li>
          <li><span className="font-medium">利用データ</span> — アクセス日時、利用した機能等の基本的な利用状況</li>
        </ul>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">2. 情報の利用目的</h2>
        <p className="mb-2">収集した情報は、以下の目的で利用します。</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>ユーザー認証およびアカウント管理</li>
          <li>プロンプトの保存・同期・共有機能の提供</li>
          <li>本サービスの改善および新機能の開発</li>
          <li>不正利用の防止およびセキュリティの確保</li>
        </ul>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">3. 情報の共有</h2>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>ユーザーの個人情報を第三者に販売・提供することはありません。</li>
          <li>ユーザーが「公開」に設定したプロンプトは、他のユーザーに表示されます。</li>
          <li>AI Review機能を使用する場合、プロンプトの内容がユーザーが設定したAIプロバイダー（OpenAI または Anthropic）のAPIに送信されます。APIキーはユーザー自身が管理し、サーバーには保存されません。</li>
          <li>法令に基づく開示要求があった場合、必要な範囲で情報を開示することがあります。</li>
        </ul>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">4. データの保存</h2>
        <p className="mb-4">
          ユーザーのデータは、以下のサービスを利用して保存・処理されます。
        </p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><span className="font-medium">Supabase</span> — ユーザー認証情報およびプロンプトデータの保存</li>
          <li><span className="font-medium">Vercel</span> — アプリケーションのホスティング</li>
        </ul>
        <p className="mb-4">
          これらのサービスはそれぞれのプライバシーポリシーおよびセキュリティ基準に従ってデータを管理しています。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">5. Cookieおよびローカルストレージ</h2>
        <p className="mb-4">
          本サービスでは、認証状態の維持やユーザー設定（ダークモード、AIプロバイダー設定等）の保存にCookieおよびブラウザのローカルストレージを使用します。これらはサービスの正常な動作に必要なものであり、トラッキング目的では使用しません。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">6. ユーザーの権利</h2>
        <p className="mb-2">ユーザーは以下の権利を有します。</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>自身のデータの閲覧およびエクスポート（設定画面のExport機能）</li>
          <li>自身のデータの削除の要求</li>
          <li>アカウントの削除の要求</li>
        </ul>
        <p className="mb-4">
          データの削除をご希望の場合は、下記の問い合わせ先までご連絡ください。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">7. ポリシーの変更</h2>
        <p className="mb-4">
          本ポリシーは、必要に応じて変更することがあります。重要な変更がある場合は、本サービス上で通知します。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">8. お問い合わせ</h2>
        <p className="mb-4">
          本ポリシーに関するご質問やデータ削除のご要望は、本サービスのGitHubリポジトリのIssueまたはメールにてお問い合わせください。
        </p>
      </div>
    </div>
  );
}
