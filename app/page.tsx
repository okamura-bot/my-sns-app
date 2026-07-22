import Link from 'next/link';
import { Camera, Star, MapPin } from '@phosphor-icons/react/dist/ssr';
import AuthStatus from '@/components/AuthStatus';
import { createClient } from '@/lib/supabase/server';
import { FACILITY_MAP } from '@/lib/facilities';

// このページはログインユーザーの Cookie を使って投稿を取得するため、常に動的レンダリングする
export const dynamic = 'force-dynamic';

type Post = {
  id: string;
  image_url: string;
  image_urls: string[] | null;
  spot_name: string | null;
  rating: number | null;
  facilities: string[] | null;
  caption: string | null;
  created_at: string;
};

// URLが動画かどうかを拡張子で判定する
function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v|mkv)(\?|$)/i.test(url);
}

// 投稿日時を「2026/7/22 15:30」形式にする
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
      <div className="border-b border-camo-dark bg-camo px-4 py-2">
        <p className="text-center text-lg font-jp-military tracking-[0.35em] text-white/95">
          営業マンの秘密基地
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
              <Camera size={48} className="text-gray-400" />
            </div>
            <p className="mb-6 text-gray-600">
              まだ報告がありません。現場のスポットを報告しましょう。
            </p>
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-md bg-camo px-6 py-3 text-sm font-medium font-military tracking-wider text-white hover:bg-camo-dark transition-colors"
            >
              <Camera size={18} />
              Mission
            </Link>
          </div>
        ) : (
          // フィード表示
          <div className="space-y-4">
            {posts.map((post) => {
              // 表示する画像（複数あればすべて、なければ代表画像1枚）
              const images =
                post.image_urls && post.image_urls.length > 0
                  ? post.image_urls
                  : [post.image_url];
              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  {/* 写真・動画（複数はスワイプ横スクロール） */}
                  {images.length > 1 ? (
                    <div className="flex snap-x snap-mandatory overflow-x-auto">
                      {images.map((url, i) =>
                        isVideoUrl(url) ? (
                          <video
                            key={i}
                            src={url}
                            controls
                            playsInline
                            preload="metadata"
                            className="aspect-square w-full shrink-0 snap-center bg-black object-contain"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={url}
                            alt={post.spot_name ?? '報告写真'}
                            className="aspect-square w-full shrink-0 snap-center object-cover"
                          />
                        ),
                      )}
                    </div>
                  ) : isVideoUrl(images[0]) ? (
                    <video
                      src={images[0]}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-square w-full bg-black object-contain"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[0]}
                      alt={post.spot_name ?? '報告写真'}
                      className="aspect-square w-full object-cover"
                    />
                  )}

                  <div className="flex flex-col gap-2 px-4 py-3">
                    {/* スポット名 + 画像枚数 */}
                    <div className="flex items-start justify-between gap-2">
                      {post.spot_name && (
                        <h2 className="flex items-center gap-1 font-military text-base font-bold tracking-wide text-gray-900">
                          <MapPin size={18} weight="fill" className="text-camo" />
                          {post.spot_name}
                        </h2>
                      )}
                      {images.length > 1 && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {images.length}枚
                        </span>
                      )}
                    </div>

                    {/* 評価 */}
                    {post.rating ? (
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={16} weight={n <= post.rating! ? 'fill' : 'regular'} />
                        ))}
                      </div>
                    ) : null}

                    {/* 設備アイコン */}
                    {post.facilities && post.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.facilities.map((key) => {
                          const f = FACILITY_MAP[key];
                          if (!f) return null;
                          const Icon = f.icon;
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 rounded-full bg-camo/10 px-2 py-1 text-xs text-camo-dark"
                            >
                              <Icon size={14} weight="fill" />
                              {f.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {post.caption && (
                      <p className="whitespace-pre-wrap text-sm text-gray-800">{post.caption}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 撮影ボタン（フローティング） */}
      {posts.length > 0 && (
        <Link
          href="/capture"
          className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-camo shadow-lg hover:bg-camo-dark transition-colors"
          aria-label="報告する"
        >
          <Camera size={24} className="text-white" />
        </Link>
      )}
    </div>
  );
}
