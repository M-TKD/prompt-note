"use client";

import { X, Sparkles, History, FolderOpen, Headphones } from "lucide-react";

const FEATURES = [
  { icon: <Sparkles className="w-4 h-4" />, label: "AI Review 無制限" },
  { icon: <History className="w-4 h-4" />, label: "バージョン履歴" },
  { icon: <FolderOpen className="w-4 h-4" />, label: "コレクション管理" },
  { icon: <Headphones className="w-4 h-4" />, label: "優先サポート" },
];

interface UpgradeModalProps {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-2xl p-6 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#d1d5db] hover:text-[#6b7280] dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold font-mono uppercase tracking-widest mb-2">
            Pro
          </div>
          <h2 className="font-bold text-lg tracking-tight text-[#1a1a1a] dark:text-white">
            Proプランにアップグレード
          </h2>
          <p className="text-xs text-[#9ca3af] font-mono">
            すべての機能を制限なく利用
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2.5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 flex items-center justify-center text-[#4F46E5]">
                {f.icon}
              </div>
              <span className="text-sm font-medium text-[#404040] dark:text-[#e5e7eb]">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="text-center">
          <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white">¥980</span>
          <span className="text-xs text-[#9ca3af] ml-1">/月</span>
        </div>

        {/* CTA */}
        <a
          href="/settings#upgrade"
          className="block w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-xl text-sm text-center transition-colors"
        >
          アップグレード
        </a>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full text-center text-[11px] text-[#d1d5db] hover:text-[#9ca3af] py-1"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
