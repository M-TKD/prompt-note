"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, ArrowUpCircle, WandSparkles, Send, Globe, GitFork, Search, Upload, Pin, Key, Variable, Download, Share2, Moon } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "メモを書く",
    description: "＋ボタンでメモを作成。Markdownが使えるシンプルなエディタ。キーボード上の記号バーで素早く入力。買い物リストでもアイデアでも何でもOK。",
    icon: <Plus className="w-4 h-4" />,
    accent: false,
  },
  {
    number: "02",
    title: "Boost（昇格）",
    description: "メモが育ったら「Boost」ボタンで Prompt または Template に昇格。AI添削・共有・AI送信が使えるようになります。",
    icon: <ArrowUpCircle className="w-4 h-4" />,
    accent: true,
  },
  {
    number: "03",
    title: "AIで添削",
    description: "AI Review で5軸評価（明確性・具体性・構造・文脈・制約）。改善版も自動生成。Settings で自分の OpenAI / Anthropic APIキーを設定して使えます。",
    icon: <WandSparkles className="w-4 h-4" />,
    accent: false,
  },
  {
    number: "04",
    title: "AIアプリに送る",
    description: "磨いたPromptを ChatGPT / Claude / Gemini / Copilot / Perplexity / Grok にワンタップで送信。クリップボードにコピー→アプリ起動を自動化。",
    icon: <Send className="w-4 h-4" />,
    accent: true,
  },
  {
    number: "05",
    title: "公開して共有",
    description: "良いPromptは公開設定で共有。Explore でみんなのPromptを見つけて、フォークして自分用にカスタマイズ。",
    icon: <Globe className="w-4 h-4" />,
    accent: false,
  },
];

const CONCEPTS = [
  {
    title: "Memo",
    description: "普通のメモ。何でも書ける。非公開。自動保存付き。",
    indicator: "bg-[#e5e7eb]",
  },
  {
    title: "Prompt",
    description: "AI向けの指示文。添削・共有・AI送信が可能。",
    indicator: "bg-[#4F46E5]",
  },
  {
    title: "Template",
    description: "{{変数}}付きの再利用テンプレート。変数を埋めて即座にPromptを生成。",
    indicator: "bg-[#9ca3af]",
  },
];

const FEATURES = [
  { icon: <Upload className="w-3.5 h-3.5" />, title: "Import", desc: ".md / .txt ファイルを読み込み" },
  { icon: <Download className="w-3.5 h-3.5" />, title: "Export", desc: "Markdownファイルとしてダウンロード" },
  { icon: <Share2 className="w-3.5 h-3.5" />, title: "Share", desc: "ネイティブ共有（モバイル対応）" },
  { icon: <Pin className="w-3.5 h-3.5" />, title: "Pin", desc: "よく使うメモを上部に固定" },
  { icon: <Variable className="w-3.5 h-3.5" />, title: "Template変数", desc: "{{変数}} で穴埋め式テンプレート" },
  { icon: <Key className="w-3.5 h-3.5" />, title: "API Key", desc: "自分のAPIキーでAI Review" },
  { icon: <Moon className="w-3.5 h-3.5" />, title: "Dark Mode", desc: "Settings から切り替え" },
  { icon: <GitFork className="w-3.5 h-3.5" />, title: "Fork", desc: "他人のPromptを自分用にコピー" },
];

export default function HowToPage() {
  const router = useRouter();

  return (
    <div className="px-6 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.back()} className="text-[#9ca3af]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">How it works</h1>
      </div>

      {/* Concept */}
      <section className="mb-12">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-4">Concept</p>
        <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-5">
          <p className="text-sm text-[#404040] leading-relaxed mb-4">
            PromptNote は「メモ帳」と「プロンプト管理」を1つにしたアプリです。
            普段はシンプルなメモ帳として使い、良いアイデアはPromptに昇格させてAIで磨き、共有する。
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#9ca3af] font-mono py-3">
            <span className="px-2 py-1 bg-white border border-[#f0f0f0] rounded">書く</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white border border-[#4F46E5]/20 rounded text-[#4F46E5]">Boost</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white border border-[#f0f0f0] rounded">磨く</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white border border-[#f0f0f0] rounded">使う</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white border border-[#f0f0f0] rounded">共有</span>
          </div>
        </div>
      </section>

      {/* 3 Types */}
      <section className="mb-12">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-4">3 types</p>
        <div className="space-y-2">
          {CONCEPTS.map((c) => (
            <div key={c.title} className="flex items-start gap-3 py-3 border-b border-[#f0f0f0] last:border-0">
              <div className={`w-0.5 h-8 rounded-full mt-0.5 shrink-0 ${c.indicator}`} />
              <div>
                <p className="font-medium text-sm text-[#1a1a1a]">{c.title}</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mb-12">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-6">Steps</p>
        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.accent ? "bg-[#4F46E5] text-white" : "bg-[#f5f5f5] text-[#6b7280]"
                }`}>
                  {step.icon}
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-[#f0f0f0] mt-2" />}
              </div>
              <div className="pt-1">
                <p className="text-[10px] font-mono text-[#d1d5db] mb-0.5">{step.number}</p>
                <p className="font-medium text-sm text-[#1a1a1a] mb-1">{step.title}</p>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Features */}
      <section className="mb-12">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-4">Features</p>
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#6b7280]">{f.icon}</span>
                <p className="font-medium text-xs text-[#1a1a1a]">{f.title}</p>
              </div>
              <p className="text-[10px] text-[#9ca3af] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-8">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-4">Tips</p>
        <div className="space-y-3">
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <span className="font-medium text-[#1a1a1a]">メモ帳としても使えます</span>
              — すべてをPromptにする必要はありません。普段のメモ帳として使って、良いアイデアだけBoostしましょう。
            </p>
          </div>
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <span className="font-medium text-[#1a1a1a]">記号バーで素早く入力</span>
              {"— キーボードの上に # * _ ` < > などの記号バーがあります。Markdownの記号を1タップで入力できます。"}
            </p>
          </div>
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <span className="font-medium text-[#1a1a1a]">{"テンプレート変数 {{変数}}"}</span>
              {"— テンプレートに {{名前}} のような変数を入れると、使う時に一括で埋められます。"}
            </p>
          </div>
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <span className="font-medium text-[#1a1a1a]">スワイプで操作</span>
              — リスト上で左にスワイプすると、ピン留め・コピー・削除のアクションが出ます。
            </p>
          </div>
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <span className="font-medium text-[#1a1a1a]">AI Review を使うには</span>
              — Settings → AI Review で OpenAI または Anthropic の APIキーを入力してください。キーはブラウザにのみ保存されます。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <button
        onClick={() => router.push("/editor?mode=quick")}
        className="w-full py-3 bg-[#1a1a1a] text-white font-medium rounded-xl text-sm"
      >
        最初のメモを書く
      </button>
    </div>
  );
}
