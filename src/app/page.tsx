"use client";

import { useAuth } from "@/lib/auth-context";
import { resolveEntrySurface } from "@/lib/entry-flow";
import LandingPage from "@/components/LandingPage";
import NotesWorkspace from "@/components/NotesWorkspace";

// 既存ユーザーはホームからも、これまでのノートへ直接進める。
export default function HomePage() {
  const { user, loading } = useAuth();
  const surface = resolveEntrySurface("/", loading, !!user);
  if (surface === "loading") return null;
  return surface === "landing" ? <LandingPage /> : <NotesWorkspace />;
}
