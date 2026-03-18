"use client";

export default function SettingsPage() {
  return (
    <div className="px-5 pt-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">設定</h1>

      {/* Profile */}
      <section className="mb-6">
        <div className="flex items-center gap-3 py-4">
          <div className="w-11 h-11 rounded-full bg-neutral-900 flex items-center justify-center text-white font-semibold text-sm">
            G
          </div>
          <div>
            <p className="font-semibold text-sm">ゲストユーザー</p>
            <p className="text-[11px] text-neutral-400">ローカル保存</p>
          </div>
        </div>
      </section>

      {/* AI Review */}
      <section className="mb-6">
        <h2 className="text-xs font-medium text-neutral-400 mb-3 uppercase tracking-wider">AI添削</h2>
        <div className="space-y-0 border-t border-neutral-100">
          <div className="flex items-center justify-between py-3.5 border-b border-neutral-100">
            <span className="text-sm">残り回数</span>
            <span className="text-sm text-neutral-400 font-mono">3 / 3</span>
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-neutral-100">
            <div>
              <span className="text-sm font-medium text-amber-600">Pro プラン</span>
              <p className="text-[11px] text-neutral-400">30回/日 + 高度な添削</p>
            </div>
            <span className="text-[11px] text-neutral-300">準備中</span>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mb-6">
        <h2 className="text-xs font-medium text-neutral-400 mb-3 uppercase tracking-wider">情報</h2>
        <div className="border-t border-neutral-100">
          <div className="flex items-center justify-between py-3.5 border-b border-neutral-100 text-sm">
            <span>バージョン</span>
            <span className="text-neutral-400 font-mono text-xs">0.1.0</span>
          </div>
        </div>
      </section>

      <p className="text-center text-[11px] text-neutral-300 mt-12">
        PromptNote
      </p>
    </div>
  );
}
