interface Props {
  size?: number;
  className?: string;
}

/**
 * macho up ブランドアイコン:
 * かわいい寄りの ムキムキ ツキノワグマ。
 *
 * 特徴:
 *  - 頭が大きめ (チビ寄りプロポーション) で愛らしさUP
 *  - 大きな目にキラキラのハイライト
 *  - 頬にうすピンクのチークブラッシュ
 *  - スマイル表情
 *  - 丸っこい体ながら、デルト・力こぶ・大胸筋でしっかり筋肉を主張
 *  - 胸の白い V (月の輪) マーク
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
      {/* ═══ 体・腕・頭 (currentColor) ═══ */}
      <g fill="currentColor">
        {/* 耳 */}
        <circle cx="8.5" cy="3.5" r="1.55" />
        <circle cx="15.5" cy="3.5" r="1.55" />

        {/* 大きな頭 (チビ寄り) */}
        <ellipse cx="12" cy="6.5" rx="4.2" ry="3.7" />

        {/* 鼻先 (snout) */}
        <ellipse cx="12" cy="9.2" rx="2.3" ry="1.7" />

        {/* 肩ライン */}
        <ellipse cx="12" cy="12.7" rx="6.8" ry="1.8" />

        {/* 三角筋 (まぁるく) */}
        <circle cx="5" cy="12.5" r="1.9" />
        <circle cx="19" cy="12.5" r="1.9" />

        {/* 力こぶ (丸い) */}
        <circle cx="4.5" cy="14.8" r="1.7" />
        <circle cx="19.5" cy="14.8" r="1.7" />

        {/* 前腕 */}
        <circle cx="4.5" cy="17.2" r="1.5" />
        <circle cx="19.5" cy="17.2" r="1.5" />

        {/* 拳 / 前足 (まんまるパー) */}
        <circle cx="4.5" cy="19.4" r="1.4" />
        <circle cx="19.5" cy="19.4" r="1.4" />

        {/* 大胸筋 (もっこり) */}
        <ellipse cx="12" cy="14.2" rx="5.4" ry="2.8" />

        {/* 丸い腹 (V テーパーよりまったり) */}
        <ellipse cx="12" cy="18.2" rx="4.6" ry="2.7" />

        {/* 短くて太い脚 */}
        <ellipse cx="9.5" cy="21.8" rx="2.4" ry="2.1" />
        <ellipse cx="14.5" cy="21.8" rx="2.4" ry="2.1" />
      </g>

      {/* ═══ 内耳 (淡ピンクで可愛く) ═══ */}
      <circle cx="8.5" cy="3.7" r="0.75" fill="#fda4af" opacity="0.55" />
      <circle cx="15.5" cy="3.7" r="0.75" fill="#fda4af" opacity="0.55" />

      {/* ═══ 大きなキラキラ目 ═══ */}
      <ellipse cx="10.5" cy="6.5" rx="0.7" ry="0.88" fill="#000" />
      <ellipse cx="13.5" cy="6.5" rx="0.7" ry="0.88" fill="#000" />
      {/* メインのハイライト */}
      <circle cx="10.72" cy="6.22" r="0.3" fill="#fff" />
      <circle cx="13.72" cy="6.22" r="0.3" fill="#fff" />
      {/* サブハイライト */}
      <circle cx="10.3" cy="6.85" r="0.14" fill="#fff" opacity="0.85" />
      <circle cx="13.3" cy="6.85" r="0.14" fill="#fff" opacity="0.85" />

      {/* ═══ 頬チーク ═══ */}
      <ellipse cx="8.6" cy="7.9" rx="0.85" ry="0.5" fill="#f87171" opacity="0.55" />
      <ellipse cx="15.4" cy="7.9" rx="0.85" ry="0.5" fill="#f87171" opacity="0.55" />

      {/* ═══ snout の濃淡 ═══ */}
      <ellipse cx="12" cy="9.4" rx="2.1" ry="1.4" fill="#000" opacity="0.15" />

      {/* ═══ 鼻 ═══ */}
      <ellipse cx="12" cy="8.55" rx="0.75" ry="0.55" fill="#000" />
      <ellipse cx="11.85" cy="8.4" rx="0.2" ry="0.15" fill="#fff" opacity="0.65" />

      {/* ═══ にっこり笑顔 ═══ */}
      <path
        d="M 12 9.2 L 12 9.7 M 10.7 9.85 Q 12 10.7 13.3 9.85"
        stroke="#000"
        strokeWidth="0.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* ═══ 力こぶの軽いハイライト (立体感少しだけ) ═══ */}
      <ellipse cx="4" cy="14.4" rx="0.5" ry="0.35" fill="#fff" opacity="0.18" />
      <ellipse cx="20" cy="14.4" rx="0.5" ry="0.35" fill="#fff" opacity="0.18" />

      {/* ═══ 胸の白 V マーク (ちょっと小さめでバランス) ═══ */}
      <path
        d="M 8.5 13.5 L 12 16.5 L 15.5 13.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.97"
      />
    </svg>
  );
}
