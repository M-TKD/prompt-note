"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-14 mb-8">
        <button onClick={() => router.back()} className="text-[#1a1a1a] dark:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">利用規約</h1>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 text-sm leading-relaxed text-[#404040] dark:text-[#9ca3af]">
        <p className="text-[10px] font-mono text-[#9ca3af] mb-6">最終更新日: 2026年3月21日</p>

        <p className="mb-4">
          本利用規約（以下「本規約」）は、PromptNotes（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただく前に、本規約をよくお読みください。本サービスを利用することで、本規約に同意したものとみなされます。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">1. サービスの説明</h2>
        <p className="mb-4">
          PromptNotesは、AIプロンプトの作成・保存・管理・共有を目的としたWebアプリケーションです。ユーザーはプロンプトをMarkdown形式で作成・編集し、タグ付けによる整理、他ユーザーへの公開、AI Reviewによるプロンプトの改善提案などの機能をご利用いただけます。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">2. アカウント</h2>
        <p className="mb-4">
          本サービスの一部機能を利用するには、GoogleアカウントまたはGitHubアカウントによる認証（OAuth）が必要です。ユーザーは自身のアカウント情報を適切に管理する責任を負い、第三者による不正利用が発生した場合は速やかにご連絡ください。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">3. ユーザーの責任</h2>
        <p className="mb-2">本サービスの利用にあたり、以下の行為を禁止します。</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>法令に違反するコンテンツの投稿・共有</li>
          <li>第三者の著作権、商標権その他の知的財産権を侵害する行為</li>
          <li>他のユーザーへの嫌がらせ、誹謗中傷</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>不正アクセスやリバースエンジニアリング</li>
        </ul>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">4. 知的財産権</h2>
        <p className="mb-4">
          ユーザーが本サービス上で作成したプロンプトおよびコンテンツの知的財産権は、ユーザー自身に帰属します。ただし、ユーザーが「公開」設定にしたプロンプトについては、他のユーザーが閲覧・参照できることに同意するものとします。本サービスのUI、デザイン、ロゴ等の知的財産権は運営者に帰属します。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">5. 免責事項</h2>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>本サービスは「現状のまま」提供されます。明示または黙示を問わず、いかなる保証も行いません。</li>
          <li>AI Review機能による分析結果・改善提案の正確性、完全性、有用性について保証しません。AI Reviewの結果はあくまで参考情報としてご利用ください。</li>
          <li>本サービスの利用によって生じたいかなる損害についても、運営者は責任を負いません。</li>
          <li>データの消失や破損について、運営者は責任を負いません。重要なデータはバックアップをお取りください。</li>
        </ul>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">6. サービスの変更・終了</h2>
        <p className="mb-4">
          運営者は、事前の通知なく本サービスの内容を変更、または本サービスの提供を一時停止もしくは終了することがあります。サービスの変更・終了によりユーザーに生じた損害について、運営者は責任を負いません。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">7. 規約の変更</h2>
        <p className="mb-4">
          運営者は、必要に応じて本規約を変更することがあります。変更後の規約は、本サービス上に掲載された時点で効力を生じるものとします。
        </p>

        <h2 className="font-bold text-base mb-2 mt-6 text-[#1a1a1a] dark:text-white">8. 準拠法・管轄</h2>
        <p className="mb-4">
          本規約は日本法に準拠し、日本法に従って解釈されるものとします。本規約に関連する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </div>
    </div>
  );
}
