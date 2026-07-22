import Link from 'next/link';
import { Star } from '@phosphor-icons/react/dist/ssr';
import AuthStatus from '@/components/AuthStatus';
import ScopeIcon from '@/components/ScopeIcon';
import Feed, { type Post } from '@/components/Feed';
import { createClient } from '@/lib/supabase/server';

// このページはログインユーザーの Cookie を使って投稿を取得するため、常に動的レンダリングする
export const dynamic = 'force-dynamic';

// タイムライン画面（ホーム）: posts テーブルから投稿を新しい順に取得して表示する
export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('id, image_url, image_urls, spot_name, rating, facilities, caption, created_at')
    .order('created_at', { ascending: false });

  const posts: Post[] = data ?? [];

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-[#9c7c4a] bg-[#c2a068] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="EIGYO BASE — 営業マンの秘密基地"
            className="h-11 w-auto rounded drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          />
          <AuthStatus />
        </div>
      </header>

      {/* サブタイトル帯 */}
      <div className="border-b border-black/30 bg-camo-dark px-4 py-2">
        <p className="flex items-center justify-center gap-2 text-lg font-jp-military tracking-[0.3em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          <Star size={16} weight="fill" className="shrink-0 text-amber-400" />
          <span className="pl-[0.3em]">営業マンの秘密基地</span>
          <Star size={16} weight="fill" className="shrink-0 text-amber-400" />
        </p>
      </div>

      {/* タイムライン */}
      <main className="px-4 py-6">
        {error ? (
          // 取得エラー。原因によって案内を出し分ける
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            フィードの取得に失敗しました: {error.message}
            <br />
            {/fetch failed|Failed to fetch|ENOTFOUND|getaddrinfo/i.test(error.message) ? (
              <span className="text-red-600">
                Supabase に接続できていません。.env.local の NEXT_PUBLIC_SUPABASE_URL /
                ANON_KEY が正しいプロジェクトを指しているか確認し、dev サーバーを再起動してください。
              </span>
            ) : (
              <span className="text-red-600">
                posts テーブル（supabase/posts-table.sql）が作成済みか、RLS 設定を確認してください。
              </span>
            )}
          </div>
        ) : posts.length === 0 ? (
          // 空状態: 投稿がまだない場合のUI
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <ScopeIcon size={48} className="text-gray-400" />
            </div>
            <p className="mb-6 text-gray-600">
              まだ報告がありません。現場のスポットを報告しましょう。
            </p>
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-md bg-camo px-6 py-3 text-sm font-medium font-military tracking-wider text-white hover:bg-camo-dark transition-colors"
            >
              <ScopeIcon size={18} />
              Mission
            </Link>
          </div>
        ) : (
          // フィード表示（カテゴリ絞り込みは Feed 内で処理）
          <Feed posts={posts} />
        )}
      </main>

      {/* 撮影ボタン（フローティング） */}
      {posts.length > 0 && (
        <Link
          href="/capture"
          className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-camo shadow-lg hover:bg-camo-dark transition-colors"
          aria-label="報告する"
        >
          <ScopeIcon size={24} className="text-white" />
        </Link>
      )}
    </div>
  );
}
