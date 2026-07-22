'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CrawlingSoldier from '@/components/CrawlingSoldier';

// パスワードリセット画面
// Supabase Auth のパスワード更新フローに対応
export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const prepare = async () => {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

      // Supabase がリンク無効・期限切れ等をエラーとして返すケース
      const errorDescription =
        url.searchParams.get('error_description') || hashParams.get('error_description');
      if (errorDescription) {
        setMessage({
          type: 'error',
          text: `リンクが無効か期限切れです（${errorDescription}）。もう一度パスワード再設定をやり直してください。`,
        });
        return;
      }

      // メールのリンクから来た場合：?code= を明示的にセッションへ引き換える
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage({
            type: 'error',
            text: `リンクの確認に失敗しました（${error.message}）。同じブラウザでメールのリンクを開いているかご確認ください。`,
          });
          return;
        }
        setReady(true);
        return;
      }

      // コードが無い場合：既にセッションがあるかを確認
      const { data } = await supabase.auth.getSession();
      if (data.session?.user.email) {
        setReady(true);
        return;
      }

      // どれにも該当しない場合はログイン画面へ
      router.push('/login');
    };

    prepare();
  }, [router, supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmedPassword) {
      setMessage({ type: 'error', text: 'パスワードが一致しません。' });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage({ type: 'success', text: 'パスワードを更新しました。新しいパスワードでログインしてください。' });
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました。';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">パスワードをリセット</CardTitle>
        </CardHeader>
        <CardContent>
          {!ready ? (
            message ? (
              <div className="rounded-md p-3 text-sm bg-red-50 text-red-700 border border-red-200">
                {message.text}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-600">確認中...</p>
            )
          ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirmedPassword" className="block text-sm font-medium text-gray-700 mb-1">
                パスワードの確認
              </label>
              <Input
                id="confirmedPassword"
                type="password"
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                placeholder="もう一度入力"
                required
                minLength={8}
              />
            </div>

            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <CrawlingSoldier size={20} label="更新中..." /> : 'パスワードを更新する'}
            </Button>
          </form>
          )}

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary-600 hover:underline">
              ログインに戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
