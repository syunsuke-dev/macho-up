interface Props {
  size?: number;
  className?: string;
}

/**
 * macho up ブランドアイコン:
 * リアル寄りの ムキムキ ツキノワグマ (胸に白い V マーク = 月の輪)。
 * 二本足で立ち、両腕を体の側面で曲げて力こぶを見せたポーズ。
 *
 * 顔は鼻先 (snout) が突き出る本物のクマに近いシルエット。
 * 目に光のハイライト、鼻にもツヤを入れて生命感を出している。
 * 大胸筋・腹筋・力こぶに陰影ラインを入れて筋肉のディテール表現。
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
        <ellipse cx="9.5" cy="3" rx="1.4" ry="1.3" />
        <ellipse cx="14.5" cy="3" rx="1.4" ry="1.3" />

        {/* 頭 (上半分) */}
        <ellipse cx="12" cy="5" rx="2.9" ry="2.5" />

        {/* 鼻先 (snout, 突き出る) */}
        <ellipse cx="12" cy="7.3" rx="2.1" ry="1.6" />

        {/* 広い肩・僧帽筋 */}
        <ellipse cx="12" cy="10.7" rx="9.5" ry="2.4" />

        {/* 力こぶ (左右) */}
        <ellipse cx="3" cy="12.5" rx="2.3" ry="2.5" />
        <ellipse cx="21" cy="12.5" rx="2.3" ry="2.5" />

        {/* 前腕 */}
        <ellipse cx="3" cy="17" rx="1.9" ry="2.4" />
        <ellipse cx="21" cy="17" rx="1.9" ry="2.4" />

        {/* 拳 / 前足 */}
        <circle cx="3" cy="20" r="1.6" />
        <circle cx="21" cy="20" r="1.6" />

        {/* 大胸筋 */}
        <ellipse cx="12" cy="14" rx="6.6" ry="3.2" />

        {/* V テーパー腰 / 腹筋 */}
        <path d="M 6 14.5 L 8 20 L 16 20 L 18 14.5 Z" />

        {/* 太い脚 */}
        <ellipse cx="9.5" cy="21.6" rx="2.5" ry="2.3" />
        <ellipse cx="14.5" cy="21.6" rx="2.5" ry="2.3" />
      </g>

      {/* ═══ 内耳の影 ═══ */}
      <ellipse cx="9.4" cy="3.3" rx="0.55" ry="0.55" fill="#000" opacity="0.32" />
      <ellipse cx="14.6" cy="3.3" rx="0.55" ry="0.55" fill="#000" opacity="0.32" />

      {/* ═══ 目 (黒目 + ハイライト) ═══ */}
      <circle cx="10.7" cy="5.2" r="0.44" fill="#000" opacity="0.94" />
      <circle cx="13.3" cy="5.2" r="0.44" fill="#000" opacity="0.94" />
      <circle cx="10.84" cy="5.05" r="0.16" fill="#fff" opacity="0.9" />
      <circle cx="13.44" cy="5.05" r="0.16" fill="#fff" opacity="0.9" />

      {/* ═══ snout の濃淡 ═══ */}
      <ellipse cx="12" cy="7.5" rx="1.9" ry="1.25" fill="#000" opacity="0.2" />

      {/* ═══ 鼻 (ツヤ付き黒) ═══ */}
      <ellipse cx="12" cy="6.7" rx="0.95" ry="0.65" fill="#000" />
      <ellipse cx="11.8" cy="6.55" rx="0.24" ry="0.17" fill="#fff" opacity="0.6" />

      {/* ═══ 口 ═══ */}
      <path
        d="M 12 7.4 L 12 8.1 M 11.25 8.25 Q 12 8.7 12.75 8.25"
        stroke="#000"
        strokeWidth="0.45"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* ═══ 筋肉のシャドウライン ═══ */}
      {/* 大胸筋の中央 */}
      <path
        d="M 12 11.5 L 12 16.6"
        stroke="#000"
        strokeWidth="0.55"
        opacity="0.25"
        fill="none"
        strokeLinecap="round"
      />
      {/* 力こぶの分け目 */}
      <path
        d="M 4.6 12.8 Q 4.5 14.5 4.5 16"
        stroke="#000"
        strokeWidth="0.4"
        opacity="0.32"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 19.4 12.8 Q 19.5 14.5 19.5 16"
        stroke="#000"
        strokeWidth="0.4"
        opacity="0.32"
        fill="none"
        strokeLinecap="round"
      />
      {/* 腹筋ライン */}
      <path
        d="M 9 17 L 9.5 19.5 M 12 17 L 12 19.8 M 15 17 L 14.5 19.5"
        stroke="#000"
        strokeWidth="0.35"
        opacity="0.28"
        fill="none"
        strokeLinecap="round"
      />

      {/* ═══ 胸の白い V マーク (月の輪) ═══ */}
      <path
        d="M 7 12.5 L 12 16.7 L 17 12.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.97"
      />
    </svg>
  );
}
