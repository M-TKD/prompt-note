"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Share2, Zap, PenLine, Brain, Users, ArrowRight, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo-alt.png" alt="PromptNotes" className="h-14 w-auto dark:invert" />
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
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {[
              { name: "ChatGPT", logo: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#10a37f"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg> },
              { name: "Claude", logo: <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero"/></svg> },
              { name: "Gemini", logo: <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#g-fill-0)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#g-fill-1)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#g-fill-2)"/><defs><linearGradient gradientUnits="userSpaceOnUse" id="g-fill-0" x1="7" x2="11" y1="15.5" y2="12"><stop stopColor="#08B962"/><stop offset="1" stopColor="#08B962" stopOpacity="0"/></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="g-fill-1" x1="8" x2="11.5" y1="5.5" y2="11"><stop stopColor="#F94543"/><stop offset="1" stopColor="#F94543" stopOpacity="0"/></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="g-fill-2" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stopColor="#FABC12"/><stop offset=".46" stopColor="#FABC12" stopOpacity="0"/></linearGradient></defs></svg> },
              { name: "Copilot", logo: <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.533 1.829A2.528 2.528 0 0015.11 0h-.737a2.531 2.531 0 00-2.484 2.087l-1.263 6.937.314-1.08a2.528 2.528 0 012.424-1.833h4.284l1.797.706 1.731-.706h-.505a2.528 2.528 0 01-2.423-1.829l-.715-2.453z" fill="url(#cp-0)" transform="translate(0 1)"/><path d="M6.726 20.16A2.528 2.528 0 009.152 22h1.566c1.37 0 2.49-1.1 2.525-2.48l.17-6.69-.357 1.228a2.528 2.528 0 01-2.423 1.83h-4.32l-1.54-.842-1.667.843h.497c1.124 0 2.113.75 2.426 1.84l.697 2.432z" fill="url(#cp-1)" transform="translate(0 1)"/><path d="M15 0H6.252c-2.5 0-4 3.331-5 6.662-1.184 3.947-2.734 9.225 1.75 9.225H6.78c1.13 0 2.12-.753 2.43-1.847.657-2.317 1.809-6.359 2.713-9.436.46-1.563.842-2.906 1.43-3.742A1.97 1.97 0 0115 0" fill="url(#cp-2)" transform="translate(0 1)"/><path d="M15 0H6.252c-2.5 0-4 3.331-5 6.662-1.184 3.947-2.734 9.225 1.75 9.225H6.78c1.13 0 2.12-.753 2.43-1.847.657-2.317 1.809-6.359 2.713-9.436.46-1.563.842-2.906 1.43-3.742A1.97 1.97 0 0115 0" fill="url(#cp-3)" transform="translate(0 1)"/><path d="M9 22h8.749c2.5 0 4-3.332 5-6.663 1.184-3.948 2.734-9.227-1.75-9.227H17.22c-1.129 0-2.12.754-2.43 1.848a1149.2 1149.2 0 01-2.713 9.437c-.46 1.564-.842 2.907-1.43 3.743A1.97 1.97 0 019 22" fill="url(#cp-4)" transform="translate(0 1)"/><path d="M9 22h8.749c2.5 0 4-3.332 5-6.663 1.184-3.948 2.734-9.227-1.75-9.227H17.22c-1.129 0-2.12.754-2.43 1.848a1149.2 1149.2 0 01-2.713 9.437c-.46 1.564-.842 2.907-1.43 3.743A1.97 1.97 0 019 22" fill="url(#cp-5)" transform="translate(0 1)"/><defs><radialGradient cx="85.44%" cy="100.653%" fx="85.44%" fy="100.653%" gradientTransform="scale(-.8553 -1) rotate(50.927 2.041 -1.946)" id="cp-0" r="105.116%"><stop offset="9.6%" stopColor="#00AEFF"/><stop offset="77.3%" stopColor="#2253CE"/><stop offset="100%" stopColor="#0736C4"/></radialGradient><radialGradient cx="18.143%" cy="32.928%" fx="18.143%" fy="32.928%" gradientTransform="scale(.8897 1) rotate(52.069 .193 .352)" id="cp-1" r="95.612%"><stop offset="0%" stopColor="#FFB657"/><stop offset="63.4%" stopColor="#FF5F3D"/><stop offset="92.3%" stopColor="#C02B3C"/></radialGradient><radialGradient cx="82.987%" cy="-9.792%" fx="82.987%" fy="-9.792%" gradientTransform="scale(-1 -.9441) rotate(-70.872 .142 1.17)" id="cp-4" r="140.622%"><stop offset="6.6%" stopColor="#8C48FF"/><stop offset="50%" stopColor="#F2598A"/><stop offset="89.6%" stopColor="#FFB152"/></radialGradient><linearGradient id="cp-2" x1="39.465%" x2="46.884%" y1="12.117%" y2="103.774%"><stop offset="15.6%" stopColor="#0D91E1"/><stop offset="48.7%" stopColor="#52B471"/><stop offset="65.2%" stopColor="#98BD42"/><stop offset="93.7%" stopColor="#FFC800"/></linearGradient><linearGradient id="cp-3" x1="45.949%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stopColor="#3DCBFF"/><stop offset="24.7%" stopColor="#0588F7" stopOpacity="0"/></linearGradient><linearGradient id="cp-5" x1="83.507%" x2="83.453%" y1="-6.106%" y2="21.131%"><stop offset="5.8%" stopColor="#F8ADFA"/><stop offset="70.8%" stopColor="#A86EDD" stopOpacity="0"/></linearGradient></defs></svg> },
              { name: "Perplexity", logo: <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z" fill="#22B8CD" fillRule="nonzero"/></svg> },
              { name: "Grok", logo: <svg className="w-6 h-6 text-[#1a1a1a] dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            ].map((ai) => (
              <div
                key={ai.name}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[#e5e7eb] dark:border-[#333] bg-[#fafafa] dark:bg-[#111] hover:border-[#d1d5db] dark:hover:border-[#444] transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0">{ai.logo}</div>
                <span className="text-sm font-medium text-[#404040] dark:text-[#e5e7eb]">{ai.name}</span>
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
          <div className="flex items-center">
            <img src="/logo-alt.png" alt="PromptNotes" className="h-10 w-auto dark:invert" />
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
