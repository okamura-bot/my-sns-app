'use client';

import { useState } from 'react';
import { Star, MapPin, FunnelSimple } from '@phosphor-icons/react/dist/ssr';
import { FACILITIES, FACILITY_MAP } from '@/lib/facilities';

export type Post = {
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

// フィード表示 ＋ 設備カテゴリでの絞り込み
export default function Feed({ posts }: { posts: Post[] }) {
  // 選択中の設備カテゴリ（複数選択・AND条件）
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // 選択カテゴリを「すべて含む」投稿だけ表示（未選択なら全件）
  const filtered =
    selected.length === 0
      ? posts
      : posts.filter((p) =>
          selected.every((k) => (p.facilities ?? []).includes(k)),
        );

  return (
    <div className="flex flex-col gap-4">
      {/* --- カテゴリフィルター --- */}
      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white/90 p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          <FunnelSimple size={14} weight="bold" />
          カテゴリで絞り込み
        </div>
        <div className="flex flex-wrap gap-2">
          {/* すべて表示 */}
          <button
            type="button"
            onClick={() => setSelected([])}
            aria-pressed={selected.length === 0}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected.length === 0
                ? 'border-camo bg-camo text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            すべて
          </button>
          {FACILITIES.map((f) => {
            const active = selected.includes(f.key);
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggle(f.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-camo bg-camo text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} weight={active ? 'fill' : 'regular'} />
                {f.label}
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <p className="text-xs text-gray-500">
            {filtered.length} 件表示中
          </p>
        )}
      </div>

      {/* --- 投稿一覧 --- */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white/90 py-16 text-center text-sm text-gray-500">
          選択したカテゴリに合う報告はありません。
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => {
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
    </div>
  );
}
