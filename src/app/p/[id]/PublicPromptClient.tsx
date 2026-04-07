"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, GitFork, Share2, Copy, Check, Link, X } from "lucide-react";
import { MarkdownPreview } from "@/components/MarkdownPreview";

type Props = {
  id: string;
  title: string;
  likeCount: number;
  forkCount: number;
  bodyMd: string;
};

export function PublicPromptClient({ id, title, likeCount, forkCount, bodyMd }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://prompt-notes.ai/p/${id}`;

  // Close share panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    if (shareOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [shareOpen]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
        setShareOpen(false);
      }, 1500);
    } catch {
      // ignore
    }
  }

  function handleShareX() {
    const text = `${title}\n`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShareOpen(false);
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
    window.location.href = `/editor?fork=${id}`;
  }

  return (
    <div className="space-y-4">
      {/* Markdown body */}
      <div className="bg-gray-50 dark:bg-[#252525] rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
        <MarkdownPreview content={bodyMd} />
      </div>

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

        {/* Share button with dropdown */}
        <div className="relative" ref={shareRef}>
          <button
            onClick={() => setShareOpen((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors"
          >
            <Share2 size={16} />
            共有
          </button>

          {shareOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20">
              <button
                onClick={handleShareX}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors"
              >
                <X size={16} />
                Xでシェア
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors border-t border-gray-100 dark:border-gray-700"
              >
                {linkCopied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Link size={16} />
                )}
                {linkCopied ? "コピーしました" : "リンクをコピー"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
