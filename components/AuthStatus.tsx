'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import CrawlingSoldier from '@/components/CrawlingSoldier';

// ログイン状態を表示するコンポーネント
// ログイン中: メールアドレス + ログアウトボタン
// 未ログイン: ログインリンク
export default function AuthStatus() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のログイン状態を取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });

    // ログイン・ログアウトの変化を監視して表示を更新する
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // 状態を確認中は匍匐前進する軍人を表示
  if (loading) {
    return <CrawlingSoldier size={20} className="text-camo-dark" />;
  }

  // 未ログイン
  if (!email) {
    return (
      <Link
        href="/login"
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        ログイン
      </Link>
    );
  }

  // ログイン中
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1 text-sm text-gray-700">
        <UserCircle size={18} weight="fill" className="text-primary-600" />
        <span className="max-w-[140px] truncate">{email}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        ログアウト
      </button>
    </div>
  );
}
