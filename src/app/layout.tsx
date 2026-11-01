import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
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
    default: "Prompt Notes｜AIへの指示を、次の仕事でも。",
    template: "%s | PromptNotes",
  },
  description:
    "よく使うAIへの指示を保存し、条件を変えて再利用。登録なしの端末内保存から始められ、無料アカウントでクラウド同期も利用できます。",
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
    title: "Prompt Notes｜AIへの指示を、次の仕事でも。",
    description:
      "よく使うAIへの指示を保存し、条件を変えて再利用。登録なしの端末内保存から始められ、無料アカウントでクラウド同期も利用できます。",
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
    title: "Prompt Notes｜AIへの指示を、次の仕事でも。",
    description:
      "よく使うAIへの指示を保存し、条件を変えて再利用。登録なしの端末内保存から始められ、無料アカウントでクラウド同期も利用できます。",
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
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
