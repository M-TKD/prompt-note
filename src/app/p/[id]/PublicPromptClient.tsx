"use client";

import { useState, useEffect } from "react";
import { Heart, GitFork, Copy, Check } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { ShareButton } from "@/components/ShareSheet";
import { useStore } from "@/lib/use-store";
import { useAuth } from "@/lib/auth-context";

type Props = {
  id: string;
  title: string;
  tags?: string[];
  likeCount: number;
  forkCount: number;
  bodyMd: string;
};

export function PublicPromptClient({ id, title, tags = [], likeCount, forkCount, bodyMd }: Props) {
  const hybridStore = useStore();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likeCount);
  const [forking, setForking] = useState(false);

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://prompt-notes.ai/p/${id}`;

  useEffect(() => {
    hybridStore.isLiked(id).then(setLiked);
  }, [hybridStore, id]);

  async function handleToggleLike() {
    const nowLiked = await hybridStore.toggleLike(id);
    setLiked(nowLiked);
    setCurrentLikes((prev) => prev + (nowLiked ? 1 : -1));
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(bodyMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function handleFork() {
    setForking(true);
    const forked = await hybridStore.fork(id);
    if (forked) {
      window.location.href = `/editor?id=${forked.id}`;
    } else {
      window.location.href = `/editor?fork=${id}`;
    }
  }

  return (
    <div className="space-y-5">
      {/* Markdown body */}
      <div className="bg-gray-50 dark:bg-[#252525] rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
        <MarkdownPreview content={bodyMd} />
      </div>

      {/* Stats - interactive */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            liked
              ? "bg-[#4F46E5]/10 text-[#4F46E5] dark:bg-[#4F46E5]/20"
              : "bg-gray-100 dark:bg-[#252525] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#303030]"
          }`}
        >
          <Heart size={16} className={liked ? "fill-current" : ""} />
          {currentLikes}
        </button>
        <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-[#252525] text-gray-500 dark:text-gray-400">
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
          disabled={forking}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors disabled:opacity-60"
        >
          <GitFork size={16} />
          {forking ? "フォーク中..." : "フォークして使う"}
        </button>

        {/* Share button with SNS dropdown */}
        <ShareButton url={pageUrl} title={title} tags={tags} />
      </div>
    </div>
  );
}
