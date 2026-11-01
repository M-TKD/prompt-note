"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FileText, Compass, Search, User, Plus } from "lucide-react";

const tabs = [
  { href: "/notes", icon: FileText, label: "ノート" },
  { href: "/feed", icon: Compass, label: "探す" },
  { href: "/editor", icon: Plus, label: "", isCenter: true },
  { href: "/search", icon: Search, label: "検索" },
  { href: "/profile", icon: User, label: "アカウント" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav aria-label="アプリのメニュー" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-[#f0f0f0] dark:border-[#333] z-50">
      <div className="max-w-lg md:max-w-3xl mx-auto flex items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = tab.href === "/notes" ? pathname === "/" || pathname === "/notes" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href="/editor?mode=quick"
                aria-label="新しいノートを作成"
                className="flex items-center justify-center -mt-5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F46E5]"
              >
                <div className="w-11 h-11 rounded-full bg-[#1a1a1a] dark:bg-white flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5 text-white dark:text-[#1a1a1a]" strokeWidth={2} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href === "/profile" && !user ? "/auth" : tab.href}
              aria-label={tab.href === "/profile" && !user ? "アカウント（同期・プロフィールはログイン後に利用）" : tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5] rounded-lg flex min-h-12 min-w-12 flex-col items-center justify-center py-1.5 px-2 ${
                isActive ? "text-[#1a1a1a] dark:text-white" : "text-[#6b7280] dark:text-[#9ca3af]"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[11px] mt-1 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
