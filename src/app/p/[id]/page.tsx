import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { TYPE_CONFIG } from "@/lib/types";
import { PublicPromptClient } from "./PublicPromptClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: Promise<{ id: string }>;
};

async function getDocument(id: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("visibility", "public")
    .is("deleted_at", null)
    .single();

  if (error || !data) return null;

  // Fetch author profile
  let author: { name: string; avatarUrl?: string } | null = null;
  if (data.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", data.user_id)
      .single();
    if (profile) {
      author = {
        name: profile.display_name || "Anonymous",
        avatarUrl: profile.avatar_url || undefined,
      };
    }
  }

  return {
    id: data.id as string,
    userId: data.user_id as string,
    title: (data.title as string | null) || "Untitled",
    bodyMd: data.body_md as string,
    type: data.type as "note" | "prompt" | "template",
    tags: (data.tags as string[]) || [],
    likeCount: (data.like_count as number) || 0,
    forkCount: (data.fork_count as number) || 0,
    saveCount: (data.save_count as number) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    author,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) {
    return { title: "Not Found | PromptNotes" };
  }

  const description = doc.bodyMd.slice(0, 160).replace(/\n/g, " ");
  const ogImageUrl = `/api/og?title=${encodeURIComponent(doc.title)}&type=${doc.type}${doc.author ? `&author=${encodeURIComponent(doc.author.name)}` : ""}`;

  const siteUrl = "https://prompt-notes.ai";
  const pageUrl = `${siteUrl}/p/${id}`;

  return {
    title: doc.title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: doc.title,
      description,
      type: "article",
      url: pageUrl,
      siteName: "PromptNotes",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: doc.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicPromptPage({ params }: Props) {
  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) {
    notFound();
  }

  const typeConfig = TYPE_CONFIG[doc.type];

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center no-underline"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-horizontal.png" alt="PromptNotes" className="h-8 w-auto dark:invert" />
          </a>
          <a
            href="/"
            className="text-sm px-4 py-2 bg-[#4F46E5] text-white rounded-full font-medium no-underline hover:bg-[#4338CA] transition-colors"
          >
            PromptNotesで開く
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Type badge & date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-[#4F46E5]/10 text-[#4F46E5] dark:bg-[#4F46E5]/20 dark:text-[#a5b4fc]">
            {typeConfig.icon} {typeConfig.label}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(doc.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
          {doc.title}
        </h1>

        {/* Author */}
        {doc.author && (
          <div className="flex items-center gap-3 mb-6">
            {doc.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doc.author.avatarUrl}
                alt={doc.author.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-sm font-bold">
                {doc.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {doc.author.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats & Actions + Markdown body — client component */}
        <PublicPromptClient
          id={doc.id}
          title={doc.title}
          likeCount={doc.likeCount}
          forkCount={doc.forkCount}
          bodyMd={doc.bodyMd}
        />

        {/* CTA */}
        <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-[#4F46E5]/5 to-[#4F46E5]/10 dark:from-[#4F46E5]/10 dark:to-[#4F46E5]/20 border border-[#4F46E5]/20 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            PromptNotesでプロンプトを管理しよう
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            プロンプトの保存、共有、AI レビューが無料で使えます
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#4F46E5] text-white rounded-full font-medium no-underline hover:bg-[#4338CA] transition-colors"
          >
            PromptNotesを始める
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 mt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} PromptNotes
        </p>
      </footer>
    </div>
  );
}
