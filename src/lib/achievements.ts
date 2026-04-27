import type { Log } from '../types';

export interface Comparison {
  name: string;
  emoji: string;
  /** 1個分のkg重量 */
  kg: number;
  /** 表示用の単位文字列 (例: "225t/個") */
  unit: string;
  /** Tailwind色クラス */
  color: string;
}

/**
 * 重量換算対象 (重い順)。
 * 総重量がこの kg 値以上に達したら「達成バッジ」が点灯する。
 */
export const COMPARISONS: Comparison[] = [
  {
    name: '自由の女神',
    emoji: '🗽',
    kg: 225_000,
    unit: '225t/個',
    color: 'text-amber-300/90',
  },
  {
    name: 'モアイ象',
    emoji: '🗿',
    kg: 50_000,
    unit: '50t/個',
    color: 'text-emerald-300/90',
  },
  {
    name: 'スクールバス',
    emoji: '🚌',
    kg: 10_000,
    unit: '10t/個',
    color: 'text-yellow-300/90',
  },
  {
    name: 'グランドピアノ',
    emoji: '🎹',
    kg: 500,
    unit: '500kg/個',
    color: 'text-violet-300/90',
  },
  {
    name: 'ダイオウイカ',
    emoji: '🦑',
    kg: 200,
    unit: '200kg/個',
    color: 'text-sky-300/90',
  },
  {
    name: 'パンダ',
    emoji: '🐼',
    kg: 100,
    unit: '100kg/個',
    color: 'text-fuchsia-300/90',
  },
];

/**
 * ログ全体から完了済みセットの総ボリューム (kg×reps の合計) を算出。
 */
export function calculateTotalVolume(logs: Log[]): number {
  return logs.reduce(
    (sum, l) =>
      sum +
      l.exercises.reduce(
        (s, e) =>
          s +
          e.setLogs
            .filter((st) => st.completed)
            .reduce((ss, st) => ss + st.weight * st.reps, 0),
        0,
      ),
    0,
  );
}

/**
 * 与えられた総重量に対して「1個以上達成した」換算項目のリストを返す。
 * 重い順 (= COMPARISONS の順) で返却。
 */
export function getAchievedComparisons(totalVolumeKg: number): Comparison[] {
  return COMPARISONS.filter((c) => totalVolumeKg >= c.kg);
}
