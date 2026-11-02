"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { resolveEntrySurface } from "@/lib/entry-flow";
import { BottomNav } from "./BottomNav";
import { CraftbaseReturnNav } from "./CraftbaseReturnNav";

// 紹介・認証ページは全幅、作業ページだけにアプリ用の枠とナビを付ける。
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const surface = resolveEntrySurface(pathname, loading, !!user);

  if (surface === "loading") {
    return <><CraftbaseReturnNav /><main className="min-h-screen flex items-center justify-center px-6" aria-busy="true"><p role="status" className="text-sm text-[#6b7280]">読み込み中…</p></main></>;
  }

  if (surface === "landing" || surface === "public") return <><CraftbaseReturnNav /><main>{children}</main></>;

  return (
    <>
      <CraftbaseReturnNav />
      <main className="pb-24 max-w-lg md:max-w-3xl mx-auto md:px-6">{children}</main>
      <BottomNav />
    </>
  );
}
