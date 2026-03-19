"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { HelpCircle, ChevronRight, Moon, Sun, Trash2, LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("promptnote_darkmode");
    if (saved === "1") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
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

      {/* AI Review */}
      <section className="mb-8">
        <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">AI Review</h2>
        <div className="border-t border-[#f0f0f0] dark:border-[#333]">
          <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <span className="text-sm text-[#1a1a1a] dark:text-white">Remaining</span>
            <span className="text-sm text-[#9ca3af] font-mono">3 / 3</span>
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
            <div>
              <span className="text-sm font-medium text-[#4F46E5]">Pro Plan</span>
              <p className="text-[10px] text-[#9ca3af] font-mono">30/day + advanced review</p>
            </div>
            <span className="text-[10px] text-[#d1d5db] font-mono">Coming soon</span>
          </div>
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
            <span className="text-[#9ca3af] font-mono text-xs">0.2.0</span>
          </div>
        </div>
      </section>

      <p className="text-center text-[10px] text-[#d1d5db] mt-16 font-mono tracking-widest">
        PromptNote
      </p>
    </div>
  );
}
