import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://prompt-notes.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PromptNotes — 書いて、磨いて、シェアしよう。",
    template: "%s | PromptNotes",
  },
  description:
    "AIプロンプトを保存・編集・共有できる無料サービス。テンプレートやAIレビュー機能で、あなたのプロンプトをもっと良くしよう。",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "PromptNotes",
    title: "PromptNotes — 書いて、磨いて、シェアしよう。",
    description:
      "AIプロンプトを保存・編集・共有できる無料サービス。テンプレートやAIレビュー機能で、あなたのプロンプトをもっと良くしよう。",
    url: SITE_URL,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "PromptNotes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptNotes — 書いて、磨いて、シェアしよう。",
    description:
      "AIプロンプトを保存・編集・共有できる無料サービス。テンプレートやAIレビュー機能で、あなたのプロンプトをもっと良くしよう。",
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-[#1a1a1a]`}
        style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      >
        <AuthProvider>
          <ToastProvider>
            <main className="pb-16 max-w-lg mx-auto">
              {children}
            </main>
            <BottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
