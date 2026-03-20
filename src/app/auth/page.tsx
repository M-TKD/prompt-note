"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else setSuccess(true);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else router.push("/");
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "github" | "facebook") => {
    setError(null);
    setOauthLoading(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setError(error);
      setOauthLoading(null);
    }
    // Redirect happens automatically via Supabase
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 dark:bg-[#0a0a0a]">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#EEF2FF] dark:bg-[#4F46E5]/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#4F46E5]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a] dark:text-white mb-2">メールを確認してください</h1>
          <p className="text-sm text-[#9ca3af] mb-6 leading-relaxed">
            <span className="font-mono text-[#6b7280]">{email}</span> に確認メールを送信しました。
          </p>
          <button onClick={() => { setSuccess(false); setMode("signin"); }} className="text-[#4F46E5] text-sm font-medium">
            ログイン画面へ →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-6 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center py-4">
        <button onClick={() => router.back()} className="text-[#9ca3af] hover:text-[#1a1a1a] dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1 font-mono">
            {mode === "signin" ? "Sign in to sync your prompts" : "Start saving and sharing prompts"}
          </p>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className="w-full flex items-center gap-3 py-3 px-4 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-sm font-medium hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="flex-1 text-left text-[#404040] dark:text-[#e5e7eb]">
              {oauthLoading === "google" ? "Connecting..." : "Continue with Google"}
            </span>
          </button>

          <button
            onClick={() => handleOAuth("github")}
            disabled={!!oauthLoading}
            className="w-full flex items-center gap-3 py-3 px-4 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-sm font-medium hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]"
          >
            <svg className="w-5 h-5 text-[#1a1a1a] dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span className="flex-1 text-left text-[#404040] dark:text-[#e5e7eb]">
              {oauthLoading === "github" ? "Connecting..." : "Continue with GitHub"}
            </span>
          </button>

          <button
            onClick={() => handleOAuth("facebook")}
            disabled={!!oauthLoading}
            className="w-full flex items-center gap-3 py-3 px-4 border border-[#f0f0f0] dark:border-[#333] rounded-xl text-sm font-medium hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span className="flex-1 text-left text-[#404040] dark:text-[#e5e7eb]">
              {oauthLoading === "facebook" ? "Connecting..." : "Continue with Facebook"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#f0f0f0] dark:bg-[#333]" />
          <span className="text-[10px] text-[#d1d5db] font-mono uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-[#f0f0f0] dark:bg-[#333]" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d1d5db]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-[#f0f0f0] dark:border-[#333] dark:bg-[#141414] rounded-xl text-sm outline-none focus:border-[#4F46E5] placeholder:text-[#e5e7eb] dark:placeholder:text-[#444] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d1d5db]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "6文字以上" : "パスワード"}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 border border-[#f0f0f0] dark:border-[#333] dark:bg-[#141414] rounded-xl text-sm outline-none focus:border-[#4F46E5] placeholder:text-[#e5e7eb] dark:placeholder:text-[#444] dark:text-white"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d1d5db]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-medium rounded-xl text-sm">
            {loading ? "..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }} className="text-xs text-[#9ca3af]">
            {mode === "signin" ? (
              <>アカウントを持っていない？ <span className="text-[#4F46E5] font-medium">Sign Up</span></>
            ) : (
              <>既にアカウントがある？ <span className="text-[#4F46E5] font-medium">Sign In</span></>
            )}
          </button>
        </div>

        {/* Skip */}
        <button onClick={() => router.push("/")} className="text-center mt-4 text-[11px] text-[#d1d5db] font-mono">
          Skip (use locally)
        </button>
      </div>
    </div>
  );
}
