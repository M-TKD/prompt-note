"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Compass, Search, User, Plus } from "lucide-react";

const tabs = [
  { href: "/", icon: FileText, label: "Notes" },
  { href: "/feed", icon: Compass, label: "Explore" },
  { href: "/editor", icon: Plus, label: "", isCenter: true },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-[#f0f0f0] dark:border-[#333] z-50">
      <div className="max-w-lg md:max-w-3xl mx-auto flex items-center justify-around py-1.5">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href="/editor?mode=quick"
                className="flex items-center justify-center -mt-5"
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
              href={tab.href}
              className={`flex flex-col items-center py-1.5 px-3 ${
                isActive ? "text-[#1a1a1a] dark:text-white" : "text-[#d1d5db] dark:text-[#6b7280]"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] mt-0.5 font-medium tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
