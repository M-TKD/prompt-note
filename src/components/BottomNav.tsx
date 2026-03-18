"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Compass, Search, Settings, Plus } from "lucide-react";

const tabs = [
  { href: "/", icon: FileText, label: "ノート" },
  { href: "/feed", icon: Compass, label: "みつける" },
  { href: "/editor", icon: Plus, label: "", isCenter: true },
  { href: "/search", icon: Search, label: "さがす" },
  { href: "/settings", icon: Settings, label: "設定" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-neutral-100 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-1">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href="/editor?mode=quick"
                className="flex items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shadow-lg shadow-neutral-900/20 active:scale-95 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-2 px-3 ${
                isActive ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
