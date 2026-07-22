type Props = {
  size?: number;
  className?: string;
};

// 被弾痕（弾の穴＋放射状のヒビ割れ）。ガラスに撃ち込んだような表現
// 色は currentColor を継承し、暗い縁取り(drop-shadow)で写真の上でも見えるようにする
export default function BulletHole({ size = 200, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* 放射状のヒビ（中心から外へ、途中で折れ曲がる） */}
      <g
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M100,100 L150,112 L190,120" />
        <path d="M100,100 L128,150 L150,185" />
        <path d="M100,100 L98,150 L95,190" />
        <path d="M100,100 L70,140 L35,168" />
        <path d="M100,100 L55,104 L12,110" />
        <path d="M100,100 L68,72 L28,45" />
        <path d="M100,100 L102,58 L108,14" />
        <path d="M100,100 L140,68 L178,38" />
      </g>

      {/* 同心の破断リング（不規則な多角形） */}
      <polygon
        points="100,62 130,72 142,100 130,130 100,142 70,130 58,100 70,72"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.85"
      />
      <polygon
        points="100,80 116,88 120,100 114,116 100,120 84,114 80,100 86,86"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        opacity="0.7"
      />

      {/* 弾の穴（中心） */}
      <circle cx="100" cy="100" r="15" fill="currentColor" opacity="0.9" />
      <circle cx="100" cy="100" r="9" fill="#0a0a0a" />
    </svg>
  );
}
