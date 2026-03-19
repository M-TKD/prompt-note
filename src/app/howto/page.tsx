"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, ArrowUpCircle, WandSparkles, Send, Globe, GitFork, Search } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "メモを書く",
    description: "＋ボタンでメモを作成。Markdownが使えるシンプルなエディタ。買い物リストでもアイデアでも何でもOK。",
    icon: <Plus className="w-4 h-4" />,
    accent: false,
  },
  {
    number: "02",
    title: "Promptに昇格",
    description: "メモが育ったら「Promote」で Prompt に昇格。AIへの指示文として整理されます。",
    icon: <ArrowUpCircle className="w-4 h-4" />,
    accent: true,
  },
  {
    number: "03",
    title: "AIで添削",
    description: "AI Review で5軸評価。明確性・具体性・構造・文脈・制約を自動チェックし、改善版を提案。",
    icon: <WandSparkles className="w-4 h-4" />,
    accent: false,
  },
  {
    number: "04",
    title: "AIアプリに送る",
    description: "磨いたPromptを ChatGPT / Claude / Gemini / Copilot にワンタップで送信。コピー→アプリ起動を自動化。",
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
    description: "普通のメモ。何でも書ける。非公開。",
    indicator: "bg-[#e5e7eb]",
  },
  {
    title: "Prompt",
    description: "AI向けの指示文。添削・共有・AI送信が可能。",
    indicator: "bg-[#4F46E5]",
  },
  {
    title: "Template",
    description: "変数付きの再利用テンプレート。",
    indicator: "bg-[#9ca3af]",
  },
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
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#9ca3af] font-mono py-3">
            <span className="px-2 py-1 bg-white border border-[#f0f0f0] rounded">書く</span>
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
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.accent ? "bg-[#4F46E5] text-white" : "bg-[#f5f5f5] text-[#6b7280]"
                }`}>
                  {step.icon}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-[#f0f0f0] mt-2" />
                )}
              </div>
              {/* Content */}
              <div className="pt-1">
                <p className="text-[10px] font-mono text-[#d1d5db] mb-0.5">{step.number}</p>
                <p className="font-medium text-sm text-[#1a1a1a] mb-1">{step.title}</p>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{step.description}</p>
              </div>
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
              — すべてをPromptにする必要はありません。普段のメモ帳として使って、良いアイデアだけ昇格させましょう。
            </p>
          </div>
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <span className="font-medium text-[#1a1a1a]">Markdownが使えます</span>
              {"— # 見出し、**太字**、- リスト、> 引用、`コード` など。ツールバーからも挿入できます。"}
            </p>
          </div>
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <span className="font-medium text-[#1a1a1a]">タグで整理</span>
              — プロンプトにタグをつけておくと、検索や分類が簡単になります。
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
