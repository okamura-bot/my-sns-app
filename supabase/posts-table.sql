-- ============================================================
-- posts テーブル（投稿）と Row Level Security (RLS) の設定
-- ============================================================
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行してください。
--
-- CameraCapture.tsx / ホーム画面は次の挙動をします:
--   - 投稿時: image_url / image_urls / spot_name / rating / facilities / caption / user_id を insert
--   - 一覧: 全ユーザーの投稿を新しい順に取得して表示
-- ============================================================

-- --- テーブル本体 ---
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  image_url   text not null,               -- 代表画像（1枚目）
  image_urls  text[] not null default '{}',-- 全画像（複数可）
  spot_name   text,                         -- スポット名（アプリ側で必須）
  rating      smallint,                     -- 評価（1〜5、任意）
  facilities  text[] not null default '{}', -- 設備カテゴリ（lib/facilities.ts の key）
  caption     text,
  created_at  timestamptz not null default now()
);

-- --- 既存テーブルへの追加（マイグレーション。既に存在する場合のみ効く） ---
alter table public.posts add column if not exists image_urls text[] not null default '{}';
alter table public.posts add column if not exists spot_name  text;
alter table public.posts add column if not exists rating     smallint;
alter table public.posts add column if not exists facilities text[] not null default '{}';

-- 新しい順の取得を速くするためのインデックス
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- --- RLS を有効化 ---
alter table public.posts enable row level security;

-- 1) 閲覧（SELECT）: 誰でも全投稿を閲覧可（公開フィード）
drop policy if exists "posts: 誰でも閲覧可" on public.posts;
create policy "posts: 誰でも閲覧可"
on public.posts
for select
to public
using (true);

-- 2) 投稿（INSERT）: ログインユーザーが自分の user_id でのみ作成可
drop policy if exists "posts: 自分の投稿のみ作成可" on public.posts;
create policy "posts: 自分の投稿のみ作成可"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

-- 3) 削除（DELETE）: 自分の投稿のみ削除可（任意）
drop policy if exists "posts: 自分の投稿のみ削除可" on public.posts;
create policy "posts: 自分の投稿のみ削除可"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id);
