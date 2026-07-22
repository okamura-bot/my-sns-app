-- ============================================================
-- post-images バケット用の Storage アクセスポリシー
-- ============================================================
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行してください。
--
-- 前提: ダッシュボードで「post-images」バケットを作成済みであること。
--
-- CameraCapture.tsx は次の挙動をします:
--   - アップロード先パス: "<ユーザーID>/<タイムスタンプ>.jpg"
--   - 読み取り: getPublicUrl（公開URL）
-- そのため、下記のポリシーで
--   1) 自分のフォルダにだけアップロードできる
--   2) 誰でも画像を閲覧できる
-- を許可します。
-- ============================================================

-- --- 1. アップロード（INSERT）: ログインユーザーが自分のフォルダにのみ ---
create policy "post-images: ユーザーは自分のフォルダにアップロード可"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- --- 2. 閲覧（SELECT）: 誰でも閲覧可（公開バケット相当） ---
create policy "post-images: 誰でも閲覧可"
on storage.objects
for select
to public
using (
  bucket_id = 'post-images'
);

-- --- 3. 削除（DELETE）: 自分がアップロードした画像のみ削除可（任意） ---
create policy "post-images: ユーザーは自分の画像を削除可"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
