interface Props {
  size?: number;
  className?: string;
}

/**
 * macho up ブランドアイコン:
 * リアル寄りの ムキムキ ツキノワグマ (胸に白い V マーク = 月の輪)。
 *
 * 二本足で立ち、両腕を体側に下ろした「リラックスポーズ」だが、
 * 三角筋・力こぶ・前腕・拳が積み重なって筋肉の連続性が見えるように配置。
 *
 * 解剖学的にバランスを取った構成:
 *  - 頭 → 僧帽筋 → 三角筋 (デルト) → 力こぶ → 前腕 → 拳
 *  - 大胸筋 → 腹筋 (V テーパー) → 太い大腿
 *  - シルエットは肩が一番広く、ウエストへ絞り、また脚で広がる X フレーム
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

        {/* 鼻先 (snout) */}
        <ellipse cx="12" cy="7.3" rx="2.1" ry="1.6" />

        {/* 僧帽筋 (首から肩へ) */}
        <path d="M 9 8.6 Q 12 8 15 8.6 L 14.5 10.5 L 9.5 10.5 Z" />

        {/* 三角筋 (デルト): 肩の丸い筋肉 */}
        <circle cx="4.5" cy="10.5" r="2.3" />
        <circle cx="19.5" cy="10.5" r="2.3" />

        {/* 肩のライン (デルトの間を埋める) */}
        <ellipse cx="12" cy="10.2" rx="5.5" ry="1.6" />

        {/* 力こぶ (上腕二頭筋, デルトの真下に連なる) */}
        <ellipse cx="4" cy="13.5" rx="2.2" ry="2.4" />
        <ellipse cx="20" cy="13.5" rx="2.2" ry="2.4" />

        {/* 前腕 (力こぶより僅かに細く) */}
        <ellipse cx="4" cy="17.5" rx="1.8" ry="2.2" />
        <ellipse cx="20" cy="17.5" rx="1.8" ry="2.2" />

        {/* 拳 / 前足 */}
        <circle cx="4" cy="20.5" r="1.5" />
        <circle cx="20" cy="20.5" r="1.5" />

        {/* 大胸筋 */}
        <ellipse cx="12" cy="13.5" rx="6.4" ry="3.3" />

        {/* V テーパー腰 / 腹直筋 */}
        <path d="M 6.5 14 L 8 20 L 16 20 L 17.5 14 Z" />

        {/* 太い脚 (大腿) */}
        <ellipse cx="9.4" cy="21.8" rx="2.8" ry="2.5" />
        <ellipse cx="14.6" cy="21.8" rx="2.8" ry="2.5" />
      </g>

      {/* ═══ 内耳の影 ═══ */}
      <ellipse cx="9.4" cy="3.3" rx="0.55" ry="0.55" fill="#000" opacity="0.32" />
      <ellipse cx="14.6" cy="3.3" rx="0.55" ry="0.55" fill="#000" opacity="0.32" />

      {/* ═══ 目 ═══ */}
      <circle cx="10.7" cy="5.2" r="0.44" fill="#000" opacity="0.94" />
      <circle cx="13.3" cy="5.2" r="0.44" fill="#000" opacity="0.94" />
      <circle cx="10.84" cy="5.05" r="0.16" fill="#fff" opacity="0.9" />
      <circle cx="13.44" cy="5.05" r="0.16" fill="#fff" opacity="0.9" />

      {/* ═══ snout の濃淡 ═══ */}
      <ellipse cx="12" cy="7.5" rx="1.9" ry="1.25" fill="#000" opacity="0.2" />

      {/* ═══ 鼻 ═══ */}
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
      {/* 大胸筋の中央 (左右の胸を分ける) */}
      <path
        d="M 12 11 L 12 16.5"
        stroke="#000"
        strokeWidth="0.55"
        opacity="0.25"
        fill="none"
        strokeLinecap="round"
      />
      {/* デルトと力こぶの境界 */}
      <path
        d="M 4 12.5 Q 4 13 4 13"
        stroke="#000"
        strokeWidth="0"
        opacity="0"
        fill="none"
      />
      {/* 力こぶピークのハイライト */}
      <ellipse cx="3.5" cy="13" rx="0.6" ry="0.4" fill="#fff" opacity="0.18" />
      <ellipse cx="20.5" cy="13" rx="0.6" ry="0.4" fill="#fff" opacity="0.18" />
      {/* 力こぶと前腕の境界 (肘) */}
      <path
        d="M 2.3 15.5 Q 4 16 5.7 15.5"
        stroke="#000"
        strokeWidth="0.35"
        opacity="0.3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 18.3 15.5 Q 20 16 21.7 15.5"
        stroke="#000"
        strokeWidth="0.35"
        opacity="0.3"
        fill="none"
        strokeLinecap="round"
      />
      {/* 腹筋ライン (シックスパック) */}
      <path
        d="M 9 16.5 L 9.5 19.5 M 12 16.8 L 12 19.8 M 15 16.5 L 14.5 19.5"
        stroke="#000"
        strokeWidth="0.35"
        opacity="0.3"
        fill="none"
        strokeLinecap="round"
      />
      {/* 横のオブリーク (脇腹) */}
      <path
        d="M 7 16 Q 7.5 17 8 19"
        stroke="#000"
        strokeWidth="0.3"
        opacity="0.25"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 17 16 Q 16.5 17 16 19"
        stroke="#000"
        strokeWidth="0.3"
        opacity="0.25"
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
