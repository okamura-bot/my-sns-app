'use client';

import { useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import Webcam from 'react-webcam';
import {
  UploadSimple,
  X,
  CheckCircle,
  Star,
  Play,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import CrawlingSoldier from '@/components/CrawlingSoldier';
import ScopeIcon from '@/components/ScopeIcon';
import BulletHole from '@/components/BulletHole';
import { FACILITIES } from '@/lib/facilities';

// 追加したメディア1件分（写真 or 動画）
type Media = {
  id: string;
  url: string; // プレビュー用URL
  kind: 'image' | 'video';
  blob: Blob; // アップロードする実データ
};

const MAX_MEDIA = 8;

// 報告フォーム
// 写真・動画（カメラ撮影 or 端末からアップロード・複数可）/ スポット名(必須) / 評価 / 設備 を投稿する
export default function CameraCapture() {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaSeq = useRef(0);

  const [media, setMedia] = useState<Media[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [firing, setFiring] = useState(false); // 撮影の被弾エフェクト中
  const [spotName, setSpotName] = useState('');
  const [rating, setRating] = useState(0);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [caption, setCaption] = useState('');

  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMedia = useCallback((item: Omit<Media, 'id'>) => {
    setMedia((prev) => {
      if (prev.length >= MAX_MEDIA) return prev;
      mediaSeq.current += 1;
      return [...prev, { ...item, id: `${Date.now()}-${mediaSeq.current}` }];
    });
  }, []);

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((m) => m.id !== id);
    });
  };

  // カメラで写真を1枚撮影して追加
  // 撮影ボタンで照準を中心に止め、被弾エフェクト（銃痕）を見せてから写真を確定する
  const capture = () => {
    if (firing) return;
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setFiring(true);
    window.setTimeout(async () => {
      const blob = await (await fetch(imageSrc)).blob();
      addMedia({ url: URL.createObjectURL(blob), kind: 'image', blob });
      setFiring(false);
    }, 650);
  };

  // 端末のファイル（写真・動画）を複数追加
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const kind: Media['kind'] = file.type.startsWith('video') ? 'video' : 'image';
      addMedia({ url: URL.createObjectURL(file), kind, blob: file });
    });
    e.target.value = '';
  };

  const toggleFacility = (key: string) => {
    setFacilities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const submit = async () => {
    if (media.length === 0) {
      setError('写真または動画を1つ以上追加してください。');
      return;
    }
    if (!spotName.trim()) {
      setError('スポット名は必須です。');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('ログインが必要です。');
        return;
      }

      // すべてのメディアを Storage にアップロードして公開URLを集める
      const urls: string[] = [];
      for (let i = 0; i < media.length; i++) {
        const blob = media[i].blob;
        const rawExt = (blob.type.split('/')[1] || 'bin').toLowerCase();
        const ext = rawExt
          .replace('jpeg', 'jpg')
          .replace('quicktime', 'mov')
          .replace('x-matroska', 'mkv');
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, blob, { contentType: blob.type || 'application/octet-stream' });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          setError(`アップロードに失敗しました: ${uploadError.message}`);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('post-images').getPublicUrl(fileName);
        urls.push(publicUrl);
      }

      const { error: insertError } = await supabase.from('posts').insert({
        image_url: urls[0],
        image_urls: urls,
        spot_name: spotName.trim(),
        rating: rating || null,
        facilities,
        caption,
        user_id: user.id,
      });

      if (insertError) {
        console.error('posts insert error:', insertError);
        setError(`投稿の保存に失敗しました: ${insertError.message}`);
        return;
      }

      setDone(true);
    } catch (e) {
      setError('予期しないエラーが発生しました。');
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  // 投稿完了画面
  if (done) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <CheckCircle size={18} weight="fill" />
          報告が完了しました！
        </div>
        <Link
          href="/"
          className="inline-flex w-full max-w-sm items-center justify-center rounded-md bg-camo px-6 py-3 text-sm font-medium font-military tracking-wider text-white transition-colors hover:bg-camo-dark"
        >
          フィードを見る
        </Link>
      </div>
    );
  }

  const disabled = uploading;

  return (
    <div className="flex flex-col gap-6">
      {/* --- 写真・動画 --- */}
      <section className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-800">
          写真・動画 <span className="text-xs font-normal text-gray-500">（複数可）</span>
        </label>

        {/* サムネイル一覧 */}
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {media.map((m) => (
              <div key={m.id} className="relative aspect-square">
                {m.kind === 'video' ? (
                  <>
                    <video
                      src={m.url}
                      className="h-full w-full rounded-md object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    {/* 動画であることを示すアイコン */}
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <Play size={28} weight="fill" className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt="追加したメディア"
                    className="h-full w-full rounded-md object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(m.id)}
                  disabled={disabled}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-white hover:bg-gray-900"
                  aria-label="削除"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* カメラプレビュー（起動時のみ表示） */}
        {cameraOn && (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 p-3">
            {/* カメラ映像＋狙撃スコープ風の照準オーバーレイ */}
            <div className="relative w-full overflow-hidden rounded-md">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full"
              />
              {/* 照準（狙う間は上下横斜めに揺れ、撮影すると中心で停止） */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className={`${firing ? '' : 'scope-aim'} relative flex items-center justify-center`}>
                  <ScopeIcon
                    size={130}
                    className="text-white/85 drop-shadow-[0_0_3px_rgba(0,0,0,0.8)]"
                  />
                  {/* 中心の赤いターゲットドット */}
                  <span className="absolute h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
                </div>
              </div>

              {/* 被弾エフェクト（撮影した瞬間、中心に銃痕） */}
              {firing && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <BulletHole
                    size={220}
                    className="impact-pop text-white/90 drop-shadow-[0_0_3px_rgba(0,0,0,0.9)]"
                  />
                </div>
              )}
              {/* 四隅のフレーム（ファインダー枠） */}
              <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-white/70" />
              <span className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-white/70" />
              <span className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-white/70" />
              <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-white/70" />
            </div>
            {/* 大きなシャッター（撮影）ボタン */}
            <button
              type="button"
              onClick={capture}
              disabled={disabled || firing || media.length >= MAX_MEDIA}
              aria-label="写真を撮る"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-camo text-white shadow-lg ring-4 ring-camo/30 transition-transform hover:bg-camo-dark active:scale-95 disabled:opacity-50"
            >
              <ScopeIcon size={40} />
            </button>
            <Button variant="outline" onClick={() => setCameraOn(false)} className="w-full">
              カメラを閉じる
            </Button>
          </div>
        )}

        {/* 追加ボタン（カメラ / アップロード） */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCameraOn((v) => !v)}
            disabled={disabled || media.length >= MAX_MEDIA}
            className="flex-1 gap-2"
          >
            <ScopeIcon size={18} />
            カメラ
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || media.length >= MAX_MEDIA}
            className="flex-1 gap-2"
          >
            <UploadSimple size={18} />
            アップロード
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFilesSelected}
            className="hidden"
          />
        </div>
        {media.length >= MAX_MEDIA && (
          <p className="text-xs text-gray-500">追加できるのは最大 {MAX_MEDIA} 件までです。</p>
        )}
      </section>

      {/* --- スポット名（必須） --- */}
      <section className="flex flex-col gap-2">
        <label htmlFor="spotName" className="text-sm font-semibold text-gray-800">
          スポット名 <span className="text-red-600">*</span>
        </label>
        <input
          id="spotName"
          type="text"
          value={spotName}
          onChange={(e) => setSpotName(e.target.value)}
          placeholder="例: ○○ビル 1F ロビー"
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-camo-light disabled:bg-gray-100"
        />
      </section>

      {/* --- 評価 --- */}
      <section className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-800">評価</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating((r) => (r === n ? 0 : n))}
              disabled={disabled}
              aria-label={`${n}つ星`}
              className="text-amber-500 transition-transform hover:scale-110"
            >
              <Star size={30} weight={n <= rating ? 'fill' : 'regular'} />
            </button>
          ))}
        </div>
      </section>

      {/* --- 設備（アイコン・複数選択） --- */}
      <section className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-gray-800">設備</span>
        <div className="flex flex-wrap gap-2">
          {FACILITIES.map((f) => {
            const active = facilities.includes(f.key);
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleFacility(f.key)}
                disabled={disabled}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-camo bg-camo text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} weight={active ? 'fill' : 'regular'} />
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* --- ひとこと（任意） --- */}
      <section className="flex flex-col gap-2">
        <label htmlFor="caption" className="text-sm font-semibold text-gray-800">
          ひとこと <span className="text-xs font-normal text-gray-500">（任意）</span>
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="現場の様子やおすすめポイントなど"
          rows={3}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-camo-light disabled:bg-gray-100"
        />
      </section>

      {/* エラー */}
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* 送信 */}
      <Button onClick={submit} disabled={disabled} size="lg" className="w-full bg-camo hover:bg-camo-dark">
        {uploading ? <CrawlingSoldier size={20} label="Sending..." /> : 'Report'}
      </Button>
    </div>
  );
}
