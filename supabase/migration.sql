-- PromptNotes DB Migration v1
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ===========================================
-- 1. PROFILES テーブル
-- ===========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===========================================
-- 2. DOCUMENTS テーブル
-- ===========================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text,
  body_md text not null default '',
  type text not null default 'note' check (type in ('note', 'prompt', 'template')),
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  tags text[] default '{}',
  like_count integer default 0,
  save_count integer default 0,
  fork_count integer default 0,
  forked_from_id uuid,
  variables jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===========================================
-- 3. LIKES テーブル（誰がどのドキュメントをいいねしたか）
-- ===========================================
create table if not exists public.likes (
  user_id uuid references auth.users on delete cascade not null,
  document_id uuid references public.documents(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, document_id)
);

-- ===========================================
-- 4. インデックス
-- ===========================================
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_visibility on public.documents(visibility);
create index if not exists idx_documents_type on public.documents(type);
create index if not exists idx_documents_created_at on public.documents(created_at desc);
create index if not exists idx_documents_like_count on public.documents(like_count desc);
create index if not exists idx_likes_document_id on public.likes(document_id);

-- ===========================================
-- 5. RLS (Row Level Security) ポリシー
-- ===========================================

-- Documents
alter table public.documents enable row level security;

create policy "Public documents are viewable by everyone"
  on public.documents for select
  using (visibility = 'public');

create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can create own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Profiles
alter table public.profiles enable row level security;

create policy "Profiles viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Likes
alter table public.likes enable row level security;

create policy "Users can view own likes"
  on public.likes for select
  using (auth.uid() = user_id);

create policy "Users can insert own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- ===========================================
-- 6. 自動トリガー: updated_at 更新
-- ===========================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on public.documents
  for each row execute procedure public.update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ===========================================
-- 7. 自動トリガー: 新規ユーザー → プロフィール自動作成
-- ===========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===========================================
-- 8. いいねカウント同期関数
-- ===========================================
create or replace function public.update_like_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.documents
    set like_count = like_count + 1
    where id = NEW.document_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.documents
    set like_count = greatest(0, like_count - 1)
    where id = OLD.document_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_like_changed
  after insert or delete on public.likes
  for each row execute procedure public.update_like_count();

-- ===========================================
-- v2 Migration: Collections, Document Versions, deleted_at
-- ===========================================

-- deleted_at カラム（ゴミ箱機能）
alter table public.documents add column if not exists deleted_at timestamptz default null;

-- ===========================================
-- COLLECTIONS テーブル
-- ===========================================
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  emoji text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_collections_user_id on public.collections(user_id);

alter table public.collections enable row level security;

create policy "Users can view own collections" on public.collections for select using (auth.uid() = user_id);
create policy "Users can insert own collections" on public.collections for insert with check (auth.uid() = user_id);
create policy "Users can update own collections" on public.collections for update using (auth.uid() = user_id);
create policy "Users can delete own collections" on public.collections for delete using (auth.uid() = user_id);

create trigger collections_updated_at
  before update on public.collections
  for each row execute procedure public.update_updated_at();

-- ===========================================
-- COLLECTION_ITEMS テーブル
-- ===========================================
create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade not null,
  document_id uuid references public.documents(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique(collection_id, document_id)
);

create index if not exists idx_collection_items_collection_id on public.collection_items(collection_id);

alter table public.collection_items enable row level security;

create policy "Users can view own collection items" on public.collection_items for select
  using (exists (select 1 from public.collections where collections.id = collection_id and collections.user_id = auth.uid()));
create policy "Users can insert own collection items" on public.collection_items for insert
  with check (exists (select 1 from public.collections where collections.id = collection_id and collections.user_id = auth.uid()));
create policy "Users can delete own collection items" on public.collection_items for delete
  using (exists (select 1 from public.collections where collections.id = collection_id and collections.user_id = auth.uid()));

-- ===========================================
-- DOCUMENT_VERSIONS テーブル
-- ===========================================
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  body_md text not null default '',
  version_number integer not null default 1,
  created_at timestamptz default now()
);

create index if not exists idx_document_versions_document_id on public.document_versions(document_id);

alter table public.document_versions enable row level security;

create policy "Users can view own document versions" on public.document_versions for select using (auth.uid() = user_id);
create policy "Users can insert own document versions" on public.document_versions for insert with check (auth.uid() = user_id);
create policy "Users can delete own document versions" on public.document_versions for delete using (auth.uid() = user_id);

-- GRANT
grant all on public.collections to service_role, authenticated;
grant all on public.collection_items to service_role, authenticated;
grant all on public.document_versions to service_role, authenticated;
