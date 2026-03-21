"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cloudStore } from "@/lib/cloud-store";
import type { PromptDocument } from "@/lib/types";
import {
  ArrowLeft,
  Pencil,
  Check,
  X,
  LogOut,
  FileText,
  Zap,
  LayoutTemplate,
  Globe,
  User,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface Profile {
  display_name: string;
  avatar_url: string | null;
}

interface Stats {
  notes: number;
  prompts: number;
  templates: number;
}

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<PromptDocument[]>([]);
  const [stats, setStats] = useState<Stats>({ notes: 0, prompts: 0, templates: 0 });
  const [publicDocs, setPublicDocs] = useState<PromptDocument[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [profileData, docs] = await Promise.all([
        cloudStore.getProfile(user.id),
        cloudStore.getDocuments(user.id),
      ]);

      if (profileData) {
        setProfile({
          display_name: profileData.display_name || "User",
          avatar_url: profileData.avatar_url || null,
        });
        setEditName(profileData.display_name || "User");
      } else {
        // Fallback from user metadata
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";
        const avatar = user.user_metadata?.avatar_url || null;
        setProfile({ display_name: name, avatar_url: avatar });
        setEditName(name);
      }

      setDocuments(docs);
      setStats({
        notes: docs.filter((d) => d.type === "note").length,
        prompts: docs.filter((d) => d.type === "prompt").length,
        templates: docs.filter((d) => d.type === "template").length,
      });
      setPublicDocs(
        docs.filter(
          (d) => d.visibility === "public" && d.type !== "note"
        )
      );
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      fetchData();
    }
    if (!loading && !user) {
      setLoadingData(false);
    }
  }, [loading, user, fetchData]);

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return;
    setSaving(true);
    try {
      await cloudStore.updateProfile(user.id, { display_name: editName.trim() });
      setProfile((prev) => prev ? { ...prev, display_name: editName.trim() } : prev);
      setIsEditing(false);
      toast("表示名を更新しました");
    } catch (err) {
      console.error("Failed to update name:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast("サインアウトしました");
    router.push("/");
  };

  // Determine OAuth provider
  const provider = user?.app_metadata?.provider || "email";
  const providerLabel =
    provider === "google"
      ? "Google"
      : provider === "github"
        ? "GitHub"
        : provider.charAt(0).toUpperCase() + provider.slice(1);

  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    null;

  // ------- Not logged in -------
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={() => router.back()}
              className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
              Profile
            </h1>
          </div>

          {/* Sign in CTA */}
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
              <User className="w-7 h-7 text-[#9ca3af]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#1a1a1a] dark:text-white mb-1">
                Sign in to view your profile
              </p>
              <p className="text-xs text-[#9ca3af]">
                Sync prompts, track stats, and share publicly.
              </p>
            </div>
            <Link
              href="/auth"
              className="mt-2 px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-full hover:bg-[#4338CA] transition-colors"
            >
              Sign in / Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------- Loading -------
  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={() => router.back()}
              className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
              Profile
            </h1>
          </div>
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] animate-pulse" />
            <div className="w-24 h-4 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded animate-pulse" />
            <div className="w-40 h-3 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ------- Logged in -------
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] px-6 pt-14 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => router.back()}
            className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
            Profile
          </h1>
        </div>

        {/* Avatar + Name + Email */}
        <section className="flex flex-col items-center mb-8">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#f0f0f0] dark:border-[#333]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-2xl font-bold">
              {(profile?.display_name || "U")[0].toUpperCase()}
            </div>
          )}

          {/* Display name - inline edit */}
          <div className="mt-4 flex items-center gap-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-lg font-bold text-center text-[#1a1a1a] dark:text-white bg-transparent border-b-2 border-[#4F46E5] outline-none px-1 py-0.5"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setEditName(profile?.display_name || "");
                      setIsEditing(false);
                    }
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="text-[#4F46E5] hover:text-[#4338CA] disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditName(profile?.display_name || "");
                    setIsEditing(false);
                  }}
                  className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                  {profile?.display_name || "User"}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[#9ca3af] hover:text-[#4F46E5]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Email (read-only) */}
          <p className="text-xs text-[#9ca3af] mt-1 font-mono">
            {user?.email || "No email"}
          </p>
        </section>

        {/* Stats row */}
        <section className="mb-8">
          <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">
            Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Notes", value: stats.notes, icon: FileText },
              { label: "Prompts", value: stats.prompts, icon: Zap },
              { label: "Templates", value: stats.templates, icon: LayoutTemplate },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[#333] rounded-xl p-4 text-center"
              >
                <Icon className="w-4 h-4 mx-auto mb-2 text-[#4F46E5]" />
                <p className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                  {value}
                </p>
                <p className="text-[10px] font-mono text-[#9ca3af] mt-0.5 uppercase tracking-widest">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Public prompts */}
        <section className="mb-8">
          <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">
            Public Prompts
          </h2>
          <div className="border-t border-[#f0f0f0] dark:border-[#333]">
            {publicDocs.length === 0 ? (
              <div className="py-6 text-center">
                <Globe className="w-5 h-5 mx-auto mb-2 text-[#d1d5db]" />
                <p className="text-xs text-[#9ca3af]">
                  No public prompts yet.
                </p>
                <p className="text-[10px] text-[#d1d5db] mt-1">
                  Set a prompt or template to &quot;public&quot; to share it.
                </p>
              </div>
            ) : (
              publicDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/editor?id=${doc.id}`}
                  className="flex items-center justify-between py-3 border-b border-[#f0f0f0] dark:border-[#333]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a] dark:text-white truncate">
                      {doc.title || "Untitled"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-[#4F46E5]">
                        {doc.type}
                      </span>
                      <span className="text-[10px] text-[#d1d5db]">
                        {doc.likeCount} likes
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#d1d5db] shrink-0" />
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Account */}
        <section className="mb-8">
          <h2 className="text-[10px] font-mono text-[#9ca3af] mb-3 uppercase tracking-widest">
            Account
          </h2>
          <div className="border-t border-[#f0f0f0] dark:border-[#333]">
            {/* Provider info */}
            <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
              <span className="text-sm text-[#1a1a1a] dark:text-white">
                Provider
              </span>
              <span className="text-xs font-mono text-[#9ca3af]">
                {providerLabel}
              </span>
            </div>

            {/* User ID */}
            <div className="flex items-center justify-between py-3.5 border-b border-[#f0f0f0] dark:border-[#333]">
              <span className="text-sm text-[#1a1a1a] dark:text-white">
                User ID
              </span>
              <span className="text-[10px] font-mono text-[#d1d5db] max-w-[180px] truncate">
                {user?.id}
              </span>
            </div>

            {/* Settings */}
            <Link
              href="/settings"
              className="flex items-center gap-3 p-4 bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[#333] rounded-xl"
            >
              <Settings className="w-4 h-4 text-[#4F46E5]" />
              <span className="flex-1 text-sm text-[#1a1a1a] dark:text-white">設定</span>
              <ChevronRight className="w-4 h-4 text-[#d1d5db]" />
            </Link>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 py-3.5 border-b border-[#f0f0f0] dark:border-[#333]"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Sign out</span>
            </button>
          </div>
        </section>

        <p className="text-center text-[10px] text-[#d1d5db] mt-16 font-mono tracking-widest">
          PromptNotes
        </p>
      </div>
    </div>
  );
}
