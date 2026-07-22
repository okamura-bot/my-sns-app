import { cn } from '@/lib/utils';

type Props = {
  /** アイコンの高さ(px)。幅は自動で高さの2倍 */
  size?: number;
  /** 右側に添えるテキスト（例: 「処理中」） */
  label?: string;
  /** 色などの追加クラス。色は currentColor を継承する */
  className?: string;
};

// 匍匐前進する軍人のローディングインジケーター
// 手足がCSSアニメーションで交互に動き、体が小さく前後に揺れる
export default function CrawlingSoldier({ size = 24, label, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status" aria-label={label ?? '読み込み中'}>
      <svg
        width={size * 2}
        height={size}
        viewBox="0 0 120 60"
        fill="currentColor"
        aria-hidden="true"
      >
        <g className="cs-crawl-body">
          {/* 脚（胴の後ろ側・trail） */}
          <g className="cs-leg cs-leg-a">
            <path d="M34,44 L20,48 L10,43" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="cs-leg cs-leg-b">
            <path d="M34,44 L22,52 L12,54" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* 胴体（伏せた姿勢） */}
          <rect x="30" y="33" width="52" height="14" rx="7" />
          {/* 背嚢 */}
          <rect x="37" y="24" width="24" height="12" rx="3" opacity="0.8" />

          {/* 頭部＋ヘルメット（前方=右向き） */}
          <circle cx="88" cy="37" r="7" />
          <path d="M80,35 A9,8 0 0 1 97,34 L98,37 L80,37 Z" />

          {/* 腕（地面を掻いて前進） */}
          <g className="cs-arm cs-arm-back">
            <path d="M78,40 L66,47 L58,50" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="cs-arm cs-arm-front">
            <path d="M78,38 L92,44 L101,50" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
}
