"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/use-store";
import { HelpCircle, ChevronRight, Moon, Sun, Trash2, LogOut, User, Key, Eye, EyeOff, FileText, Shield, Cloud, HardDrive, AlertTriangle, Upload, Download, Sparkles, ChevronDown } from "lucide-react";
import { AI_APPS } from "@/lib/types";
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  readStoredPreferences,
  savePreferences,
  clearPreferences,
  hasPreferences,
  buildPersonalContext,
  TONE_LABELS,
  EXPERTISE_LABELS,
  LENGTH_LABELS,
  LANGUAGE_LABELS,
  ToneKey,
  ExpertiseKey,
  LengthKey,
  LanguageKey,
} from "@/lib/personalization";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const hybridStore = useStore();
  const [darkMode, setDarkMode] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [aiProvider, setAiProvider] = useState<"openai" | "anthropic">("openai");
  const [aiApiKey, setAiApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setPrefsSaved(false);
  };

  useEffect(() => {
    // 保存済みの個人設定があれば読み込む（無ければ state はデフォルトのまま）
    const storedPrefs = readStoredPreferences();
    if (storedPrefs) {
      setPrefs(storedPrefs);
    }
    const saved = localStorage.getItem("promptnote_darkmode");
    if (saved === "1") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    // Load saved API key
    const savedProvider = localStorage.getItem("promptnote_ai_provider") as "openai" | "anthropic" | null;
    const savedKey = localStorage.getItem("promptnote_ai_apikey");
    if (savedProvider) setAiProvider(savedProvider);
    if (savedKey) setAiApiKey(savedKey);
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("promptnote_darkmode", "1");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("promptnote_darkmode");
    }
  };

  const exportAll = async () => {
    setExporting(true);
    try {
      const docs = await hybridStore.getDocuments();
      if (!docs || docs.length === 0) {
        setExporting(false);
        return;
      }
      const blob = new Blob([JSON.stringify(docs, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `promptnote-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2000);
    } catch {
      alert("エクスポートに失敗しました");
    }
    setExporting(false);
  };

  const importBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        if (hybridStore.isCloud) {
          // Import to cloud
          let imported = 0;
          for (const doc of data) {
            await hybridStore.create({
              userId: "local",
              title: doc.title || null,
              bodyMd: doc.bodyMd || "",
              type: doc.type || "note",
              visibility: doc.visibility || "private",
              tags: doc.tags || [],
              variables: doc.variables,
              forkedFromId: doc.forkedFromId,
            });
            imported++;
          }
          if (imported > 0) {
            setImportDone(true);
            setTimeout(() => setImportDone(false), 2000);
          }
        } else {
          // Import to localStorage
          const existing = localStorage.getItem("promptnote_documents");
          const existingDocs = existing ? JSON.parse(existing) : [];
          const existingIds = new Set(existingDocs.map((d: { id: string }) => d.id));
          const newDocs = data.filter((d: { id: string }) => !existingIds.has(d.id));
          localStorage.setItem("promptnote_documents", JSON.stringify([...existingDocs, ...newDocs]));
          setImportDone(true);
          setTimeout(() => setImportDone(false), 2000);
        }
      }
    } catch {
      alert("ファイルの形式が正しくありません");
    }
    setImporting(false);
    if (importRef.current) importRef.current.value = "";
  };

  const clearAllData = async () => {
    setClearing(true);
    try {
      if (hybridStore.isCloud) {
        await hybridStore.deleteAllDocuments();
      }
      localStorage.clear();
      window.location.reload();
    } catch {
      alert("データの削除に失敗しました");
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="px-6 pt-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Settings</h1>
      </div>

      {/* Profile */}
      <section className="mb-8">
        {user ? (
          <div className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white font-medium text-sm">
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-[#1a1a1a] dark:text-white">{user.email}</p>
              <p className="text-[10px] text-[#9ca3af] font-mono">Signed in</p>
            </div>
            <button onClick={signOut} className="text-[#9ca3af] hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/auth" className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] dark:bg-white flex items-center justify-center text-white dark:text-[#1a1a1a] font-medium text-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-[#1a1a1a] dark:text-white">Sign in / Sign up</p>
              <p className="text-[10px] text-[#9ca3af] font-mono">Sync your prompts across devices</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
          </Link>
        )}
      </section>

      {/* Storage indicator */}
      <section className="mb-8">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#f0f0f0] dark:border-[#333] bg-[#fafafa] dark:bg-[#222]">
          {hybridStore.isCloud ? (
            <>
              <Cloud className="w-4 h-4 text-[#4F46E5]" />
              <span className="text-xs text-[#4F46E5] font-mono">クラウド保存中</span>
            </>
          ) : (
            <>
              <HardDrive className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-xs text-[#9ca3af] font-mono">ローカル保存中</span>
            </>
          )}
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">Appearance</h2>
        <div className="border-t border-[#f0f0f0] dark:border-[#333]">
          <button onClick={toggleDark} className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="flex items-center gap-2.5">
              {darkMode ? <Moon className="w-4 h-4 text-[#4F46E5]" /> : <Sun className="w-4 h-4 text-[#9ca3af]" />}
              <span className="text-sm text-[#1a1a1a] dark:text-white">Dark Mode</span>
            </div>
            <div className={`w-10 h-6 rounded-full flex items-center px-0.5 ${darkMode ? "bg-[#4F46E5]" : "bg-[#e5e7eb]"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm ${darkMode ? "ml-4" : "ml-0"}`} />
            </div>
          </button>
        </div>
      </section>

      {/* Personalize */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">Personalize</h2>
        <div className="border-t border-[#f0f0f0] dark:border-[#333]">
          <button
            onClick={() => setPrefsOpen(!prefsOpen)}
            className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Sparkles className={`w-4 h-4 ${hasPreferences(prefs) ? "text-[#4F46E5]" : "text-[#9ca3af]"}`} />
              <div>
                <span className="text-sm text-[#1a1a1a] dark:text-white">個人設定（あなたの前提）</span>
                <p className="text-[10px] text-[#9ca3af] mt-0.5">
                  {hasPreferences(prefs) ? "テンプレートの変数に自動で反映されます" : "未設定 — 1度書けば毎回使えます"}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#d1d5db] shrink-0 ${prefsOpen ? "rotate-180" : ""}`} />
          </button>

          {prefsOpen && (
            <div className="py-4 space-y-4 border-b border-[#f0f0f0] dark:border-[#333]">
              <p className="text-[10px] text-[#9ca3af] leading-relaxed">
                {"ここに書いた内容は、テンプレートの {{私の職種}} {{私の専門分野}} {{文体}} などに自動で入ります。Send to AI では「私について」ブロックとして本文の先頭に付けられます。保存先はこのブラウザのみです。"}
              </p>

              {/* Text fields */}
              {([
                { key: "displayName" as const, label: "名前 / 表示名", placeholder: "例: 田中太郎", token: "{{私の名前}}" },
                { key: "role" as const, label: "職種", placeholder: "例: フリーランスWebデザイナー", token: "{{私の職種}}" },
                { key: "industry" as const, label: "業界 / 事業ドメイン", placeholder: "例: 中小企業向けBtoB SaaS", token: "{{私の業界}}" },
                { key: "expertiseArea" as const, label: "得意分野", placeholder: "例: LP制作、UI/UX、GA4分析", token: "{{私の専門分野}}" },
              ]).map((f) => (
                <div key={f.key}>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">{f.label}</label>
                    <span className="text-[9px] text-[#d1d5db] font-mono">{f.token}</span>
                  </div>
                  <input
                    type="text"
                    value={prefs[f.key]}
                    onChange={(e) => updatePref(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border border-[#f0f0f0] dark:border-[#333] rounded-lg text-xs outline-none focus:border-[#4F46E5] dark:bg-[#222] dark:text-white placeholder:text-[#d1d5db] dark:placeholder:text-[#444]"
                  />
                </div>
              ))}

              {/* Selects */}
              {([
                { key: "expertise" as const, label: "説明のレベル", token: "{{私のレベル}}", options: EXPERTISE_LABELS },
                { key: "tone" as const, label: "トーン / 文体", token: "{{文体}}", options: TONE_LABELS },
                { key: "length" as const, label: "分量の好み", token: "{{出力の長さ}}", options: LENGTH_LABELS },
                { key: "language" as const, label: "出力言語", token: "{{出力言語}}", options: LANGUAGE_LABELS },
              ]).map((f) => (
                <div key={f.key}>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">{f.label}</label>
                    <span className="text-[9px] text-[#d1d5db] font-mono">{f.token}</span>
                  </div>
                  <select
                    value={prefs[f.key]}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (f.key === "expertise") updatePref("expertise", v as ExpertiseKey);
                      else if (f.key === "tone") updatePref("tone", v as ToneKey);
                      else if (f.key === "length") updatePref("length", v as LengthKey);
                      else updatePref("language", v as LanguageKey);
                    }}
                    className="w-full px-3 py-2 border border-[#f0f0f0] dark:border-[#333] rounded-lg text-xs outline-none focus:border-[#4F46E5] dark:bg-[#222] dark:text-white"
                  >
                    {Object.entries(f.options).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Favorite AI */}
              <div>
                <label className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mb-1.5 block">よく使うAI（Send to AI で先頭に出ます）</label>
                <div className="flex gap-1.5 flex-wrap">
                  {AI_APPS.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => updatePref("favoriteAI", prefs.favoriteAI === app.id ? "" : app.id)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border ${
                        prefs.favoriteAI === app.id
                          ? "border-[#4F46E5] bg-[#EEF2FF] dark:bg-[#4F46E5]/15 text-[#4F46E5]"
                          : "border-[#f0f0f0] dark:border-[#333] text-[#9ca3af]"
                      }`}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom instructions */}
              <div>
                <label className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mb-1 block">追加の指示（任意）</label>
                <textarea
                  value={prefs.customInstructions}
                  onChange={(e) => updatePref("customInstructions", e.target.value)}
                  rows={4}
                  placeholder={"例:\n・社名は必ず「株式会社◯◯」と正式名称で書く\n・「弊社」ではなく「当方」を使う\n・絵文字は使わない"}
                  className="w-full px-3 py-2 border border-[#f0f0f0] dark:border-[#333] rounded-lg text-xs outline-none focus:border-[#4F46E5] dark:bg-[#222] dark:text-white placeholder:text-[#d1d5db] dark:placeholder:text-[#444] leading-relaxed resize-none"
                />
              </div>

              {/* Auto attach toggle */}
              <button
                onClick={() => updatePref("autoAttachContext", !prefs.autoAttachContext)}
                className="w-full flex items-center justify-between py-1"
              >
                <div className="text-left">
                  <span className="text-xs text-[#1a1a1a] dark:text-white">Send to AI に自動で付ける</span>
                  <p className="text-[10px] text-[#9ca3af] mt-0.5">AIに送る時、先頭に「私について」を付けた状態でコピーします</p>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center px-0.5 shrink-0 ${prefs.autoAttachContext ? "bg-[#4F46E5]" : "bg-[#e5e7eb] dark:bg-[#333]"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm ${prefs.autoAttachContext ? "ml-4" : "ml-0"}`} />
                </div>
              </button>

              {/* Preview */}
              {hasPreferences(prefs) && (
                <div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[10px] text-[#4F46E5] font-mono"
                  >
                    {showPreview ? "プレビューを隠す" : "AIに渡される内容を見る"}
                  </button>
                  {showPreview && (
                    <pre className="mt-2 p-3 rounded-lg bg-[#fafafa] dark:bg-[#222] border border-[#f0f0f0] dark:border-[#333] text-[10px] font-mono text-[#6b7280] dark:text-[#9ca3af] whitespace-pre-wrap leading-relaxed overflow-auto max-h-48">
                      {buildPersonalContext(prefs)}
                    </pre>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    clearPreferences();
                    setPrefs({ ...DEFAULT_PREFERENCES });
                    setPrefsSaved(false);
                  }}
                  className="text-[10px] text-red-400 font-mono"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    savePreferences(prefs);
                    setPrefsSaved(true);
                    setTimeout(() => setPrefsSaved(false), 1500);
                  }}
                  className="text-[10px] font-medium text-white bg-[#1a1a1a] dark:bg-white dark:text-[#1a1a1a] px-4 py-1.5 rounded-full"
                >
                  {prefsSaved ? "Saved" : "保存"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Review API Key */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">AI Review</h2>
        <div className="border-t border-[#f0f0f0] dark:border-[#333]">
          {/* Provider selector */}
          <div className="flex items-center gap-2 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
            <Key className="w-4 h-4 text-[#9ca3af]" />
            <span className="text-sm text-[#1a1a1a] dark:text-white">Provider</span>
            <div className="ml-auto flex gap-1">
              {(["openai", "anthropic"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAiProvider(p)}
                  className={`text-[10px] px-2.5 py-1 rounded font-mono ${
                    aiProvider === p ? "bg-[#1a1a1a] text-white" : "bg-[#f5f5f5] text-[#9ca3af]"
                  }`}
                >
                  {p === "openai" ? "OpenAI" : "Anthropic"}
                </button>
              ))}
            </div>
          </div>
          {/* API Key input */}
          <div className="py-3 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder={aiProvider === "openai" ? "sk-..." : "sk-ant-..."}
                className="w-full pr-20 pl-3 py-2 border border-[#f0f0f0] rounded-lg text-xs font-mono outline-none focus:border-[#4F46E5] placeholder:text-[#e5e7eb]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button onClick={() => setShowKey(!showKey)} className="text-[#d1d5db] p-1">
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[9px] text-[#d1d5db] font-mono">
                {aiProvider === "openai" ? "platform.openai.com/api-keys" : "console.anthropic.com/keys"}
              </p>
              <button
                onClick={() => {
                  localStorage.setItem("promptnote_ai_provider", aiProvider);
                  localStorage.setItem("promptnote_ai_apikey", aiApiKey);
                  setKeySaved(true);
                  setTimeout(() => setKeySaved(false), 1500);
                }}
                className="text-[10px] font-medium text-white bg-[#1a1a1a] px-3 py-1 rounded-full"
              >
                {keySaved ? "Saved" : "Save Key"}
              </button>
            </div>
            {aiApiKey && (
              <button
                onClick={() => {
                  setAiApiKey("");
                  localStorage.removeItem("promptnote_ai_apikey");
                  localStorage.removeItem("promptnote_ai_provider");
                }}
                className="text-[10px] text-red-400 mt-2 font-mono"
              >
                Remove key
              </button>
            )}
          </div>
          <p className="text-[9px] text-[#d1d5db] py-2 leading-relaxed">
            キーはブラウザのローカルストレージにのみ保存され、サーバーには保存しません。AI Reviewボタンを押した時だけAPIに送信されます。
          </p>
        </div>
      </section>

      {/* Guide */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">Guide</h2>
        <div className="border-t border-[#f0f0f0] dark:border-[#333]">
          <Link href="/howto" className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-sm text-[#1a1a1a] dark:text-white">How it works</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
          </Link>
          <Link href="/terms" className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-sm text-[#1a1a1a] dark:text-white">利用規約</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
          </Link>
          <Link href="/privacy" className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-sm text-[#1a1a1a] dark:text-white">プライバシーポリシー</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
          </Link>
        </div>
      </section>

      {/* Data */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">Data</h2>
        <div className="border-t border-[#f0f0f0] dark:border-[#333]">
          <button onClick={exportAll} disabled={exporting} className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-sm text-[#1a1a1a] dark:text-white">Export all data</span>
            </div>
            <span className="text-[10px] text-[#9ca3af] font-mono">
              {exporting ? "..." : exportDone ? "Done" : "JSON"}
            </span>
          </button>
          <button onClick={() => importRef.current?.click()} disabled={importing} className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-sm text-[#1a1a1a] dark:text-white">Import backup</span>
            </div>
            <span className="text-[10px] text-[#9ca3af] font-mono">
              {importing ? "..." : importDone ? "Done" : "JSON"}
            </span>
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={importBackup}
            className="hidden"
          />
          <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Clear all data</span>
            </div>
          </button>
        </div>
      </section>

      {/* Info */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">Info</h2>
        <div className="border-t border-[#f0f0f0] dark:border-[#333]">
          <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333] text-sm">
            <span className="text-[#1a1a1a] dark:text-white">Version</span>
            <span className="text-[#9ca3af] font-mono text-xs">0.7.0</span>
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] text-[#d1d5db] mt-16 font-mono tracking-widest">
        PromptNotes
      </p>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-6" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1a1a1a] dark:text-white">データを削除</h3>
                <p className="text-[10px] text-[#9ca3af] font-mono">この操作は取り消せません</p>
              </div>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              {hybridStore.isCloud
                ? "クラウドとローカルの全てのデータが削除されます。この操作は取り消せません。"
                : "ローカルの全てのデータが削除されます。この操作は取り消せません。"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 border border-[#f0f0f0] dark:border-[#333] text-[#6b7280] font-medium rounded-xl text-xs"
              >
                キャンセル
              </button>
              <button
                onClick={clearAllData}
                disabled={clearing}
                className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl text-xs disabled:opacity-50"
              >
                {clearing ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
