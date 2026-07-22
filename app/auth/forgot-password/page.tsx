'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CrawlingSoldier from '@/components/CrawlingSoldier';

// パスワード再設定の申請画面
// メールアドレスを入力すると、Supabase がリセット用リンクをメールで送信する
export default function ForgotPassword() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;

      // アカウントの有無を漏らさないため、常に同じ成功文言を表示する
      setMessage({
        type: 'success',
        text: 'ご登録のメールアドレス宛に、パスワード再設定用のメールを送信しました。メールをご確認ください。',
      });
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'エラーが発生しました';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">パスワードをお忘れの方</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <CrawlingSoldier size={20} label="送信中..." /> : '再設定メールを送信'}
            </Button>
          </form>

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
