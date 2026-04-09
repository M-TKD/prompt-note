"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Link, Check, X } from "lucide-react";

type ShareSheetProps = {
  url: string;
  title: string;
  tags?: string[];
  onClose?: () => void;
};

// SNS share URL builders
function buildXUrl(title: string, url: string, tags: string[]) {
  const hashtags = ["PromptNotes", ...tags].map((t) => `#${t}`).join(" ");
  const text = `${title}\n${hashtags}\n`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

function buildLineUrl(url: string, title: string) {
  const text = `${title}\n${url}`;
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

function buildFacebookUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function buildLinkedInUrl(url: string, title: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

// X icon (custom SVG since lucide X icon is "close")
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// LINE icon
function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

// Facebook icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// LinkedIn icon
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** Inline share button — toggles a dropdown with SNS options */
export function ShareButton({ url, title, tags = [] }: ShareSheetProps) {
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
        setOpen(false);
      }, 1200);
    } catch { /* ignore */ }
  };

  const openWindow = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors"
      >
        <Share2 size={16} />
        共有
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={() => openWindow(buildXUrl(title, url, tags))}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <XIcon className="w-4 h-4" />
            X (Twitter) でシェア
          </button>
          <button
            onClick={() => openWindow(buildLineUrl(url, title))}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors border-t border-gray-100 dark:border-[#333]"
          >
            <LineIcon className="w-4 h-4 text-[#06C755]" />
            LINEで送る
          </button>
          <button
            onClick={() => openWindow(buildFacebookUrl(url))}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors border-t border-gray-100 dark:border-[#333]"
          >
            <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
            Facebookでシェア
          </button>
          <button
            onClick={() => openWindow(buildLinkedInUrl(url, title))}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors border-t border-gray-100 dark:border-[#333]"
          >
            <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
            LinkedInでシェア
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors border-t border-gray-100 dark:border-[#333]"
          >
            {linkCopied ? <Check size={16} className="text-green-500" /> : <Link size={16} />}
            {linkCopied ? "コピーしました!" : "リンクをコピー"}
          </button>
        </div>
      )}
    </div>
  );
}

/** Bottom sheet style share UI for modals */
export function ShareSheet({ url, title, tags = [], onClose }: ShareSheetProps & { onClose: () => void }) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
        onClose();
      }, 1200);
    } catch { /* ignore */ }
  };

  const openWindow = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
    onClose();
  };

  const SNS_OPTIONS = [
    { label: "X (Twitter)", icon: <XIcon className="w-5 h-5" />, color: "bg-black dark:bg-white dark:text-black text-white", action: () => openWindow(buildXUrl(title, url, tags)) },
    { label: "LINE", icon: <LineIcon className="w-5 h-5 text-white" />, color: "bg-[#06C755] text-white", action: () => openWindow(buildLineUrl(url, title)) },
    { label: "Facebook", icon: <FacebookIcon className="w-5 h-5 text-white" />, color: "bg-[#1877F2] text-white", action: () => openWindow(buildFacebookUrl(url)) },
    { label: "LinkedIn", icon: <LinkedInIcon className="w-5 h-5 text-white" />, color: "bg-[#0A66C2] text-white", action: () => openWindow(buildLinkedInUrl(url, title)) },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-sm text-center mb-4 dark:text-white">シェアする</h3>

        {/* SNS grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {SNS_OPTIONS.map((sns) => (
            <button
              key={sns.label}
              onClick={sns.action}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-12 h-12 rounded-full ${sns.color} flex items-center justify-center`}>
                {sns.icon}
              </div>
              <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] font-medium">{sns.label}</span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f5f5f5] dark:bg-[#222] text-sm font-medium text-[#1a1a1a] dark:text-white hover:bg-[#eee] dark:hover:bg-[#2a2a2a] transition-colors"
        >
          {linkCopied ? <Check size={16} className="text-green-500" /> : <Link size={16} className="text-[#9ca3af]" />}
          {linkCopied ? "コピーしました!" : "リンクをコピー"}
          <span className="ml-auto text-[11px] text-[#9ca3af] font-mono truncate max-w-[180px]">{url}</span>
        </button>

        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-3 mt-2">
          閉じる
        </button>
      </div>
    </div>
  );
}
