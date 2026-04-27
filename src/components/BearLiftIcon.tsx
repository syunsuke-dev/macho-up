interface Props {
  size?: number;
  className?: string;
}

/**
 * macho up ブランドアイコン:
 * イラスト風 かわいい ツキノワグマ がバーベルを頭上にプレスしているポーズ。
 *
 * 腕は「肩から拳まで連続した一本の柔らかいシェイプ」として描画し、
 * 不自然な多段スタックを回避。拳は重なる形で接続。
 */
export function BearLiftIcon({ size = 24, className = '' }: Props) {
  // パレット
  const BODY = '#2d2840';
  const OUTLINE = '#1a1530';
  const SNOUT = '#e8d4a8';
  const PINK = '#f8b5c2';
  const PINK_DEEP = '#f87171';
  const SW = 0.4;
  const SW_THIN = 0.3;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ═══ バーベル ═══ */}
      <rect
        x="3"
        y="2.6"
        width="18"
        height="0.85"
        rx="0.42"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW_THIN}
      />
      <rect
        x="1.7"
        y="2"
        width="1.4"
        height="2.1"
        rx="0.35"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW_THIN}
      />
      <rect
        x="20.9"
        y="2"
        width="1.4"
        height="2.1"
        rx="0.35"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW_THIN}
      />

      {/* ═══ 腕 (連続した一本のシェイプ) ═══ */}
      <ellipse
        cx="4.7"
        cy="8.2"
        rx="1.55"
        ry="4.7"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />
      <ellipse
        cx="19.3"
        cy="8.2"
        rx="1.55"
        ry="4.7"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />

      {/* ═══ 拳 (バーを握る、腕の上端と重なる) ═══ */}
      <circle
        cx="4.7"
        cy="3.5"
        r="1.4"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />
      <circle
        cx="19.3"
        cy="3.5"
        r="1.4"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />

      {/* ═══ 耳 (頭の後ろに配置) ═══ */}
      <circle
        cx="9"
        cy="4.5"
        r="1.5"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />
      <circle
        cx="15"
        cy="4.5"
        r="1.5"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />
      <circle cx="9" cy="4.8" r="0.85" fill={PINK} />
      <circle cx="15" cy="4.8" r="0.85" fill={PINK} />

      {/* ═══ 胴体 (頭の下に大きく) ═══ */}
      <ellipse
        cx="12"
        cy="15.3"
        rx="5.7"
        ry="5.2"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />

      {/* ═══ 脚 ═══ */}
      <ellipse
        cx="9.4"
        cy="21.5"
        rx="2.1"
        ry="2.1"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />
      <ellipse
        cx="14.6"
        cy="21.5"
        rx="2.1"
        ry="2.1"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />
      {/* 肉球 */}
      <ellipse cx="9.4" cy="22.4" rx="0.85" ry="0.42" fill={PINK} />
      <ellipse cx="14.6" cy="22.4" rx="0.85" ry="0.42" fill={PINK} />

      {/* ═══ 頭 (前面、肩の上) ═══ */}
      <ellipse
        cx="12"
        cy="7.6"
        rx="4.1"
        ry="3.6"
        fill={BODY}
        stroke={OUTLINE}
        strokeWidth={SW}
      />

      {/* ═══ 鼻先 (クリームパッチ) ═══ */}
      <ellipse
        cx="12"
        cy="9.8"
        rx="2.15"
        ry="1.6"
        fill={SNOUT}
        stroke={OUTLINE}
        strokeWidth={SW_THIN}
      />

      {/* ═══ 目 ═══ */}
      <ellipse cx="10.3" cy="7.3" rx="0.65" ry="0.92" fill={OUTLINE} />
      <ellipse cx="13.7" cy="7.3" rx="0.65" ry="0.92" fill={OUTLINE} />
      <circle cx="10.5" cy="7" r="0.3" fill="#fff" />
      <circle cx="13.9" cy="7" r="0.3" fill="#fff" />
      <circle cx="10.06" cy="7.62" r="0.14" fill="#fff" opacity="0.85" />
      <circle cx="13.46" cy="7.62" r="0.14" fill="#fff" opacity="0.85" />

      {/* ═══ 鼻 ═══ */}
      <ellipse cx="12" cy="9.25" rx="0.6" ry="0.45" fill={OUTLINE} />
      <ellipse cx="11.85" cy="9.13" rx="0.18" ry="0.13" fill="#fff" opacity="0.7" />

      {/* ═══ にっこり口 ═══ */}
      <path
        d="M 10.95 10.25 Q 12 11.2 13.05 10.25 Q 12 10.65 10.95 10.25 Z"
        fill={PINK_DEEP}
        opacity="0.85"
        stroke={OUTLINE}
        strokeWidth={SW_THIN}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ═══ 胸の白い V (月の輪) ═══ */}
      <path
        d="M 9 13.5 L 12 16.2 L 15 13.5"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
