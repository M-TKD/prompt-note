"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push("/");
      }
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#4F46E5]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a] mb-2">メールを確認してください</h1>
          <p className="text-sm text-[#9ca3af] mb-6 leading-relaxed">
            <span className="font-mono text-[#6b7280]">{email}</span> に確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
          <button
            onClick={() => { setSuccess(false); setMode("signin"); }}
            className="text-[#4F46E5] text-sm font-medium"
          >
            ログイン画面へ →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-6">
      {/* Header */}
      <div className="flex items-center py-4">
        <button onClick={() => router.back()} className="text-[#9ca3af] hover:text-[#1a1a1a]">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1 font-mono">
            {mode === "signin" ? "Sign in to sync your prompts" : "Start saving and sharing prompts"}
          </p>
        </div>

        {/* Form */}
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
                className="w-full pl-10 pr-4 py-3 border border-[#f0f0f0] rounded-xl text-sm outline-none focus:border-[#4F46E5] placeholder:text-[#e5e7eb]"
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
                className="w-full pl-10 pr-10 py-3 border border-[#f0f0f0] rounded-xl text-sm outline-none focus:border-[#4F46E5] placeholder:text-[#e5e7eb]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d1d5db]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1a1a1a] text-white font-medium rounded-xl text-sm"
          >
            {loading ? "..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="text-xs text-[#9ca3af]"
          >
            {mode === "signin" ? (
              <>アカウントを持っていない？ <span className="text-[#4F46E5] font-medium">Sign Up</span></>
            ) : (
              <>既にアカウントがある？ <span className="text-[#4F46E5] font-medium">Sign In</span></>
            )}
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={() => router.push("/")}
          className="text-center mt-4 text-[11px] text-[#d1d5db] font-mono"
        >
          Skip (use locally)
        </button>
      </div>
    </div>
  );
}
