"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { store } from "@/lib/store";
import { DocumentType, DocumentVisibility, TYPE_CONFIG, AI_APPS, extractVariables, fillTemplate } from "@/lib/types";
import {
  ArrowLeft, Eye, Pencil, WandSparkles, Send, ArrowUpCircle,
  Bold, Italic, Code, List, ListOrdered, Heading1, Heading2,
  Quote, Minus, Link2, Copy, Check, Globe, Lock,
  ChevronRight, ThumbsUp, ThumbsDown, ExternalLink,
  Share2, Download, Variable,
} from "lucide-react";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Load existing doc or restore draft
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
    } else if (!mode) {
      // Check for saved draft
      const draft = store.getDraft();
      if (draft && draft.bodyMd) {
        setTitle(draft.title);
        setBodyMd(draft.bodyMd);
        setDocType(draft.type as DocumentType);
        setTags(draft.tags);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 2000);
      }
    }
  }, [editId, mode]);

  // Auto-save draft every 3 seconds (only for new docs)
  useEffect(() => {
    if (editId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (bodyMd.trim()) {
      autoSaveTimer.current = setTimeout(() => {
        store.saveDraft({ title, bodyMd, type: docType, tags });
      }, 3000);
    }
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, bodyMd, docType, tags, editId]);

  const isQuickMemo = docType === "note" && !editId;
  const isNote = docType === "note";
  const isPrompt = docType === "prompt";
  const isTemplate = docType === "template";
  const hasContent = bodyMd.trim().length > 0;
  const wordCount = bodyMd.trim() ? bodyMd.trim().length : 0;
  const variables = extractVariables(bodyMd);

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
      store.clearDraft();
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
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    setBodyMd(bodyMd.substring(0, start) + replacement + bodyMd.substring(end));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bodyMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "PromptNote",
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <button onClick={() => router.back()} className="text-[#9ca3af] hover:text-[#1a1a1a]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#d1d5db] font-mono tracking-wider uppercase">
            {isQuickMemo ? "memo" : TYPE_CONFIG[docType].label}
          </span>
          {draftRestored && (
            <span className="text-[9px] text-[#4F46E5] font-mono">draft restored</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasContent}
          className={`text-xs font-medium px-4 py-1.5 rounded-full ${
            hasContent ? "bg-[#1a1a1a] text-white" : "bg-[#f5f5f5] text-[#d1d5db]"
          }`}
        >
          {saved ? "✓" : "Save"}
        </button>
      </div>

      {/* Type & Visibility */}
      {!isQuickMemo && (
        <div className="px-4 py-2 flex items-center gap-2 border-b border-[#f0f0f0]">
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono tracking-wide ${
            isNote ? "bg-[#f5f5f5] text-[#9ca3af]" :
            isPrompt ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#f5f5f5] text-[#6b7280]"
          }`}>
            {TYPE_CONFIG[docType].label}
          </span>
          {!isNote && (
            <button
              onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
              className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-mono ${
                visibility === "public" ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#f5f5f5] text-[#9ca3af]"
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
              className="text-[10px] px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] flex items-center gap-1 font-mono ml-auto"
            >
              <Variable className="w-2.5 h-2.5" />
              {variables.length} vars
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
          placeholder="Title"
          className="px-6 py-3 text-lg font-bold outline-none placeholder:text-[#e5e7eb] tracking-tight text-[#1a1a1a]"
        />
      )}

      {/* Tags */}
      {!isQuickMemo && (
        <div className="px-6 py-1.5 flex items-center gap-1.5 flex-wrap border-b border-[#f0f0f0]">
          {tags.map((tag) => (
            <span key={tag} className="text-[10px] text-[#6b7280] px-1.5 py-0.5 rounded bg-[#f5f5f5] flex items-center gap-1 font-mono">
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
            className="text-[10px] outline-none min-w-[60px] flex-1 text-[#9ca3af] placeholder:text-[#e5e7eb] font-mono"
          />
        </div>
      )}

      {/* Editor / Preview */}
      <div className="flex-1 overflow-auto">
        {showPreview ? (
          <div className="p-6 markdown-preview">
            <MarkdownPreview content={bodyMd} />
          </div>
        ) : (
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            placeholder={isQuickMemo ? "Write something..." : "Write in Markdown...\n\nUse {{variable}} for template variables"}
            className="w-full h-full p-6 outline-none resize-none font-mono text-sm leading-relaxed text-[#404040] placeholder:text-[#e5e7eb]"
            autoFocus
          />
        )}
      </div>

      {/* Markdown toolbar */}
      {!showPreview && (
        <div className="flex items-center gap-0 px-1 py-0.5 border-t border-[#f0f0f0] overflow-x-auto">
          {[
            { icon: <Heading1 className="w-3.5 h-3.5" />, action: () => insertMarkdown("# ") },
            { icon: <Heading2 className="w-3.5 h-3.5" />, action: () => insertMarkdown("## ") },
            { icon: <Bold className="w-3.5 h-3.5" />, action: () => insertMarkdown("**", "**") },
            { icon: <Italic className="w-3.5 h-3.5" />, action: () => insertMarkdown("_", "_") },
            { icon: <Code className="w-3.5 h-3.5" />, action: () => insertMarkdown("`", "`") },
            { icon: <List className="w-3.5 h-3.5" />, action: () => insertMarkdown("- ") },
            { icon: <ListOrdered className="w-3.5 h-3.5" />, action: () => insertMarkdown("1. ") },
            { icon: <Quote className="w-3.5 h-3.5" />, action: () => insertMarkdown("> ") },
            { icon: <Minus className="w-3.5 h-3.5" />, action: () => insertMarkdown("\n---\n") },
            { icon: <Link2 className="w-3.5 h-3.5" />, action: () => insertMarkdown("[", "](URL)") },
            { icon: <Variable className="w-3.5 h-3.5" />, action: () => insertMarkdown("{{", "}}") },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} className="p-2 text-[#d1d5db] hover:text-[#1a1a1a] rounded">
              {btn.icon}
            </button>
          ))}
          {/* Word count */}
          <span className="ml-auto text-[9px] text-[#d1d5db] font-mono pr-2">{wordCount}字</span>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex items-center gap-2.5 px-4 py-2 border-t border-[#f0f0f0]">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-[11px] flex items-center gap-1 text-[#9ca3af] font-mono"
        >
          {showPreview ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showPreview ? "edit" : "preview"}
        </button>

        <div className="flex-1" />

        {/* Note → Prompt promotion */}
        {isNote && hasContent && (
          <button onClick={() => setShowPromote(true)} className="text-[11px] flex items-center gap-1 text-[#4F46E5] font-medium">
            <ArrowUpCircle className="w-3 h-3" />
            Promote
          </button>
        )}

        {/* AI Review */}
        {hasContent && (
          <button onClick={() => setShowAIReview(true)} className="text-[11px] flex items-center gap-1 text-[#6b7280] font-mono">
            <WandSparkles className="w-3 h-3" />
            AI
          </button>
        )}

        {/* Share */}
        {hasContent && (
          <button onClick={handleShare} className="text-[#9ca3af] hover:text-[#6b7280]">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Export */}
        {hasContent && (
          <button onClick={handleExport} className="text-[#9ca3af] hover:text-[#6b7280]">
            <Download className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Send to AI */}
        {(isPrompt || isTemplate) && hasContent && (
          <button onClick={() => setShowSendToAI(true)} className="text-[11px] flex items-center gap-1.5 bg-[#1a1a1a] text-white px-3 py-1.5 rounded-full font-medium">
            <Send className="w-3 h-3" />
            AI
          </button>
        )}

        {/* Copy */}
        {hasContent && (
          <button onClick={handleCopy} className="text-[#d1d5db] hover:text-[#6b7280]">
            {copied ? <Check className="w-3.5 h-3.5 text-[#4F46E5]" /> : <Copy className="w-3.5 h-3.5" />}
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
      {showSendToAI && <SendToAISheet promptText={bodyMd} onClose={() => setShowSendToAI(false)} />}
      {showAIReview && <AIReviewSheet bodyMd={bodyMd} onApply={(s) => { setBodyMd(s); setShowAIReview(false); }} onClose={() => setShowAIReview(false)} />}
      {showVariables && <VariablesSheet bodyMd={bodyMd} onFill={(filled) => { setBodyMd(filled); setShowVariables(false); }} onClose={() => setShowVariables(false)} />}
    </div>
  );
}

// --- Variables Sheet ---
function VariablesSheet({ bodyMd, onFill, onClose }: { bodyMd: string; onFill: (filled: string) => void; onClose: () => void }) {
  const vars = extractVariables(bodyMd);
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 space-y-3 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-base text-center tracking-tight">Template Variables</h2>
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
                className="w-full px-3 py-2 border border-[#f0f0f0] rounded-lg text-sm outline-none focus:border-[#4F46E5] font-mono"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              const filled = fillTemplate(bodyMd, values);
              navigator.clipboard.writeText(filled);
            }}
            className="flex-1 py-2.5 border border-[#f0f0f0] text-[#6b7280] font-medium rounded-xl text-xs"
          >
            Copy filled
          </button>
          <button
            onClick={() => onFill(fillTemplate(bodyMd, values))}
            className="flex-1 py-2.5 bg-[#1a1a1a] text-white font-medium rounded-xl text-xs"
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
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-base text-center tracking-tight">Promote to Prompt</h2>
        <p className="text-[11px] text-[#9ca3af] text-center font-mono">AI review, sharing, and send to AI apps</p>
        <button onClick={() => onPromote("prompt")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#f0f0f0] hover:border-[#4F46E5]/30 hover:bg-[#EEF2FF]/20">
          <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center"><WandSparkles className="w-4 h-4 text-[#4F46E5]" /></div>
          <div className="text-left flex-1"><p className="font-medium text-sm">Prompt</p><p className="text-[10px] text-[#9ca3af] font-mono">Save as AI instruction</p></div>
          <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
        </button>
        <button onClick={() => onPromote("template")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#f0f0f0] hover:border-[#9ca3af]/30">
          <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center"><Copy className="w-4 h-4 text-[#6b7280]" /></div>
          <div className="text-left flex-1"><p className="font-medium text-sm">Template</p><p className="text-[10px] text-[#9ca3af] font-mono">{"Reusable with {{variables}}"}</p></div>
          <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
        </button>
        <div className="pt-2">
          <button onClick={onSendToAI} className="w-full py-3 bg-[#1a1a1a] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Promote & Send to AI
          </button>
        </div>
        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-1">Cancel</button>
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
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 space-y-2 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] rounded-full mx-auto mb-2" />
        <h2 className="font-bold text-base text-center tracking-tight">Send to AI</h2>
        <div className="bg-[#fafafa] p-3 rounded-lg mb-2 border border-[#f0f0f0]">
          <p className="text-[10px] text-[#9ca3af] mb-1 font-mono uppercase tracking-wider">Prompt</p>
          <p className="text-sm text-[#404040] line-clamp-3 leading-relaxed">{promptText}</p>
        </div>
        <div className="space-y-1">
          {AI_APPS.map((app) => (
            <button key={app.id} onClick={() => handleSend(app)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#f0f0f0] hover:border-[#d1d5db]">
              <span className="text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-[#fafafa]">{app.icon}</span>
              <div className="text-left flex-1"><p className="font-medium text-sm">{app.name}</p><p className="text-[10px] text-[#9ca3af] font-mono">Copy & open</p></div>
              {copiedId === app.id ? <Check className="w-4 h-4 text-[#4F46E5]" /> : <ExternalLink className="w-4 h-4 text-[#d1d5db]" />}
            </button>
          ))}
        </div>
        <div className="border-t border-[#f0f0f0] pt-2">
          <button onClick={handleCopyOnly} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafafa]">
            <span className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] rounded-lg"><Copy className="w-4 h-4 text-[#6b7280]" /></span>
            <div className="text-left flex-1"><p className="font-medium text-sm">Copy only</p><p className="text-[10px] text-[#9ca3af] font-mono">To clipboard</p></div>
            {copiedId === "clipboard" ? <Check className="w-4 h-4 text-[#4F46E5]" /> : null}
          </button>
        </div>
        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-1">Close</button>
      </div>
    </div>
  );
}

// --- AI Review Sheet ---
function AIReviewSheet({ bodyMd, onApply, onClose }: { bodyMd: string; onApply: (suggestion: string) => void; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [scores, setScores] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [overall, setOverall] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const runReview = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/ai-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bodyMd }) });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setScores(data.scores);
      setOverall(data.overall);
      setSuggestion(data.suggestionMd);
      setState("done");
    } catch { setState("error"); }
  };

  const gradeColor: Record<string, string> = { A: "text-[#1a1a1a]", B: "text-[#404040]", C: "text-[#4F46E5]", D: "text-red-500" };
  const axisLabels: Record<string, string> = { clarity: "Clarity", specificity: "Specificity", structure: "Structure", context: "Context", constraints: "Constraints" };

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-0.5 bg-[#e5e7eb] rounded-full mx-auto mb-3" />
        <h2 className="font-bold text-base text-center tracking-tight mb-4">AI Review</h2>
        {state === "idle" && (
          <div className="space-y-4">
            <p className="text-xs text-[#9ca3af] text-center font-mono">Evaluate on 5 axes</p>
            <div className="space-y-1.5 p-3 rounded-lg bg-[#fafafa] border border-[#f0f0f0]">
              {Object.entries(axisLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs"><span className="w-1 h-1 rounded-full bg-[#4F46E5]" /><span className="text-[#6b7280] font-mono">{label}</span></div>
              ))}
            </div>
            <button onClick={runReview} className="w-full py-3 bg-[#1a1a1a] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2">
              <WandSparkles className="w-4 h-4" /> Run Review
            </button>
          </div>
        )}
        {state === "loading" && (
          <div className="text-center py-16"><div className="animate-spin w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-[#9ca3af] text-xs font-mono">Reviewing...</p></div>
        )}
        {state === "done" && (
          <div className="space-y-4">
            <div className="text-center py-4"><p className="text-[10px] text-[#9ca3af] mb-1 font-mono uppercase tracking-wider">Overall</p><p className={`text-4xl font-bold ${gradeColor[overall] || ""}`}>{overall}</p></div>
            <div className="space-y-2">
              {Object.entries(scores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs"><span className="w-20 text-[#9ca3af] font-mono text-[11px]">{axisLabels[key] || key}</span><span className={`font-bold w-5 ${gradeColor[val.grade] || ""}`}>{val.grade}</span><span className="text-[#9ca3af] text-[11px] flex-1">{val.feedback}</span></div>
              ))}
            </div>
            <div className="bg-[#EEF2FF]/30 border border-[#EEF2FF] p-4 rounded-xl">
              <p className="font-medium text-xs mb-2 text-[#4F46E5] font-mono uppercase tracking-wider">Improved</p>
              <div className="markdown-preview text-sm"><MarkdownPreview content={suggestion} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(suggestion)} className="flex-1 py-2.5 border border-[#f0f0f0] text-[#6b7280] font-medium rounded-xl text-xs">Copy</button>
              <button onClick={() => onApply(suggestion)} className="flex-1 py-2.5 bg-[#1a1a1a] text-white font-medium rounded-xl text-xs">Apply</button>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#d1d5db]">
              <span className="font-mono">Helpful?</span>
              <button className="p-2 hover:text-[#1a1a1a]"><ThumbsUp className="w-3.5 h-3.5" /></button>
              <button className="p-2 hover:text-[#1a1a1a]"><ThumbsDown className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
        {state === "error" && (
          <div className="text-center py-12 space-y-3"><p className="text-[#9ca3af] text-xs font-mono">Review failed</p><button onClick={runReview} className="text-[#4F46E5] text-xs font-medium">Retry</button></div>
        )}
        <button onClick={onClose} className="w-full text-center text-[11px] text-[#d1d5db] py-2 mt-2">Close</button>
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
