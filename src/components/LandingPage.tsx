"use client";

import Link from "next/link";
import { Sparkles, Share2, Zap, PenLine, Brain, Users, ArrowRight, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-[#1a1a1a] text-xs font-bold">P</span>
            </div>
            <span className="font-bold text-sm tracking-tight">PromptNotes</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-xs text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white transition-colors">
              ログイン
            </Link>
            <Link
              href="/auth"
              className="text-xs font-medium bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] dark:bg-[#4F46E5]/10 text-[#4F46E5] text-[10px] font-mono uppercase tracking-widest mb-8">
            <Sparkles className="w-3 h-3" />
            AI-Powered Prompt Manager
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] mb-4">
            書いて、磨いて、
            <br />
            <span className="text-[#4F46E5]">シェアしよう。</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6b7280] dark:text-[#9ca3af] leading-relaxed mb-3 max-w-lg mx-auto">
            究極にシンプルなMarkdownメモ。
            <br className="hidden sm:block" />
            無料のAI添削で、誰でもプロンプトが上手くなる。
          </p>

          <p className="text-xs text-[#d1d5db] dark:text-[#444] font-mono mb-10">
            AIプロンプト専用ノート — 保存・AI添削・共有
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              無料で始める
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#e5e7eb] dark:border-[#333] rounded-xl text-sm text-[#6b7280] hover:border-[#9ca3af] transition-colors"
            >
              みんなのプロンプトを見る
            </Link>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-[#e5e7eb] dark:border-[#333] bg-[#fafafa] dark:bg-[#111] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#e5e7eb] dark:bg-[#333]" />
              <div className="w-3 h-3 rounded-full bg-[#e5e7eb] dark:bg-[#333]" />
              <div className="w-3 h-3 rounded-full bg-[#e5e7eb] dark:bg-[#333]" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#4F46E5]/10 text-[#4F46E5]">Template</span>
                <span className="text-xs text-[#9ca3af]">2 variables</span>
              </div>
              <p className="text-sm font-medium">ブログ記事構成プロンプト</p>
              <div className="font-mono text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed bg-white dark:bg-[#0a0a0a] rounded-lg p-4 border border-[#f0f0f0] dark:border-[#222]">
                <p className="text-[#4F46E5]"># Role</p>
                <p>あなたはSEOに精通したブログライターです。</p>
                <br />
                <p className="text-[#4F46E5]"># Task</p>
                <p>{"{{トピック}}"} について、{"{{文字数}}"} 文字程度の</p>
                <p>ブログ記事の構成案を作成してください。</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                  <Brain className="w-3 h-3 text-[#4F46E5]" />
                  AI Score: <span className="text-[#4F46E5] font-medium">A</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                  ♡ 24
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                  ↗ 8 forks
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-mono text-[#4F46E5] uppercase tracking-widest text-center mb-3">Features</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            プロンプトに必要なすべてを。
          </h2>
          <p className="text-sm text-[#9ca3af] text-center mb-16 max-w-md mx-auto">
            メモから始めて、AIで磨いて、テンプレートとして共有する。シンプルだけど強力なワークフロー。
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: PenLine,
                title: "究極にシンプル",
                desc: "余計な機能ゼロ。Markdownで書くことだけに集中。起動も保存も爆速。",
              },
              {
                icon: Brain,
                title: "AIが添削",
                desc: "5つの軸でプロンプトを評価。改善版も自動生成。月10回まで無料。",
              },
              {
                icon: Users,
                title: "共有して学ぶ",
                desc: "良いプロンプトはみんなの財産。Forkして自分流にカスタマイズ。",
              },
            ].map((f) => (
              <div key={f.title} className="text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-[#fafafa] dark:bg-[#141414] border border-[#f0f0f0] dark:border-[#333] flex items-center justify-center mx-auto sm:mx-0 mb-4">
                  <f.icon className="w-5 h-5 text-[#4F46E5]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-[#fafafa] dark:bg-[#0d0d0d] border-t border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-mono text-[#4F46E5] uppercase tracking-widest text-center mb-3">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-16">
            3ステップで、プロンプトマスターに。
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: PenLine,
                title: "書く",
                desc: "メモ感覚でプロンプトを書く。Markdownで自由に構造化。テンプレート変数 {{}} も使える。",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "磨く",
                desc: "AI Reviewで5軸評価。明確性・具体性・構造・コンテキスト・制約。改善版も自動生成。",
              },
              {
                step: "03",
                icon: Share2,
                title: "シェア",
                desc: "公開してコミュニティに共有。良いプロンプトはForkされてどんどん進化する。",
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <span className="text-5xl font-bold text-[#f0f0f0] dark:text-[#1a1a1a] absolute -top-4 -left-1 select-none">{s.step}</span>
                <div className="relative pt-8">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#141414] border border-[#e5e7eb] dark:border-[#333] flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-[#4F46E5]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Send to AI */}
      <section className="py-20 px-6 border-t border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-mono text-[#4F46E5] uppercase tracking-widest mb-3">Integrations</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            お気に入りのAIに、ワンタップで。
          </h2>
          <p className="text-xs text-[#9ca3af] mb-12 max-w-md mx-auto">
            書いたプロンプトをそのままAIに送信。コピー＆ペーストはもう不要。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { name: "ChatGPT", color: "#10a37f", logo: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#10a37f"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg> },
              { name: "Claude", color: "#d97706", logo: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#d97706"><path d="M4.709 15.955l4.72-2.756.08-.046 2.904-1.696L17.122 8.7l1.168-.682.065-.038.065-.038.347-.203a.464.464 0 0 0 .226-.399V3.87a.464.464 0 0 0-.697-.402l-.347.203-.065.038-.065.038-1.168.682-4.709 2.751-.08.047-2.904 1.695-4.709 2.752-1.168.682-.065.038-.065.038-.347.202a.464.464 0 0 0-.226.4v3.47a.464.464 0 0 0 .697.402l.347-.203.065-.038.065-.038 1.168-.682z"/><path d="M4.709 22.408l4.72-2.756.08-.047 2.904-1.695 4.709-2.757 1.168-.682.065-.038.065-.037.347-.203a.464.464 0 0 0 .226-.4v-3.47a.464.464 0 0 0-.697-.401l-.347.203-.065.037-.065.038-1.168.682-4.709 2.757-.08.046-2.904 1.696-4.709 2.751-1.168.682-.065.038-.065.038-.347.203a.464.464 0 0 0-.226.4v3.47a.464.464 0 0 0 .697.401l.347-.203.065-.037.065-.038 1.168-.682z"/></svg> },
              { name: "Gemini", color: "#4285f4", logo: <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M12 0C5.352 0 0 5.352 0 12s5.352 12 12 12 12-5.352 12-12S18.648 0 12 0z" fill="#4285f4"/><path d="M12 4.8c3.6 0 6.6 2.4 7.2 5.7H4.8c.6-3.3 3.6-5.7 7.2-5.7z" fill="#fff" opacity=".4"/><path d="M12 19.2c-3.6 0-6.6-2.4-7.2-5.7h14.4c-.6 3.3-3.6 5.7-7.2 5.7z" fill="#fff" opacity=".4"/></svg> },
              { name: "Copilot", color: "#7c3aed", logo: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#7c3aed"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a3 3 0 0 1 3 3v1.5a1.5 1.5 0 0 1-3 0V8a1.5 1.5 0 0 0-3 0v1.5a1.5 1.5 0 0 1-3 0V8a3 3 0 0 1 3-3h3zm-5 8h10v1c0 2.76-2.24 5-5 5s-5-2.24-5-5v-1z"/></svg> },
              { name: "Perplexity", color: "#20808d", logo: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#20808d"><path d="M12 1L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-4zm0 2.18l6 3v5.28c0 4.52-3.13 8.72-6 9.84-2.87-1.12-6-5.32-6-9.84V6.18l6-3zM11 7v6h2V7h-2zm0 8v2h2v-2h-2z"/></svg> },
              { name: "Grok", color: "#1a1a1a", logo: <svg className="w-5 h-5 text-[#1a1a1a] dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            ].map((ai) => (
              <div
                key={ai.name}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[#e5e7eb] dark:border-[#333] bg-[#fafafa] dark:bg-[#111] hover:border-[#d1d5db] dark:hover:border-[#444] transition-colors"
              >
                {ai.logo}
                <span className="text-xs font-medium text-[#404040] dark:text-[#e5e7eb]">{ai.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-[#fafafa] dark:bg-[#0d0d0d] border-t border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-mono text-[#4F46E5] uppercase tracking-widest text-center mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-16">
            まずは無料で。
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-[#e5e7eb] dark:border-[#333] bg-white dark:bg-[#111] p-6">
              <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1">Free</p>
              <p className="text-3xl font-bold mb-1">¥0</p>
              <p className="text-xs text-[#9ca3af] mb-6">ずっと無料</p>
              <ul className="space-y-3 mb-8">
                {[
                  "無制限のメモ・プロンプト作成",
                  "AI Review 月10回",
                  "6つのAIプラットフォームに送信",
                  "テンプレート変数",
                  "コミュニティ閲覧・Fork",
                  "クラウド同期",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    <Check className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth"
                className="block text-center py-2.5 rounded-xl border border-[#e5e7eb] dark:border-[#333] text-xs font-medium hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                無料で始める
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-[#4F46E5] bg-white dark:bg-[#111] p-6 relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#4F46E5] text-white text-[10px] font-medium">
                Coming Soon
              </div>
              <p className="text-[10px] font-mono text-[#4F46E5] uppercase tracking-widest mb-1">Pro</p>
              <p className="text-3xl font-bold mb-1">¥980<span className="text-sm font-normal text-[#9ca3af]">/月</span></p>
              <p className="text-xs text-[#9ca3af] mb-6">すべてを無制限に</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Freeプランのすべて",
                  "AI Review 無制限",
                  "バージョン履歴",
                  "コレクション/フォルダ",
                  "優先サポート",
                  "新機能の早期アクセス",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    <Check className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="block w-full text-center py-2.5 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-medium cursor-not-allowed"
              >
                準備中
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            あなたのプロンプトが、
            <br />
            誰かの武器になる。
          </h2>
          <p className="text-sm text-[#9ca3af] mb-10">
            AI時代のナレッジを、みんなで作ろう。
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            無料で始める
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1a1a1a] dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-[#1a1a1a] text-[8px] font-bold">P</span>
            </div>
            <span className="text-xs text-[#9ca3af] font-mono">PromptNotes</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-[#9ca3af]">
            <Link href="/terms" className="hover:text-[#6b7280] transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-[#6b7280] transition-colors">プライバシー</Link>
            <Link href="/howto" className="hover:text-[#6b7280] transition-colors">使い方</Link>
          </div>
          <p className="text-[10px] text-[#d1d5db] dark:text-[#333] font-mono">
            © 2026 PromptNotes
          </p>
        </div>
      </footer>
    </div>
  );
}
