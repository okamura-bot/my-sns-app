import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // URL 内のコード（?code=）の自動引き換えを無効化し、
      // パスワードリセット画面で明示的に処理する（失敗理由を画面に出せるように）
      auth: { detectSessionInUrl: false },
    }
  );
}
