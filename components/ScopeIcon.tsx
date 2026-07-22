type Props = {
  /** アイコンサイズ(px) */
  size?: number;
  className?: string;
  /** Phosphor アイコンと差し替えやすいよう受け取るが未使用 */
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
};

// 拳銃のターゲットスコープ風アイコン（レティクル）
// 外周リング＋十字＋中心ピップ。色は currentColor を継承する
export default function ScopeIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {/* 外周リング */}
      <circle cx="128" cy="128" r="84" />
      {/* 十字線（中心にすき間を空けてピップを目立たせる） */}
      <line x1="128" y1="8" x2="128" y2="86" />
      <line x1="128" y1="170" x2="128" y2="248" />
      <line x1="8" y1="128" x2="86" y2="128" />
      <line x1="170" y1="128" x2="248" y2="128" />
      {/* 中心ピップ */}
      <circle cx="128" cy="128" r="12" fill="currentColor" stroke="none" />
    </svg>
  );
}
