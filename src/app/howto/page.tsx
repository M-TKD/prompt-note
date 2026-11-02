"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, ArrowUpCircle, WandSparkles, Send, Globe, GitFork, Upload, Pin, Key, Variable, Download, Share2, Moon } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "メモを書く",
    description: "「新規作成」または下部の＋からメモを開き、タイトルと本文を入力して「保存」を押します。「編集」で書き、「プレビュー」で見え方を確認できます。Markdownにも対応しています。",
    icon: <Plus className="w-4 h-4" />,
    accent: false,
  },
  {
    number: "02",
    title: "AI用に整える",
    description: "保存したメモをAIで使いたくなったら「AI用に整える」を選びます。指示文はPrompt、条件を差し替えて使うものはTemplateにできます。",
    icon: <ArrowUpCircle className="w-4 h-4" />,
    accent: true,
  },
  {
    number: "03",
    title: "必要に応じて、AIで指示を見直す",
    description: "「AI評価」（AI Review）では、明確さ・具体性・構成・背景情報・制約の5つの観点で改善のヒントを確認できます。無料アカウントで月10回まで利用でき、自分のAPIキーの設定は任意です。登録なしで表示されるデモは固定の見本で、入力内容の評価ではありません。",
    icon: <WandSparkles className="w-4 h-4" />,
    accent: false,
  },
  {
    number: "04",
    title: "コピーして、いつものAIで使う",
    description: "「AIで使う」からChatGPTやClaudeなどを選ぶと、指示をコピーしてAIのページを開きます。開いた先の入力欄に貼り付けて、送信してください。自動では送信されません。",
    icon: <Send className="w-4 h-4" />,
    accent: true,
  },
  {
    number: "05",
    title: "公開して共有",
    description: "指示文は作成時には非公開です。共有したい場合だけ、公開設定に変更します。「見つける」ではテンプレートを探して、自分用にコピーできます。公開前に顧客名などの情報を確認してください。",
    icon: <Globe className="w-4 h-4" />,
    accent: false,
  },
];

const CONCEPTS = [
  {
    title: "メモ（Memo）",
    description: "アイデアや依頼文を残す非公開のメモです。作成中の下書きは自動で控えられますが、メモを残すときは「保存」を押してください。",
    indicator: "bg-[#e5e7eb]",
  },
  {
    title: "指示文（Prompt）",
    description: "AIに渡すための指示文です。AI評価や、コピーしてAIを開く機能を使えます。公開・共有も選べます。",
    indicator: "bg-[#4F46E5]",
  },
  {
    title: "テンプレート（Template）",
    description: "{{変数}}で相手やテーマなどを差し替えられる指示文です。「変数」から今回の条件を入力してコピーできます。",
    indicator: "bg-[#9ca3af]",
  },
];

const FEATURES = [
  { icon: <Upload className="w-3.5 h-3.5" />, title: "ファイルを読み込む", desc: ".md / .txt ファイルを読み込み" },
  { icon: <Download className="w-3.5 h-3.5" />, title: "ファイルで保存", desc: "Markdownファイルとしてダウンロード" },
  { icon: <Share2 className="w-3.5 h-3.5" />, title: "共有", desc: "端末の共有機能で本文やリンクを共有" },
  { icon: <Pin className="w-3.5 h-3.5" />, title: "ピン留め", desc: "よく使うメモを上部に固定" },
  { icon: <Variable className="w-3.5 h-3.5" />, title: "テンプレート変数", desc: "{{変数}} で穴埋め式テンプレート" },
  { icon: <Key className="w-3.5 h-3.5" />, title: "自分のAPIキー（任意）", desc: "OpenAI / AnthropicのキーでもAI評価が可能。利用料は各社の条件によります" },
  { icon: <Moon className="w-3.5 h-3.5" />, title: "ダークモード", desc: "アカウントの設定から切り替え" },
  { icon: <GitFork className="w-3.5 h-3.5" />, title: "自分用にコピー", desc: "見つけたテンプレートを自分の指示として保存" },
];

export default function HowToPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg md:max-w-3xl mx-auto px-6 pt-14 pb-8">
      {/* 作業画面へ戻る見出し */}
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.push("/notes")} aria-label="自分のメモに戻る" className="min-w-11 min-h-11 flex items-center justify-center text-[#6b7280] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">使い方</h1>
      </div>

      {/* 保存と再利用の考え方 */}
      <section className="mb-12">
        <p className="text-[10px] font-sans text-[#9ca3af] uppercase tracking-widest mb-4">保存して、また使う</p>
        <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-xl p-5">
          <p className="text-sm text-[#404040] dark:text-[#e5e7eb] leading-relaxed mb-4">
            Prompt Notesは、AIへの指示を保存して再利用するノートです。
            メールの返信や議事録の整理で使えた指示を残し、次は相手や内容を差し替えて使えます。
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#6b7280] flex-wrap py-3">
            <span className="px-2 py-1 bg-white dark:bg-[#333] border border-[#f0f0f0] dark:border-[#444] rounded">書く</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white dark:bg-[#333] border border-[#4F46E5]/20 rounded text-[#4F46E5]">差し替える</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white dark:bg-[#333] border border-[#f0f0f0] dark:border-[#444] rounded">コピー</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white dark:bg-[#333] border border-[#f0f0f0] dark:border-[#444] rounded">使う</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white dark:bg-[#333] border border-[#f0f0f0] dark:border-[#444] rounded">共有</span>
          </div>
        </div>
      </section>

      {/* メモの種類 */}
      <section className="mb-12">
        <p className="text-[10px] font-sans text-[#9ca3af] uppercase tracking-widest mb-4">3つの種類</p>
        <div className="space-y-2">
          {CONCEPTS.map((c) => (
            <div key={c.title} className="flex items-start gap-3 py-3 border-b border-[#f0f0f0] dark:border-[#333] last:border-0">
              <div className={`w-0.5 h-8 rounded-full mt-0.5 shrink-0 ${c.indicator}`} />
              <div>
                <p className="font-medium text-sm text-[#1a1a1a] dark:text-white">{c.title}</p>
                <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] mt-0.5">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 基本の手順 */}
      <section className="mb-12">
        <p className="text-[10px] font-sans text-[#9ca3af] uppercase tracking-widest mb-6">基本の手順</p>
        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.accent ? "bg-[#4F46E5] text-white" : "bg-[#f5f5f5] dark:bg-[#333] text-[#6b7280]"
                }`}>
                  {step.icon}
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-[#f0f0f0] dark:bg-[#333] mt-2" />}
              </div>
              <div className="pt-1">
                <p className="text-[10px] font-sans text-[#d1d5db] mb-0.5">{step.number}</p>
                <p className="font-medium text-sm text-[#1a1a1a] dark:text-white mb-1">{step.title}</p>
                <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 補助機能 */}
      <section className="mb-12">
        <p className="text-[10px] font-sans text-[#9ca3af] uppercase tracking-widest mb-4">ほかにできること</p>
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#6b7280]">{f.icon}</span>
                <p className="font-medium text-xs text-[#1a1a1a] dark:text-white">{f.title}</p>
              </div>
              <p className="text-xs text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 保存先と利用条件 */}
      <section className="mb-8">
        <p className="text-[10px] font-sans text-[#9ca3af] uppercase tracking-widest mb-4">覚えておきたいこと</p>
        <div className="space-y-3">
          <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">
              <span className="font-medium text-[#1a1a1a] dark:text-white">メモ帳としても使えます</span>
              — すべてをAIへの指示にする必要はありません。普段のメモ帳としても使えます。AIで使うときに「AI用に整える」を選んでください。
            </p>
          </div>
          <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">
              <span className="font-medium text-[#1a1a1a] dark:text-white">記号バーで素早く入力</span>
              {"— キーボードの上に # * _ ` < > などの記号バーがあります。Markdownの記号を1タップで入力できます。"}
            </p>
          </div>
          <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">
              <span className="font-medium text-[#1a1a1a] dark:text-white">{"テンプレート変数 {{変数}}"}</span>
              {"— テンプレートに {{名前}} のような変数を入れると、使う時に一括で埋められます。"}
            </p>
          </div>
          <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">
              <span className="font-medium text-[#1a1a1a] dark:text-white">スワイプで操作</span>
              — リスト上で左にスワイプすると、ピン留め・コピー・削除のアクションが出ます。
            </p>
          </div>
          <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">
              <span className="font-medium text-[#1a1a1a] dark:text-white">AI評価の無料範囲とデモ</span>
              — 無料アカウントで月10回まで利用できます。APIキーは必須ではありません。デモ表示中の点数・改善案は固定の見本で、入力した指示の分析ではなく、本文への適用・保存もできません。
            </p>
          </div>
          <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">
              <span className="font-medium text-[#1a1a1a] dark:text-white">登録なしの保存先</span>
              — 内容は、この端末のこのブラウザ内に保存されます。ブラウザのデータを削除すると消えるため、大切な指示はファイルでも控えてください。別の端末で使うためのクラウド同期には、無料アカウントが必要です。
            </p>
          </div>
          <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4">
            <p className="text-sm text-[#6b7280] dark:text-[#b5b5c2] leading-relaxed">
              <span className="font-medium text-[#1a1a1a] dark:text-white">自分のAPIキーを使う場合</span>
              — アカウントの設定にあるAI Reviewから、OpenAIまたはAnthropicのAPIキーを任意で設定できます。キーはこのブラウザ内に保存され、評価するときにAPIへの接続に使用されます。利用料は各社の条件を確認してください。
            </p>
          </div>
        </div>
      </section>

      {/* 新規作成への導線 */}
      <button
        onClick={() => router.push("/editor?mode=quick")}
        className="w-full py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-sm"
      >
        最初のメモを書く
      </button>
    </div>
  );
}
