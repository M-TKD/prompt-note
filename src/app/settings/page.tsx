"use client";

export default function SettingsPage() {
  return (
    <div className="px-6 pt-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Settings</h1>
      </div>

      {/* Profile */}
      <section className="mb-8">
        <div className="flex items-center gap-3 py-3">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-medium text-sm">
            G
          </div>
          <div>
            <p className="font-medium text-sm text-[#1a1a1a]">Guest</p>
            <p className="text-[10px] text-[#9ca3af] font-mono">Local storage</p>
          </div>
        </div>
      </section>

      {/* AI Review */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">AI Review</h2>
        <div className="border-t border-[#f0f0f0]">
          <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0]">
            <span className="text-sm text-[#1a1a1a]">Remaining</span>
            <span className="text-sm text-[#9ca3af] font-mono">3 / 3</span>
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0]">
            <div>
              <span className="text-sm font-medium text-[#4F46E5]">Pro Plan</span>
              <p className="text-[10px] text-[#9ca3af] font-mono">30/day + advanced review</p>
            </div>
            <span className="text-[10px] text-[#d1d5db] font-mono">Coming soon</span>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">Info</h2>
        <div className="border-t border-[#f0f0f0]">
          <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] text-sm">
            <span className="text-[#1a1a1a]">Version</span>
            <span className="text-[#9ca3af] font-mono text-xs">0.1.0</span>
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] text-[#d1d5db] mt-16 font-mono tracking-widest">
        PromptNote
      </p>
    </div>
  );
}
