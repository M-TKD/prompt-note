"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ChevronRight, Sparkles, Plug, Lightbulb, ExternalLink, Check,
} from "lucide-react";
import { LEVEL_CONFIG, LEVEL_ORDER, getPromptsByLevel } from "@/lib/prompt-library";
import {
  LEARNING_PATH,
  AI_USE_CASES,
  USE_CASE_CATEGORIES,
  UseCaseCategory,
  MCP_SERVERS,
  MCP_CATEGORIES,
  McpCategory,
  MCP_INTRO,
} from "@/lib/learn";

/** ライブラリのプロンプトを Explore の検索で開く */
function promptHref(title: string) {
  return `/feed?q=${encodeURIComponent(title)}`;
}

const LEVEL_BADGE: Record<string, string> = {
  starter: "bg-[#ECFDF5] dark:bg-[#065f46]/25 text-[#059669]",
  basic: "bg-[#f5f5f5] dark:bg-[#333] text-[#6b7280] dark:text-[#9ca3af]",
  intermediate: "bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5]",
  advanced: "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]",
};

export default function LearnPage() {
  const router = useRouter();
  const [useCaseTab, setUseCaseTab] = useState<UseCaseCategory>(USE_CASE_CATEGORIES[0]);
  const [mcpTab, setMcpTab] = useState<McpCategory>(MCP_CATEGORIES[0]);

  return (
    <div className="px-6 pt-14 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => router.back()} className="text-[#9ca3af]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">はじめかた</h1>
      </div>
      <p className="text-xs text-[#9ca3af] leading-relaxed mb-10">
        AIを仕事に使えるようになるまでの順番と、できることの一覧です。
        上から順にやれば、今日から使えます。
      </p>

      {/* ---------- ロードマップ ---------- */}
      <section className="mb-14">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-5">Roadmap</p>
        <div className="space-y-0">
          {LEARNING_PATH.map((step, i) => (
            <div key={step.phase} className="flex gap-4 pb-8 last:pb-0">
              {/* Timeline */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                  i === 0 ? "bg-[#4F46E5] text-white" : "bg-[#f5f5f5] dark:bg-[#333] text-[#6b7280] dark:text-[#9ca3af]"
                }`}>
                  {i + 1}
                </div>
                {i < LEARNING_PATH.length - 1 && (
                  <div className="w-px flex-1 bg-[#f0f0f0] dark:bg-[#333] mt-2" />
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${LEVEL_BADGE[step.level]}`}>
                    {LEVEL_CONFIG[step.level].label}
                  </span>
                  <span className="text-[9px] text-[#d1d5db] font-mono">{step.estimate}</span>
                </div>
                <p className="font-bold text-sm text-[#1a1a1a] dark:text-white mb-1">{step.title}</p>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-3">
                  ゴール：{step.goal}
                </p>

                <ul className="space-y-1.5 mb-3">
                  {step.actions.map((action) => (
                    <li key={action} className="flex gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                      <Check className="w-3 h-3 mt-[3px] shrink-0 text-[#d1d5db] dark:text-[#555]" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-1">
                  {step.prompts.map((title) => (
                    <Link
                      key={title}
                      href={promptHref(title)}
                      className="flex items-center gap-1.5 text-[11px] text-[#4F46E5] no-underline hover:underline"
                    >
                      <ArrowRight className="w-3 h-3 shrink-0" />
                      <span className="truncate">{title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- レベル ---------- */}
      <section className="mb-14">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-2">Levels</p>
        <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-4">
          いまの自分に合うところから始めてください。飛ばしても構いません。
        </p>
        <div className="space-y-2">
          {LEVEL_ORDER.map((lv) => (
            <Link
              key={lv}
              href={`/feed?level=${lv}`}
              className="flex items-start gap-3 p-4 rounded-xl border border-[#f0f0f0] dark:border-[#333] no-underline hover:border-[#4F46E5]/30"
            >
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${LEVEL_BADGE[lv]}`}>
                {LEVEL_CONFIG[lv].label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1a1a1a] dark:text-white">
                  {LEVEL_CONFIG[lv].short}
                  <span className="text-[10px] text-[#d1d5db] font-mono ml-2">
                    {getPromptsByLevel(lv).length} 本
                  </span>
                </p>
                <p className="text-xs text-[#9ca3af] mt-0.5 leading-relaxed">
                  {LEVEL_CONFIG[lv].description}
                </p>
                <p className="text-[10px] text-[#d1d5db] dark:text-[#555] mt-1">
                  こんな人に：{LEVEL_CONFIG[lv].forWhom}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#d1d5db] shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- こんなこともできる ---------- */}
      <section className="mb-14">
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-[#D97706]" />
          <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest">Can do</p>
        </div>
        <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-4">
          AIに頼めると知らなかったこと。気になったものをタップすると、そのプロンプトが開きます。
        </p>

        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {USE_CASE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setUseCaseTab(c)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap ${
                useCaseTab === c
                  ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]"
                  : "bg-[#f5f5f5] dark:bg-[#222] text-[#6b7280] dark:text-[#9ca3af]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {AI_USE_CASES.filter((u) => u.category === useCaseTab).map((u) => {
            const inner = (
              <>
                <div className="flex items-start gap-2 mb-1">
                  <p className="font-medium text-[13px] text-[#1a1a1a] dark:text-white leading-snug flex-1">
                    {u.title}
                  </p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${LEVEL_BADGE[u.level]}`}>
                    {LEVEL_CONFIG[u.level].label}
                  </span>
                </div>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed">{u.body}</p>
                {u.prompt && (
                  <p className="flex items-center gap-1.5 text-[11px] text-[#4F46E5] mt-2">
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span className="truncate">{u.prompt}</span>
                  </p>
                )}
              </>
            );

            return u.prompt ? (
              <Link
                key={u.title}
                href={promptHref(u.prompt)}
                className="block p-4 rounded-xl border border-[#f0f0f0] dark:border-[#333] no-underline hover:border-[#4F46E5]/30"
              >
                {inner}
              </Link>
            ) : (
              <div key={u.title} className="p-4 rounded-xl border border-[#f0f0f0] dark:border-[#333]">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- MCP集 ---------- */}
      <section className="mb-12">
        <div className="flex items-center gap-1.5 mb-2">
          <Plug className="w-3.5 h-3.5 text-[#4F46E5]" />
          <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest">MCP</p>
        </div>

        <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-xl p-4 mb-4">
          <p className="font-medium text-xs text-[#1a1a1a] dark:text-white mb-1.5">{MCP_INTRO.title}</p>
          <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] leading-relaxed mb-2">
            {MCP_INTRO.body}
          </p>
          <p className="text-[10px] text-[#9ca3af] leading-relaxed mb-3">{MCP_INTRO.note}</p>
          <div className="flex flex-col gap-1">
            <a
              href={MCP_INTRO.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-[#4F46E5] no-underline"
            >
              <ExternalLink className="w-3 h-3 shrink-0" /> 公式ドキュメント
            </a>
            <a
              href={MCP_INTRO.serversUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-[#4F46E5] no-underline"
            >
              <ExternalLink className="w-3 h-3 shrink-0" /> サーバー一覧（GitHub）
            </a>
          </div>
        </div>

        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {MCP_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setMcpTab(c)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap ${
                mcpTab === c
                  ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]"
                  : "bg-[#f5f5f5] dark:bg-[#222] text-[#6b7280] dark:text-[#9ca3af]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {MCP_SERVERS.filter((m) => m.category === mcpTab).map((m) => (
            <div key={m.name} className="p-4 rounded-xl border border-[#f0f0f0] dark:border-[#333]">
              <p className="font-medium text-[13px] text-[#1a1a1a] dark:text-white mb-1">{m.name}</p>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-2.5">{m.what}</p>
              <p className="text-[9px] font-mono text-[#d1d5db] dark:text-[#555] uppercase tracking-wider mb-1">
                こう頼める
              </p>
              <ul className="space-y-1">
                {m.examples.map((ex) => (
                  <li
                    key={ex}
                    className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] leading-relaxed pl-2.5 border-l-2 border-[#f0f0f0] dark:border-[#333]"
                  >
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Link
        href="/feed?level=starter"
        className="flex items-center justify-center gap-2 w-full py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-sm no-underline"
      >
        <Sparkles className="w-4 h-4" />
        入門の5本から始める
      </Link>
    </div>
  );
}
