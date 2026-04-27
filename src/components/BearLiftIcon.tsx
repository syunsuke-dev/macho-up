interface Props {
  size?: number;
  className?: string;
}

/**
 * macho up ブランドアイコン:
 * ツキノワグマ (胸に V 字マーク) のムキムキ全身が、
 * 比較的小さなバーベルを頭上にプレスしている図。
 *
 * 構成:
 *   - 頭上の小さなバーベル
 *   - 細い前腕 → 巨大な力こぶ → 広い肩 → 大胸筋 → V テーパー腰 → 太い脚
 *   - 胸に白い V (月の輪) マーク
 *
 * fill="currentColor" なので親要素の text-* で体色を変更可能。
 */
export function BearLiftIcon({ size = 24, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ═══ 体パーツ (currentColor) ═══ */}
      <g fill="currentColor">
        {/* バーベル: バー (短い) */}
        <rect x="9.5" y="0.5" width="5" height="0.7" rx="0.35" />
        {/* バーベル: プレート (小さめ) */}
        <rect x="8.3" y="0" width="1.4" height="1.7" rx="0.4" />
        <rect x="14.3" y="0" width="1.4" height="1.7" rx="0.4" />

        {/* 前腕 */}
        <rect x="9.2" y="1.4" width="1.2" height="1.8" rx="0.6" />
        <rect x="13.6" y="1.4" width="1.2" height="1.8" rx="0.6" />

        {/* 力こぶ (巨大) */}
        <ellipse cx="9.5" cy="5" rx="1.8" ry="1.9" />
        <ellipse cx="14.5" cy="5" rx="1.8" ry="1.9" />

        {/* 広い肩・僧帽筋 */}
        <ellipse cx="12" cy="9" rx="7" ry="2.2" />

        {/* 大胸筋 (もりっと) */}
        <ellipse cx="12" cy="12.5" rx="6.5" ry="3.2" />

        {/* V テーパー腰 (シェイプ) */}
        <path d="M 6 13 L 8.5 19 L 15.5 19 L 18 13 Z" />

        {/* 太い脚 */}
        <ellipse cx="9.8" cy="21" rx="2.3" ry="2.6" />
        <ellipse cx="14.2" cy="21" rx="2.3" ry="2.6" />

        {/* 頭 (肩の上に最後に重ねる) */}
        <circle cx="10" cy="6.5" r="1" />
        <circle cx="14" cy="6.5" r="1" />
        <ellipse cx="12" cy="8.2" rx="2.3" ry="1.9" />
      </g>

      {/* ═══ 胸の白い V 字マーク (ツキノワグマの月の輪) ═══ */}
      <path
        d="M 8.8 11 L 12 14 L 15.2 11"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />

      {/* ═══ 顔のディテール ═══ */}
      <ellipse cx="12" cy="8.9" rx="1.1" ry="0.7" fill="#000" opacity="0.2" />
      <circle cx="11" cy="7.7" r="0.32" fill="#000" opacity="0.85" />
      <circle cx="13" cy="7.7" r="0.32" fill="#000" opacity="0.85" />
      <ellipse cx="12" cy="8.6" rx="0.5" ry="0.35" fill="#000" opacity="0.9" />
    </svg>
  );
}
