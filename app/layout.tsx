import type { Metadata } from 'next';
import { Black_Ops_One, Train_One } from 'next/font/google';
import './globals.css';

// ミリタリー調ステンシルフォント（英字・見出し用）。日本語はCSS側でゴシックにフォールバック
const military = Black_Ops_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-military',
  display: 'swap',
});

// 日本語向けステンシル体（軍用クレート風）。サブタイトルなどに使用
const jpMilitary = Train_One({
  weight: '400',
  subsets: ['latin'],
  preload: false,
  variable: '--font-jp-military',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EIGYO BASE — 営業マンの秘密基地',
  description: '営業マンの秘密基地。外回り営業マン向けに、涼めるポイント・給水ポイント・トイレポイントを共有するSNS。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${military.variable} ${jpMilitary.variable}`}>
      <body>
        <main className="min-h-screen military-bg">
          {children}
        </main>
      </body>
    </html>
  );
}