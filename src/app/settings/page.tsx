"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { HelpCircle, ChevronRight, Moon, Sun, Trash2, LogOut, User, Key, Eye, EyeOff, Upload, FileText, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [aiProvider, setAiProvider] = useState<"openai" | "anthropic">("openai");
  const [aiApiKey, setAiApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
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

  const exportAll = () => {
    const raw = localStorage.getItem("promptnote_documents");
    if (!raw) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptnote-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  const importBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const existing = localStorage.getItem("promptnote_documents");
        const existingDocs = existing ? JSON.parse(existing) : [];
        const existingIds = new Set(existingDocs.map((d: { id: string }) => d.id));
        const newDocs = data.filter((d: { id: string }) => !existingIds.has(d.id));
        localStorage.setItem("promptnote_documents", JSON.stringify([...existingDocs, ...newDocs]));
        setImportDone(true);
        setTimeout(() => setImportDone(false), 2000);
      }
    } catch {
      alert("ファイルの形式が正しくありません");
    }
    if (importRef.current) importRef.current.value = "";
  };

  const clearAllData = () => {
    if (confirm("すべてのデータを削除しますか？この操作は取り消せません。")) {
      localStorage.clear();
      window.location.reload();
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
                {keySaved ? "✓ Saved" : "Save Key"}
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
          <button onClick={exportAll} className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <span className="text-sm text-[#1a1a1a] dark:text-white">Export all data</span>
            <span className="text-[10px] text-[#9ca3af] font-mono">{exportDone ? "✓ Done" : "JSON"}</span>
          </button>
          <button onClick={() => importRef.current?.click()} className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <span className="text-sm text-[#1a1a1a] dark:text-white">Import backup</span>
            <span className="text-[10px] text-[#9ca3af] font-mono">{importDone ? "✓ Done" : "JSON"}</span>
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={importBackup}
            className="hidden"
          />
          <button onClick={clearAllData} className="w-full flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
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
            <span className="text-[#9ca3af] font-mono text-xs">0.3.0</span>
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] text-[#d1d5db] mt-16 font-mono tracking-widest">
        PromptNotes
      </p>
    </div>
  );
}
