import Link from 'next/link';
import { House } from '@phosphor-icons/react/dist/ssr';
import CameraCapture from '@/components/CameraCapture';
import AuthStatus from '@/components/AuthStatus';

// 撮影画面
// CameraCapture コンポーネントを呼び出す
export default function CapturePage() {
  return (
    <div className="max-w-lg mx-auto min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* TOP（フィード）へ戻るボタン */}
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-md bg-camo px-3 py-1.5 text-sm font-medium font-military tracking-wide text-white transition-colors hover:bg-camo-dark"
            >
              <House size={16} weight="fill" />
              TOP
            </Link>
            <h1 className="text-lg font-bold text-gray-900">撮影</h1>
          </div>
          <AuthStatus />
        </div>
      </header>
      <main className="px-4 py-6">
        <CameraCapture />
      </main>
    </div>
  );
}
