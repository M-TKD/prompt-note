"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { useToast } from "@/components/Toast";
import { useStore } from "@/lib/use-store";
import { useAuth } from "@/lib/auth-context";
import { DocumentType, DocumentVisibility, DocumentVersion, TYPE_CONFIG, AI_APPS, extractVariables, fillTemplate } from "@/lib/types";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  ArrowLeft, Eye, Pencil, WandSparkles, Send, ArrowUpCircle,
  Bold, Italic, Code, List, ListOrdered, Heading1, Heading2,
  Quote, Minus, Link2, Copy, Check, Globe, Lock,
  ChevronRight, ThumbsUp, ThumbsDown, ExternalLink,
  Share2, Download, Variable, History, RotateCcw, FolderPlus,
} from "lucide-react";
import { CollectionSheet } from "@/components/CollectionSheet";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hybridStore = useStore();
  const { toast } = useToast();
  const editId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [showVariables, setShowVariables] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number } | null>(null);

  // Load existing doc or restore draft
  useEffect(() => {
    const loadDocument = async () => {
      if (editId) {
        const doc = await hybridStore.getDocument(editId);
        if (doc) {
          setTitle(doc.title || "");
          setBodyMd(doc.bodyMd);
          setDocType(doc.type);
          setVisibility(doc.visibility);
          setTags(doc.tags);
        }
      } else if (!mode) {
        // Check for saved draft
        const draft = hybridStore.getDraft();
        if (draft && draft.bodyMd) {
          setTitle(draft.title);
          setBodyMd(draft.bodyMd);
          setDocType(draft.type as DocumentType);
          setTags(draft.tags);
          setDraftRestored(true);
          setTimeout(() => setDraftRestored(false), 2000);
        }
      }
    };
    loadDocument();
  }, [editId, mode, hybridStore]);

  // Auto-save draft every 3 seconds (only for new docs)
  useEffect(() => {
    if (editId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (bodyMd.trim()) {
      autoSaveTimer.current = setTimeout(() => {
        hybridStore.saveDraft({ title, bodyMd, type: docType, tags });
      }, 3000);
    }
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, bodyMd, docType, tags, editId, hybridStore]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bodyMd.trim() && !saved) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [bodyMd, saved]);

  const isQuickMemo = docType === "note" && !editId;
  const isNote = docType === "note";
  const isPrompt = docType === "prompt";
  const isTemplate = docType === "template";
  const hasContent = bodyMd.trim().length > 0;
  const wordCount = bodyMd.trim() ? bodyMd.trim().length : 0;
  const variables = extractVariables(bodyMd);

  const handleSave = useCallback(async () => {
    if (!hasContent) return;
    try {
      const data = {
        userId: "local",
        title: title || null,
        bodyMd,
        type: docType,
        visibility: isNote ? "private" as const : visibility,
        tags,
      };
      if (editId) {
        // Save version snapshot before updating (cloud only)
        await hybridStore.saveVersion(editId, title || null, bodyMd);
        await hybridStore.update(editId, data);
      } else {
        const created = await hybridStore.create(data);
        hybridStore.clearDraft();
        if (created?.id) {
          router.replace(`/editor?id=${created.id}`);
        }
      }
      setSaved(true);
      toast("保存しました");
      setTimeout(() => router.push("/"), 500);
    } catch {
      toast("エラーが発生しました", "error");
    }
  }, [editId, title, bodyMd, docType, visibility, tags, isNote, hasContent, router, hybridStore, toast]);

  const handlePromote = (newType: DocumentType) => {
    setDocType(newType);
    setShowPromote(false);
    toast("昇格しました");
  };

  const handleAddTag = () => {
    const tag = tagInput.replace(/[,、# ]/g, "").trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = bodyMd.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    setBodyMd(bodyMd.substring(0, start) + replacement + bodyMd.substring(end));
    // Restore focus
    setTimeout(() => { textarea.focus(); textarea.selectionStart = textarea.selectionEnd = start + replacement.length; }, 0);
  };

  // Insert a single character at cursor (for symbol bar)
  const insertChar = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = bodyMd.substring(0, start) + char + bodyMd.substring(end);
    setBodyMd(newBody);
    setTimeout(() => { textarea.focus(); textarea.selectionStart = textarea.selectionEnd = start + char.length; }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bodyMd);
    setCopied(true);
    toast("コピーしました", "copy");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "PromptNotes",
          text: bodyMd,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  const handleExport = () => {
    const filename = `${title || "prompt"}.md`;
    const blob = new Blob([bodyMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-[#1a1a1a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
        <button onClick={() => router.back()} className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#d1d5db] font-mono tracking-wider uppercase">
            {isQuickMemo ? "memo" : TYPE_CONFIG[docType].label}
          </span>
          {draftRestored && (
            <span className="text-[9px] text-[#4F46E5] font-mono">draft restored</span>
          )}
          {/* Quick actions in header */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-[10px] px-2 py-0.5 rounded font-mono text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          {hasContent && (
            <button onClick={() => setShowAIReview(true)} className="text-[10px] px-1.5 py-0.5 rounded font-mono text-[#6b7280] hover:text-[#4F46E5]">
              AI
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasContent}
          className={`text-xs font-medium px-4 py-1.5 rounded-full ${
            hasContent ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]" : "bg-[#f5f5f5] dark:bg-[#333] text-[#d1d5db]"
          }`}
        >
          {saved ? "✓" : "Save"}
        </button>
      </div>

      {/* Type & Visibility & Promote */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-[#f0f0f0] dark:border-[#333]">
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono tracking-wide ${
          isNote ? "bg-[#f5f5f5] dark:bg-[#333] text-[#9ca3af]" :
          isPrompt ? "bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5]" : "bg-[#f5f5f5] dark:bg-[#333] text-[#6b7280]"
        }`}>
          {TYPE_CONFIG[docType].label}
        </span>
        {!isNote && (
          <button
            onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
            className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-mono ${
              visibility === "public" ? "bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5]" : "bg-[#f5f5f5] dark:bg-[#333] text-[#9ca3af]"
            }`}
          >
            {visibility === "public" ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
            {visibility === "public" ? "public" : "private"}
          </button>
        )}
        {/* Variable count badge */}
        {variables.length > 0 && (
          <button
            onClick={() => setShowVariables(true)}
            className="text-[10px] px-2 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] flex items-center gap-1 font-mono"
          >
            <Variable className="w-2.5 h-2.5" />
            {variables.length} vars
          </button>
        )}

        <div className="flex-1" />

        {/* Boost — prominent position */}
        {isNote && hasContent && (
          <button
            onClick={() => setShowPromote(true)}
            className="text-[11px] flex items-center gap-1.5 bg-[#4F46E5] text-white px-3 py-1 rounded-full font-medium"
          >
            <ArrowUpCircle className="w-3 h-3" />
            Boost
          </button>
        )}
        {/* Send to AI — prominent position */}
        {(isPrompt || isTemplate) && hasContent && (
          <button
            onClick={() => setShowSendToAI(true)}
            className="text-[11px] flex items-center gap-1.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] px-3 py-1 rounded-full font-medium"
          >
            <Send className="w-3 h-3" />
            Send to AI
          </button>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isQuickMemo ? "Title（任意）" : "Title"}
        className="px-6 py-3 text-lg font-bold outline-none placeholder:text-[#e5e7eb] dark:placeholder:text-[#444] tracking-tight text-[#1a1a1a] dark:text-white bg-transparent"
      />

      {/* Tags */}
      <div className="px-6 py-1.5 flex items-center gap-1.5 flex-wrap border-b border-[#f0f0f0] dark:border-[#333]">
        {tags.map((tag) => (
          <span key={tag} className="text-[10px] text-[#6b7280] px-1.5 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#333] flex items-center gap-1 font-mono">
            #{tag}
            <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-[#d1d5db] hover:text-[#6b7280]">✕</button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " " || e.key === ",") { e.preventDefault(); handleAddTag(); } }}
          placeholder="tag..."
          className="text-[10px] outline-none min-w-[60px] flex-1 text-[#9ca3af] placeholder:text-[#e5e7eb] dark:placeholder:text-[#444] bg-transparent font-mono"
        />
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-auto">
        {showPreview ? (
          <div className="p-6 markdown-preview">
            <MarkdownPreview content={bodyMd} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            placeholder={isQuickMemo ? "Write something..." : "Write in Markdown...\n\nUse {{variable}} for template variables"}
            className="w-full h-full p-6 outline-none resize-none font-mono text-sm leading-relaxed text-[#404040] dark:text-[#e5e7eb] placeholder:text-[#e5e7eb] dark:placeholder:text-[#444] bg-transparent"
            autoFocus
          />
        )}
      </div>

      {/* Unified Toolbar — keyboard-attached, single row */}
      <div className="border-t border-[#f0f0f0] dark:border-[#333] bg-white dark:bg-[#1a1a1a]">
        {/* Row 1: Markdown symbols (scrollable) — always visible */}
        {!showPreview && (
          <div className="flex items-center px-1 py-0.5 overflow-x-auto no-scrollbar">
            {["#", "*", "_", "+", "-", "`", "<", ">", "!", "[", "]", "(", ")", "|", "~", "{{"].map((char) => (
              <button
                key={char}
                onClick={() => char === "{{" ? insertMarkdown("{{", "}}") : insertChar(char)}
                className="min-w-[34px] h-9 flex items-center justify-center text-[14px] font-mono text-[#6b7280] hover:text-[#1a1a1a] dark:hover:text-white active:bg-[#f0f0f0] dark:active:bg-[#333] rounded"
              >
                {char}
              </button>
            ))}
          </div>
        )}
        {/* Row 2: Semantic + actions (scrollable) */}
        <div className="flex items-center px-1 py-1 overflow-x-auto no-scrollbar gap-0.5 border-t border-[#f5f5f5] dark:border-[#333]">
          {!showPreview && (
            <>
              {[
                { icon: <Heading1 className="w-3.5 h-3.5" />, action: () => insertMarkdown("# ") },
                { icon: <Heading2 className="w-3.5 h-3.5" />, action: () => insertMarkdown("## ") },
                { icon: <Bold className="w-3.5 h-3.5" />, action: () => insertMarkdown("**", "**") },
                { icon: <Italic className="w-3.5 h-3.5" />, action: () => insertMarkdown("_", "_") },
                { icon: <Code className="w-3.5 h-3.5" />, action: () => insertMarkdown("```\n", "\n```") },
                { icon: <List className="w-3.5 h-3.5" />, action: () => insertMarkdown("- ") },
                { icon: <Quote className="w-3.5 h-3.5" />, action: () => insertMarkdown("> ") },
                { icon: <Link2 className="w-3.5 h-3.5" />, action: () => insertMarkdown("[", "](URL)") },
                { icon: <Minus className="w-3.5 h-3.5" />, action: () => insertMarkdown("\n---\n") },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} className="p-2 text-[#9ca3af] dark:text-[#6b7280] hover:text-[#1a1a1a] dark:hover:text-white active:bg-[#f0f0f0] dark:active:bg-[#333] rounded">
                  {btn.icon}
                </button>
              ))}
              {/* Separator */}
              <div className="w-px h-5 bg-[#e5e7eb] dark:bg-[#444] mx-1 shrink-0" />
            </>
          )}
          {/* Actions */}
          {hasContent && (
            <button onClick={handleCopy} className="p-2 text-[#9ca3af] hover:text-[#6b7280] active:bg-[#f0f0f0] dark:active:bg-[#333] rounded">
              {copied ? <Check className="w-3.5 h-3.5 text-[#4F46E5]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
          {hasContent && (
            <button onClick={handleShare} className="p-2 text-[#9ca3af] hover:text-[#6b7280] active:bg-[#f0f0f0] dark:active:bg-[#333] rounded">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          {hasContent && (
            <button onClick={handleExport} className="p-2 text-[#9ca3af] hover:text-[#6b7280] active:bg-[#f0f0f0] dark:active:bg-[#333] rounded">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {hasContent && editId && (
            <button onClick={() => setShowCollectionSheet(true)} className="p-2 text-[#9ca3af] hover:text-[#4F46E5] active:bg-[#f0f0f0] dark:active:bg-[#333] rounded">
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}
          {editId && hybridStore.isCloud && (
            <button onClick={() => setShowVersionHistory(true)} className="p-2 text-[#9ca3af] hover:text-[#6b7280] active:bg-[#f0f0f0] dark:active:bg-[#333] rounded">
              <History className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Word count */}
          <span className="ml-auto text-[9px] text-[#d1d5db] font-mono pr-2 whitespace-nowrap shrink-0">{wordCount}字</span>
        </div>
      </div>

      {/* Sheets */}
      {showPromote && (
        <PromoteSheet
          onPromote={handlePromote}
          onSendToAI={() => { handlePromote("prompt"); setShowPromote(false); setShowSendToAI(true); }}
          onClose={() => setShowPromote(false)}
        />
      )}
      {showSendToAI && <SendToAISheet promptText={bodyMd} onClose={() => setShowSendToAI(false)} />}
      {showAIReview && <AIReviewSheet bodyMd={bodyMd} onApply={(s) => { setBodyMd(s); setShowAIReview(false); }} onClose={() => setShowAIReview(false)} onUsageUpdate={setAiUsage} onLimitReached={() => { setShowAIReview(false); setShowUpgradeModal(true); }} />}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      {showVariables && <VariablesSheet bodyMd={bodyMd} onFill={(filled) => { setBodyMd(filled); setShowVariables(false); }} onClose={() => setShowVariables(false)} />}
      {showVersionHistory && editId && (
        <VersionHistorySheet
          documentId={editId}
          onRestore={(v) => {
            setTitle(v.title || "");
            setBodyMd(v.bodyMd);
            setShowVersionHistory(false);
            toast("バージョンを復元しました");
          }}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
      {showCollectionSheet && editId && <CollectionSheet documentId={editId} onClose={() => setShowCollectionSheet(false)} />}
    </div>
  );
}

// --- Variables Sheet ---
function VariablesSheet({ bodyMd, onFill, onClose }: { bodyMd: string; onFill: (filled: string) => void; onClose: () => void }) {
  const { toast } = useToast();
  const vars = extractVariables(bodyMd);
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-6 space-y-3 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-base text-center tracking-tight dark:text-white">Template Variables</h2>
        <p className="text-[11px] text-[#9ca3af] text-center font-mono">Fill in values to generate prompt</p>

        <div className="space-y-3 mt-4">
          {vars.map((v) => (
            <div key={v.name}>
              <label className="text-[11px] font-mono text-[#6b7280] mb-1 block">{`{{${v.name}}}`}</label>
              <input
                type="text"
                value={values[v.name] || ""}
                onChange={(e) => setValues({ ...values, [v.name]: e.target.value })}
                placeholder={v.name}
                className="w-full px-3 py-2 border border-[#f0f0f0] dark:border-[#333] rounded-lg text-sm outline-none focus:border-[#4F46E5] dark:bg-[#222] dark:text-white font-mono"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              const filled = fillTemplate(bodyMd, values);
              navigator.clipboard.writeText(filled);
              toast("コピーしました", "copy");
            }}
            className="flex-1 py-2.5 border border-[#f0f0f0] dark:border-[#333] text-[#6b7280] font-medium rounded-xl text-xs"
          >
            Copy filled
          </button>
          <button
            onClick={() => onFill(fillTemplate(bodyMd, values))}
            className="flex-1 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-xs"
          >
            Apply
          </button>
        </div>
        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-1">Cancel</button>
      </div>
    </div>
  );
}

// --- Promote Sheet ---
function PromoteSheet({ onPromote, onSendToAI, onClose }: { onPromote: (t: DocumentType) => void; onSendToAI: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-base text-center tracking-tight dark:text-white">Boost</h2>
        <p className="text-[11px] text-[#9ca3af] text-center font-mono">メモをPromptに昇格 → AI添削・共有・送信</p>
        <button onClick={() => onPromote("prompt")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#f0f0f0] dark:border-[#333] hover:border-[#4F46E5]/30 hover:bg-[#EEF2FF]/20 dark:hover:bg-[#222]">
          <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 flex items-center justify-center"><WandSparkles className="w-4 h-4 text-[#4F46E5]" /></div>
          <div className="text-left flex-1"><p className="font-medium text-sm dark:text-white">Prompt</p><p className="text-[10px] text-[#9ca3af] font-mono">Save as AI instruction</p></div>
          <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
        </button>
        <button onClick={() => onPromote("template")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#f0f0f0] dark:border-[#333] hover:border-[#9ca3af]/30 dark:hover:bg-[#222]">
          <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center"><Copy className="w-4 h-4 text-[#6b7280]" /></div>
          <div className="text-left flex-1"><p className="font-medium text-sm dark:text-white">Template</p><p className="text-[10px] text-[#9ca3af] font-mono">{"Reusable with {{variables}}"}</p></div>
          <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
        </button>
        <div className="pt-2">
          <button onClick={onSendToAI} className="w-full py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-sm flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Boost & Send to AI
          </button>
        </div>
        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-1">Cancel</button>
      </div>
    </div>
  );
}

// --- AI Logo SVGs ---
const AI_LOGOS: Record<string, React.ReactNode> = {
  chatgpt: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#10a37f"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>,
  claude: <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero"/></svg>,
  gemini: <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#g-fill-0s)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#g-fill-1s)"/><defs><linearGradient gradientUnits="userSpaceOnUse" id="g-fill-0s" x1="7" x2="11" y1="15.5" y2="12"><stop stopColor="#08B962"/><stop offset="1" stopColor="#08B962" stopOpacity="0"/></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="g-fill-1s" x1="8" x2="11.5" y1="5.5" y2="11"><stop stopColor="#F94543"/><stop offset="1" stopColor="#F94543" stopOpacity="0"/></linearGradient></defs></svg>,
  copilot: <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.533 1.829A2.528 2.528 0 0015.11 0h-.737a2.531 2.531 0 00-2.484 2.087l-1.263 6.937.314-1.08a2.528 2.528 0 012.424-1.833h4.284l1.797.706 1.731-.706h-.505a2.528 2.528 0 01-2.423-1.829l-.715-2.453z" fill="url(#cps-0)" transform="translate(0 1)"/><path d="M6.726 20.16A2.528 2.528 0 009.152 22h1.566c1.37 0 2.49-1.1 2.525-2.48l.17-6.69-.357 1.228a2.528 2.528 0 01-2.423 1.83h-4.32l-1.54-.842-1.667.843h.497c1.124 0 2.113.75 2.426 1.84l.697 2.432z" fill="url(#cps-1)" transform="translate(0 1)"/><path d="M15 0H6.252c-2.5 0-4 3.331-5 6.662-1.184 3.947-2.734 9.225 1.75 9.225H6.78c1.13 0 2.12-.753 2.43-1.847.657-2.317 1.809-6.359 2.713-9.436.46-1.563.842-2.906 1.43-3.742A1.97 1.97 0 0115 0" fill="url(#cps-2)" transform="translate(0 1)"/><path d="M9 22h8.749c2.5 0 4-3.332 5-6.663 1.184-3.948 2.734-9.227-1.75-9.227H17.22c-1.129 0-2.12.754-2.43 1.848a1149.2 1149.2 0 01-2.713 9.437c-.46 1.564-.842 2.907-1.43 3.743A1.97 1.97 0 019 22" fill="url(#cps-4)" transform="translate(0 1)"/><defs><radialGradient cx="85.44%" cy="100.653%" fx="85.44%" fy="100.653%" gradientTransform="scale(-.8553 -1) rotate(50.927 2.041 -1.946)" id="cps-0" r="105.116%"><stop offset="9.6%" stopColor="#00AEFF"/><stop offset="77.3%" stopColor="#2253CE"/><stop offset="100%" stopColor="#0736C4"/></radialGradient><radialGradient cx="18.143%" cy="32.928%" fx="18.143%" fy="32.928%" gradientTransform="scale(.8897 1) rotate(52.069 .193 .352)" id="cps-1" r="95.612%"><stop offset="0%" stopColor="#FFB657"/><stop offset="63.4%" stopColor="#FF5F3D"/><stop offset="92.3%" stopColor="#C02B3C"/></radialGradient><linearGradient id="cps-2" x1="39.465%" x2="46.884%" y1="12.117%" y2="103.774%"><stop offset="15.6%" stopColor="#0D91E1"/><stop offset="48.7%" stopColor="#52B471"/><stop offset="65.2%" stopColor="#98BD42"/><stop offset="93.7%" stopColor="#FFC800"/></linearGradient><radialGradient cx="82.987%" cy="-9.792%" fx="82.987%" fy="-9.792%" gradientTransform="scale(-1 -.9441) rotate(-70.872 .142 1.17)" id="cps-4" r="140.622%"><stop offset="6.6%" stopColor="#8C48FF"/><stop offset="50%" stopColor="#F2598A"/><stop offset="89.6%" stopColor="#FFB152"/></radialGradient></defs></svg>,
  perplexity: <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z" fill="#22B8CD" fillRule="nonzero"/></svg>,
  grok: <svg className="w-5 h-5 text-[#1a1a1a] dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
};

// --- Send to AI Sheet ---
function SendToAISheet({ promptText, onClose }: { promptText: string; onClose: () => void }) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleSend = (app: typeof AI_APPS[number]) => {
    navigator.clipboard.writeText(promptText);
    window.open(app.webUrl, "_blank");
    setCopiedId(app.id);
    toast("コピーしました", "copy");
    setTimeout(() => setCopiedId(null), 2000);
  };
  const handleCopyOnly = () => {
    navigator.clipboard.writeText(promptText);
    setCopiedId("clipboard");
    toast("コピーしました", "copy");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-6 space-y-2 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-base text-center tracking-tight dark:text-white">Send to AI</h2>
        <div className="bg-[#fafafa] dark:bg-[#222] p-3 rounded-lg mb-2 border border-[#f0f0f0] dark:border-[#333]">
          <p className="text-[10px] text-[#9ca3af] mb-1 font-mono uppercase tracking-wider">Prompt</p>
          <p className="text-sm text-[#404040] dark:text-[#e5e7eb] line-clamp-3 leading-relaxed">{promptText}</p>
        </div>
        <div className="space-y-1">
          {AI_APPS.map((app) => (
            <button key={app.id} onClick={() => handleSend(app)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#f0f0f0] dark:border-[#333] hover:border-[#d1d5db] dark:hover:border-[#444]">
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#fafafa] dark:bg-[#222]">{AI_LOGOS[app.id] || app.icon}</span>
              <div className="text-left flex-1"><p className="font-medium text-sm dark:text-white">{app.name}</p><p className="text-[10px] text-[#9ca3af] font-mono">Copy & open</p></div>
              {copiedId === app.id ? <Check className="w-4 h-4 text-[#4F46E5]" /> : <ExternalLink className="w-4 h-4 text-[#d1d5db]" />}
            </button>
          ))}
        </div>
        <div className="border-t border-[#f0f0f0] dark:border-[#333] pt-2">
          <button onClick={handleCopyOnly} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafafa] dark:hover:bg-[#222]">
            <span className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] dark:bg-[#333] rounded-lg"><Copy className="w-4 h-4 text-[#6b7280]" /></span>
            <div className="text-left flex-1"><p className="font-medium text-sm dark:text-white">Copy only</p><p className="text-[10px] text-[#9ca3af] font-mono">To clipboard</p></div>
            {copiedId === "clipboard" ? <Check className="w-4 h-4 text-[#4F46E5]" /> : null}
          </button>
        </div>
        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-1">Close</button>
      </div>
    </div>
  );
}

// --- AI Review Sheet ---
function AIReviewSheet({ bodyMd, onApply, onClose, onUsageUpdate, onLimitReached }: { bodyMd: string; onApply: (suggestion: string) => void; onClose: () => void; onUsageUpdate?: (usage: { used: number; limit: number }) => void; onLimitReached?: () => void }) {
  const { toast } = useToast();
  const { session } = useAuth();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [scores, setScores] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [overall, setOverall] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const hasOwnKey = typeof window !== "undefined" && !!localStorage.getItem("promptnote_ai_apikey");

  const runReview = async () => {
    setState("loading");
    try {
      const provider = typeof window !== "undefined" ? localStorage.getItem("promptnote_ai_provider") || "" : "";
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("promptnote_ai_apikey") || "" : "";
      const accessToken = session?.access_token || "";

      const res = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd, provider, apiKey, accessToken }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === "free_limit_reached") {
          setIsLimitReached(true);
          const u = { used: errData.usage, limit: errData.limit };
          setUsage(u);
          onUsageUpdate?.(u);
          if (onLimitReached) {
            onLimitReached();
            return;
          }
          setState("error");
          setErrorMsg(errData.message);
          return;
        }
        throw new Error(errData.error || "Failed");
      }

      const data = await res.json();
      setScores(data.scores);
      setOverall(data.overall);
      setSuggestion(data.suggestionMd);
      if (data._usage) {
        setUsage(data._usage);
        onUsageUpdate?.(data._usage);
      }
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Review failed");
      setState("error");
    }
  };

  const gradeColor: Record<string, string> = { A: "text-[#1a1a1a] dark:text-white", B: "text-[#404040] dark:text-[#ccc]", C: "text-[#4F46E5]", D: "text-red-500" };
  const axisLabels: Record<string, string> = { clarity: "Clarity", specificity: "Specificity", structure: "Structure", context: "Context", constraints: "Constraints" };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-6 max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-3" />
        <h2 className="font-bold text-base text-center tracking-tight mb-4 dark:text-white">AI Review</h2>
        {state === "idle" && (
          <div className="space-y-4">
            <p className="text-xs text-[#9ca3af] text-center font-mono">5つの軸でプロンプトを評価</p>
            <div className="space-y-1.5 p-3 rounded-lg bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333]">
              {Object.entries(axisLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs"><span className="w-1 h-1 rounded-full bg-[#4F46E5]" /><span className="text-[#6b7280] font-mono">{label}</span></div>
              ))}
            </div>
            {!hasOwnKey && (
              <p className="text-[10px] text-[#9ca3af] text-center">
                月10回まで無料 {usage ? `（${usage.used}/${usage.limit} 使用済み）` : ""}
              </p>
            )}
            <button onClick={runReview} className="w-full py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-sm flex items-center justify-center gap-2">
              <WandSparkles className="w-4 h-4" /> {hasOwnKey ? "Run Review" : "無料でReview"}
            </button>
          </div>
        )}
        {state === "loading" && (
          <div className="text-center py-16"><div className="animate-spin w-5 h-5 border-2 border-[#1a1a1a] dark:border-white border-t-transparent rounded-full mx-auto mb-4" /><p className="text-[#9ca3af] text-xs font-mono">AIが分析中...</p></div>
        )}
        {state === "done" && (
          <div className="space-y-4">
            <div className="text-center py-4"><p className="text-[10px] text-[#9ca3af] mb-1 font-mono uppercase tracking-wider">Overall</p><p className={`text-4xl font-bold ${gradeColor[overall] || ""}`}>{overall}</p></div>
            <div className="space-y-2">
              {Object.entries(scores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs"><span className="w-20 text-[#9ca3af] font-mono text-[11px]">{axisLabels[key] || key}</span><span className={`font-bold w-5 ${gradeColor[val.grade] || ""}`}>{val.grade}</span><span className="text-[#9ca3af] text-[11px] flex-1">{val.feedback}</span></div>
              ))}
            </div>
            <div className="bg-[#EEF2FF]/30 dark:bg-[#4F46E5]/10 border border-[#EEF2FF] dark:border-[#4F46E5]/20 p-4 rounded-xl">
              <p className="font-medium text-xs mb-2 text-[#4F46E5] font-mono uppercase tracking-wider">Improved</p>
              <div className="markdown-preview text-sm"><MarkdownPreview content={suggestion} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(suggestion); toast("コピーしました", "copy"); }} className="flex-1 py-2.5 border border-[#f0f0f0] dark:border-[#333] text-[#6b7280] font-medium rounded-xl text-xs">Copy</button>
              <button onClick={() => onApply(suggestion)} className="flex-1 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-xs">Apply</button>
            </div>
            {usage && !hasOwnKey && (
              <p className="text-[10px] text-[#9ca3af] text-center font-mono">今月 {usage.used}/{usage.limit} 回使用</p>
            )}
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#d1d5db]">
              <span className="font-mono">Helpful?</span>
              <button className="p-2 hover:text-[#1a1a1a] dark:hover:text-white"><ThumbsUp className="w-3.5 h-3.5" /></button>
              <button className="p-2 hover:text-[#1a1a1a] dark:hover:text-white"><ThumbsDown className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
        {state === "error" && (
          <div className="text-center py-12 space-y-3">
            <p className="text-[#9ca3af] text-xs font-mono">{errorMsg || "Review failed"}</p>
            {isLimitReached && (
              <div className="space-y-2">
                <p className="text-[10px] text-[#9ca3af]">Settings で自分のAPIキーを設定すると無制限に利用できます</p>
                <a href="/settings" className="inline-block text-[#4F46E5] text-xs font-medium">Settings →</a>
              </div>
            )}
            {errorMsg.includes("APIキー") && <p className="text-[10px] text-[#d1d5db]">Settings → AI Review でキーを設定してください</p>}
            {!isLimitReached && <button onClick={runReview} className="text-[#4F46E5] text-xs font-medium">Retry</button>}
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-2 mt-2">Close</button>
      </div>
    </div>
  );
}

// --- Version History Sheet ---
function VersionHistorySheet({
  documentId,
  onRestore,
  onClose,
}: {
  documentId: string;
  onRestore: (version: DocumentVersion) => void;
  onClose: () => void;
}) {
  const hybridStore = useStore();
  const { toast } = useToast();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    hybridStore.getVersions(documentId).then((v) => {
      setVersions(v);
      setLoading(false);
    });
  }, [documentId, hybridStore]);

  const handleRestore = async (version: DocumentVersion) => {
    setRestoring(true);
    const success = await hybridStore.restoreVersion(documentId, version.id);
    if (success) {
      onRestore(version);
    } else {
      toast("復元に失敗しました", "error");
    }
    setRestoring(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const getPreview = (bodyMd: string) => {
    const firstLine = bodyMd.split("\n").find((l) => l.trim()) || "";
    return firstLine.replace(/^#+\s*/, "").slice(0, 60);
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl p-6 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-8 h-0.5 bg-[#e5e7eb] dark:bg-[#444] rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-base text-center tracking-tight dark:text-white">履歴</h2>
        <p className="text-[11px] text-[#9ca3af] text-center font-mono mb-4">Version History</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-5 h-5 border-2 border-[#1a1a1a] dark:border-white border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-[#9ca3af] text-xs font-mono">読み込み中...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-8 h-8 text-[#e5e7eb] dark:text-[#444] mx-auto mb-3" />
            <p className="text-[#9ca3af] text-xs font-mono">バージョン履歴はまだありません</p>
            <p className="text-[#d1d5db] text-[10px] font-mono mt-1">保存するたびに履歴が作成されます</p>
          </div>
        ) : selectedVersion ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedVersion(null)}
              className="text-[11px] text-[#9ca3af] font-mono flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> 一覧に戻る
            </button>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#4F46E5] bg-[#EEF2FF] dark:bg-[#4F46E5]/20 px-2 py-0.5 rounded">
                  v{selectedVersion.versionNumber}
                </span>
                <span className="text-[10px] text-[#9ca3af] font-mono ml-2">
                  {formatDate(selectedVersion.createdAt)}
                </span>
              </div>
            </div>
            {selectedVersion.title && (
              <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">{selectedVersion.title}</p>
            )}
            <div className="bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] rounded-lg p-4 max-h-[40vh] overflow-auto">
              <pre className="text-xs font-mono text-[#404040] dark:text-[#e5e7eb] whitespace-pre-wrap leading-relaxed">
                {selectedVersion.bodyMd}
              </pre>
            </div>
            <button
              onClick={() => handleRestore(selectedVersion)}
              disabled={restoring}
              className="w-full py-3 bg-[#4F46E5] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              {restoring ? "復元中..." : "この版に戻す"}
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVersion(v)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#f0f0f0] dark:border-[#333] hover:border-[#d1d5db] dark:hover:border-[#444] text-left"
              >
                <span className="text-[10px] font-mono text-[#4F46E5] bg-[#EEF2FF] dark:bg-[#4F46E5]/20 px-2 py-0.5 rounded min-w-[36px] text-center">
                  v{v.versionNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1a1a1a] dark:text-white truncate">
                    {getPreview(v.bodyMd) || "（空）"}
                  </p>
                  <p className="text-[10px] text-[#9ca3af] font-mono">{formatDate(v.createdAt)}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-[#d1d5db] flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-2 mt-2">
          Close
        </button>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#d1d5db] text-xs font-mono">Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
