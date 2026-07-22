import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // リダイレクト先（同一サイト内の相対パスのみ許可。無ければトップページ）
  const nextParam = requestUrl.searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // 交換に失敗したらログイン画面へエラー付きで戻す
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // 完了後は next（パスワードリセット等）またはトップページへリダイレクト
  return NextResponse.redirect(requestUrl.origin + next);
}
