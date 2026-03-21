"use client";

import { useState } from "react";
import { Heart, GitFork, Share2, Copy, Check } from "lucide-react";

type Props = {
  id: string;
  title: string;
  likeCount: number;
  forkCount: number;
  bodyMd: string;
};

export function PublicPromptClient({ id, title, likeCount, forkCount, bodyMd }: Props) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  async function handleShare() {
    const shareData = {
      title: `${title} | PromptNotes`,
      text: bodyMd.slice(0, 100) + "...",
      url: pageUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // User cancelled or share not supported, fall through to clipboard
    }

    // Fallback: copy URL
    try {
      await navigator.clipboard.writeText(pageUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(bodyMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function handleFork() {
    // Navigate to editor with fork intent
    window.location.href = `/editor?fork=${id}`;
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Heart size={16} />
          {likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <GitFork size={16} />
          {forkCount}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopyPrompt}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          {copied ? "コピーしました" : "プロンプトをコピー"}
        </button>

        <button
          onClick={handleFork}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors"
        >
          <GitFork size={16} />
          フォークして使う
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors"
        >
          {shared ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
          {shared ? "URLをコピーしました" : "共有"}
        </button>
      </div>
    </div>
  );
}
