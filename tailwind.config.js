/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // ミリタリーステンシル。日本語は含まれないためゴシックにフォールバック
        military: [
          'var(--font-military)',
          'Yu Gothic',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'sans-serif',
        ],
        // 日本語ステンシル（軍用クレート風）
        'jp-military': [
          'var(--font-jp-military)',
          'Yu Gothic',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'sans-serif',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f5f7ef',
          100: '#e7ecd6',
          200: '#d0daae',
          300: '#b0c07d',
          400: '#8a9a5b',
          500: '#6b7a3a',
          600: '#556b2f',
          700: '#4b5320',
          800: '#3a4019',
          900: '#2f3123',
        },
        // 迷彩（ミリタリー）カラー — 営業マンの秘密基地テーマ
        camo: {
          light: '#8a9a5b', // カーキ
          DEFAULT: '#4b5320', // オリーブドラブ
          dark: '#3a4019', // ダークオリーブ
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
