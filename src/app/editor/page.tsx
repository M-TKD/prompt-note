"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { store } from "@/lib/store";
import { PromptDocument, DocumentType, DocumentVisibility, TYPE_CONFIG, AI_APPS } from "@/lib/types";
import {
  ArrowLeft, Eye, Pencil, WandSparkles, Send, ArrowUpCircle,
  Bold, Italic, Code, List, ListOrdered, Heading1, Heading2,
  Quote, Minus, Link2, Copy, Check, Globe, Lock,
  ChevronRight, ThumbsUp, ThumbsDown, ExternalLink,
} from "lucide-react";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");
  const mode = searchParams.get("mode");

  const [title, setTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [docType, setDocType] = useState<DocumentType>(mode === "quick" ? "note" : "prompt");
  const [visibility, setVisibility] = useState<DocumentVisibility>("private");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSendToAI, setShowSendToAI] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [showAIReview, setShowAIReview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editId) {
      const doc = store.getDocument(editId);
      if (doc) {
        setTitle(doc.title || "");
        setBodyMd(doc.bodyMd);
        setDocType(doc.type);
        setVisibility(doc.visibility);
        setTags(doc.tags);
      }
    }
  }, [editId]);

  const isQuickMemo = docType === "note" && !editId;
  const isNote = docType === "note";
  const isPrompt = docType === "prompt";
  const isTemplate = docType === "template";
  const hasContent = bodyMd.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!hasContent) return;
    const data = {
      userId: "local",
      title: title || null,
      bodyMd,
      type: docType,
      visibility: isNote ? "private" as const : visibility,
      tags,
    };
    if (editId) {
      store.update(editId, data);
    } else {
      store.create(data);
    }
    setSaved(true);
    setTimeout(() => router.push("/"), 500);
  }, [editId, title, bodyMd, docType, visibility, tags, isNote, hasContent, router]);

  const handlePromote = (newType: DocumentType) => {
    setDocType(newType);
    setShowPromote(false);
  };

  const handleAddTag = () => {
    const tag = tagInput.replace(/[,、# ]/g, "").trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = bodyMd.substring(start, end);
    const replacement = `${prefix}${selected || "テキスト"}${suffix}`;
    setBodyMd(bodyMd.substring(0, start) + replacement + bodyMd.substring(end));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bodyMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - minimal */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <button onClick={() => router.back()} className="text-neutral-400 hover:text-neutral-900">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <span className="text-xs text-neutral-400 font-medium">
          {isQuickMemo ? "メモ" : TYPE_CONFIG[docType].label}
        </span>
        <button
          onClick={handleSave}
          disabled={!hasContent}
          className={`text-sm font-semibold px-4 py-1.5 rounded-full transition ${
            hasContent
              ? "bg-neutral-900 text-white active:scale-95"
              : "bg-neutral-100 text-neutral-300"
          }`}
        >
          {saved ? "✓" : "保存"}
        </button>
      </div>

      {/* Type & Visibility bar */}
      {!isQuickMemo && (
        <div className="px-4 py-2 flex items-center gap-2 border-b border-neutral-50">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
            isNote ? "bg-neutral-100 text-neutral-500" :
            isPrompt ? "bg-amber-50 text-amber-700" : "bg-neutral-100 text-neutral-600"
          }`}>
            {TYPE_CONFIG[docType].label}
          </span>

          {!isNote && (
            <button
              onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
              className={`text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-medium ${
                visibility === "public"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {visibility === "public" ? "公開" : "非公開"}
            </button>
          )}
        </div>
      )}

      {/* Title */}
      {!isQuickMemo && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isNote ? "タイトル（任意）" : "タイトル"}
          className="px-5 py-3 text-xl font-bold outline-none placeholder:text-neutral-200 tracking-tight"
        />
      )}

      {/* Tags */}
      {!isQuickMemo && (
        <div className="px-5 py-1.5 flex items-center gap-1.5 flex-wrap border-b border-neutral-50">
          {tags.map((tag) => (
            <span key={tag} className="text-[11px] text-neutral-500 px-2 py-0.5 rounded-full bg-neutral-100 flex items-center gap-1">
              #{tag}
              <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-neutral-300 hover:text-neutral-500">✕</button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " " || e.key === ",") { e.preventDefault(); handleAddTag(); } }}
            placeholder="タグ..."
            className="text-[11px] outline-none min-w-[60px] flex-1 text-neutral-400 placeholder:text-neutral-200"
          />
        </div>
      )}

      {/* Editor / Preview */}
      <div className="flex-1 overflow-auto">
        {showPreview ? (
          <div className="p-5 markdown-preview">
            <MarkdownPreview content={bodyMd} />
          </div>
        ) : (
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            placeholder={isQuickMemo ? "メモを書く..." : "Markdownで書く..."}
            className="w-full h-full p-5 outline-none resize-none font-mono text-sm leading-relaxed text-neutral-700 placeholder:text-neutral-200"
            autoFocus
          />
        )}
      </div>

      {/* Markdown toolbar - minimal */}
      {!showPreview && (
        <div className="flex items-center gap-0.5 px-2 py-1 border-t border-neutral-100 overflow-x-auto">
          {[
            { icon: <Heading1 className="w-4 h-4" />, action: () => insertMarkdown("# ") },
            { icon: <Heading2 className="w-4 h-4" />, action: () => insertMarkdown("## ") },
            { icon: <Bold className="w-4 h-4" />, action: () => insertMarkdown("**", "**") },
            { icon: <Italic className="w-4 h-4" />, action: () => insertMarkdown("_", "_") },
            { icon: <Code className="w-4 h-4" />, action: () => insertMarkdown("`", "`") },
            { icon: <List className="w-4 h-4" />, action: () => insertMarkdown("- ") },
            { icon: <ListOrdered className="w-4 h-4" />, action: () => insertMarkdown("1. ") },
            { icon: <Quote className="w-4 h-4" />, action: () => insertMarkdown("> ") },
            { icon: <Minus className="w-4 h-4" />, action: () => insertMarkdown("\n---\n") },
            { icon: <Link2 className="w-4 h-4" />, action: () => insertMarkdown("[", "](URL)") },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className="p-2 text-neutral-300 hover:text-neutral-700 rounded transition"
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      {/* Bottom action bar - clean */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-neutral-100">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs flex items-center gap-1 text-neutral-400 hover:text-neutral-700"
        >
          {showPreview ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? "編集" : "プレビュー"}
        </button>

        <div className="flex-1" />

        {/* Note → Prompt promotion */}
        {isNote && hasContent && (
          <button
            onClick={() => setShowPromote(true)}
            className="text-xs flex items-center gap-1 text-amber-600 font-semibold"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            昇格
          </button>
        )}

        {/* AI Review */}
        {hasContent && (
          <button
            onClick={() => setShowAIReview(true)}
            className="text-xs flex items-center gap-1 text-neutral-500 font-medium hover:text-neutral-700"
          >
            <WandSparkles className="w-3.5 h-3.5" />
            AI添削
          </button>
        )}

        {/* Send to AI */}
        {(isPrompt || isTemplate) && hasContent && (
          <button
            onClick={() => setShowSendToAI(true)}
            className="text-xs flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-full font-medium"
          >
            <Send className="w-3 h-3" />
            AIに送る
          </button>
        )}

        {/* Copy */}
        {hasContent && (
          <button onClick={handleCopy} className="text-neutral-300 hover:text-neutral-600">
            {copied ? <Check className="w-3.5 h-3.5 text-amber-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Sheets */}
      {showPromote && (
        <PromoteSheet
          onPromote={handlePromote}
          onSendToAI={() => { handlePromote("prompt"); setShowPromote(false); setShowSendToAI(true); }}
          onClose={() => setShowPromote(false)}
        />
      )}
      {showSendToAI && (
        <SendToAISheet promptText={bodyMd} onClose={() => setShowSendToAI(false)} />
      )}
      {showAIReview && (
        <AIReviewSheet bodyMd={bodyMd} onApply={(s) => { setBodyMd(s); setShowAIReview(false); }} onClose={() => setShowAIReview(false)} />
      )}
    </div>
  );
}

// --- Promote Sheet ---
function PromoteSheet({ onPromote, onSendToAI, onClose }: {
  onPromote: (t: DocumentType) => void;
  onSendToAI: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-1 bg-neutral-200 rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-lg text-center tracking-tight">Promptに昇格</h2>
        <p className="text-xs text-neutral-400 text-center">AI添削・公開・AIアプリへの送信ができます</p>

        <button onClick={() => onPromote("prompt")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-neutral-100 hover:border-amber-200 hover:bg-amber-50/30 transition">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <WandSparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-sm">Prompt</p>
            <p className="text-[11px] text-neutral-400">AIへの指示文として保存</p>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300" />
        </button>

        <button onClick={() => onPromote("template")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-neutral-100 hover:border-neutral-300 transition">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Copy className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-sm">Template</p>
            <p className="text-[11px] text-neutral-400">変数付きの再利用テンプレート</p>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300" />
        </button>

        <div className="pt-2">
          <button onClick={onSendToAI} className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <Send className="w-4 h-4" />
            昇格してAIに送る
          </button>
        </div>

        <button onClick={onClose} className="w-full text-center text-xs text-neutral-400 py-1">キャンセル</button>
      </div>
    </div>
  );
}

// --- Send to AI Sheet ---
function SendToAISheet({ promptText, onClose }: { promptText: string; onClose: () => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = (app: typeof AI_APPS[number]) => {
    navigator.clipboard.writeText(promptText);
    window.open(app.webUrl, "_blank");
    setCopiedId(app.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyOnly = () => {
    navigator.clipboard.writeText(promptText);
    setCopiedId("clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 space-y-2 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-1 bg-neutral-200 rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-lg text-center tracking-tight">AIに送る</h2>

        {/* Prompt preview */}
        <div className="bg-neutral-50 p-3 rounded-lg mb-2">
          <p className="text-[11px] text-neutral-400 mb-1">プロンプト</p>
          <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">{promptText}</p>
        </div>

        {/* AI app buttons */}
        <div className="space-y-1.5">
          {AI_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => handleSend(app)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 hover:border-neutral-300 transition active:scale-[0.99]"
            >
              <span className="text-xl w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-50">
                {app.icon}
              </span>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">{app.name}</p>
                <p className="text-[11px] text-neutral-400">コピーして開く</p>
              </div>
              {copiedId === app.id ? (
                <Check className="w-4 h-4 text-amber-500" />
              ) : (
                <ExternalLink className="w-4 h-4 text-neutral-300" />
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-neutral-100 pt-2">
          <button
            onClick={handleCopyOnly}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-neutral-50 transition"
          >
            <span className="w-9 h-9 flex items-center justify-center bg-neutral-100 rounded-lg">
              <Copy className="w-4 h-4 text-neutral-500" />
            </span>
            <div className="text-left flex-1">
              <p className="font-semibold text-sm">コピーのみ</p>
              <p className="text-[11px] text-neutral-400">クリップボードにコピー</p>
            </div>
            {copiedId === "clipboard" ? <Check className="w-4 h-4 text-amber-500" /> : null}
          </button>
        </div>

        <button onClick={onClose} className="w-full text-center text-xs text-neutral-400 py-1">閉じる</button>
      </div>
    </div>
  );
}

// --- AI Review Sheet ---
function AIReviewSheet({ bodyMd, onApply, onClose }: {
  bodyMd: string;
  onApply: (suggestion: string) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [scores, setScores] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [overall, setOverall] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const runReview = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setScores(data.scores);
      setOverall(data.overall);
      setSuggestion(data.suggestionMd);
      setState("done");
    } catch {
      setState("error");
    }
  };

  const gradeColor: Record<string, string> = {
    A: "text-neutral-900", B: "text-neutral-700", C: "text-amber-600", D: "text-red-500"
  };
  const axisLabels: Record<string, string> = {
    clarity: "明確性", specificity: "具体性", structure: "構造", context: "文脈", constraints: "制約"
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-1 bg-neutral-200 rounded-full mx-auto mb-3" />
        <h2 className="font-bold text-lg text-center tracking-tight mb-4">AI添削</h2>

        {state === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400 text-center">5つの軸でプロンプトを評価します</p>
            <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50">
              {Object.entries(axisLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  <span className="text-neutral-600">{label}</span>
                </div>
              ))}
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg">
              <p className="text-[11px] text-neutral-400 mb-1">対象</p>
              <p className="text-sm text-neutral-600 line-clamp-4 leading-relaxed">{bodyMd}</p>
            </div>
            <button onClick={runReview} className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <WandSparkles className="w-4 h-4" /> 添削する
            </button>
          </div>
        )}

        {state === "loading" && (
          <div className="text-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">添削中...</p>
          </div>
        )}

        {state === "done" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-[11px] text-neutral-400 mb-1">総合</p>
              <p className={`text-5xl font-bold ${gradeColor[overall] || ""}`}>{overall}</p>
            </div>

            <div className="space-y-2">
              {Object.entries(scores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="w-16 text-neutral-400 text-xs">{axisLabels[key] || key}</span>
                  <span className={`font-bold w-5 ${gradeColor[val.grade] || ""}`}>{val.grade}</span>
                  <span className="text-neutral-400 text-xs flex-1">{val.feedback}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
              <p className="font-semibold text-sm mb-2 text-amber-800">改善版</p>
              <div className="markdown-preview text-sm">
                <MarkdownPreview content={suggestion} />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(suggestion); }}
                className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 font-medium rounded-xl text-sm hover:bg-neutral-50"
              >
                コピー
              </button>
              <button
                onClick={() => onApply(suggestion)}
                className="flex-1 py-2.5 bg-neutral-900 text-white font-semibold rounded-xl text-sm active:scale-[0.98] transition-transform"
              >
                適用
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-neutral-300">
              <span>役立ちましたか？</span>
              <button className="p-2 hover:text-neutral-600 rounded-full"><ThumbsUp className="w-4 h-4" /></button>
              <button className="p-2 hover:text-neutral-600 rounded-full"><ThumbsDown className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="text-center py-12 space-y-3">
            <p className="text-neutral-400 text-sm">添削に失敗しました</p>
            <button onClick={runReview} className="text-amber-600 text-sm font-medium">再試行</button>
          </div>
        )}

        <button onClick={onClose} className="w-full text-center text-xs text-neutral-400 py-2 mt-2">閉じる</button>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-neutral-300 text-sm">読み込み中...</div>}>
      <EditorContent />
    </Suspense>
  );
}
