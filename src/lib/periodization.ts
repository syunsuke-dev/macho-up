import type { Exercise, VariationConfig } from '../types';

/** 4サイクル・ループの重量係数 */
export const CYCLE_FACTORS: Record<1 | 2 | 3 | 4, number> = {
  1: 0.75,
  2: 0.80,
  3: 0.85,
  4: 0.50, // Deload
};

export const CYCLE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Cycle 1 · 75%',
  2: 'Cycle 2 · 80%',
  3: 'Cycle 3 · 85%',
  4: 'Cycle 4 · Deload 50%',
};

/** 次のサイクルを返す (4 → 1 にループ) */
export function nextCycle(cycle: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 {
  return ((cycle % 4) + 1) as 1 | 2 | 3 | 4;
}

/** 0.5 kg 単位に丸める (バーベルの現実に合わせる) */
export function roundToPlate(weight: number, step = 0.5): number {
  return Math.round(weight / step) * step;
}

export interface PeriodizationOptions {
  /**
   * ルーティン内のいずれかの種目でピリオダイゼーションが有効な場合、
   * 4サイクル目 (deload) はこの種目の periodizationEnabled を無視して
   * 強制的に 50% を適用する。
   */
  forceDeload?: boolean;
}

/**
 * ピリオダイゼーション適用後の「第1セット重量」を算出。
 * - periodizationEnabled=false の場合は通常 100%
 * - ただし forceDeload=true かつ cycle=4 の場合は deload係数 (50%) を強制適用
 */
export function getWorkingWeight(
  exercise: Exercise,
  cycle: 1 | 2 | 3 | 4,
  opts?: PeriodizationOptions,
): number {
  if (opts?.forceDeload && cycle === 4) {
    return roundToPlate(exercise.baseWeight * CYCLE_FACTORS[4]);
  }
  const factor = exercise.periodizationEnabled ? CYCLE_FACTORS[cycle] : 1.0;
  return roundToPlate(exercise.baseWeight * factor);
}

/**
 * 変動セットを適用して、全セット分の重量配列を返す。
 * - straight: 全セット同じ重量
 * - ascending: 前セット * (1 + percent/100)
 * - drop: 前セット * (1 - percent/100)
 * - manualWeights が指定されている場合はそれを優先 (長さが足りない部分は計算で補う)
 */
export function buildSetWeights(
  exercise: Exercise,
  cycle: 1 | 2 | 3 | 4,
  opts?: PeriodizationOptions,
): number[] {
  const first = getWorkingWeight(exercise, cycle, opts);
  const { sets, variation } = exercise;
  const weights: number[] = [first];

  for (let i = 1; i < sets; i++) {
    const manual = variation.manualWeights?.[i];
    if (typeof manual === 'number' && !Number.isNaN(manual)) {
      weights.push(roundToPlate(manual));
      continue;
    }
    const prev = weights[i - 1];
    const pct = variation.percent ?? 0;
    switch (variation.mode) {
      case 'ascending':
        weights.push(roundToPlate(prev * (1 + pct / 100)));
        break;
      case 'drop':
        weights.push(roundToPlate(prev * (1 - pct / 100)));
        break;
      case 'straight':
      default:
        weights.push(prev);
    }
  }
  return weights;
}

/** 変動セット設定のデフォルト */
export function defaultVariation(): VariationConfig {
  return { mode: 'straight', percent: 0 };
}

/**
 * ルーティン内のいずれかの種目でピリオダイゼーションが有効かを判定。
 * この場合、4サイクル目はルーティン内全種目を 50% に強制する。
 */
export function routineHasAnyPeriodization(exercises: Exercise[]): boolean {
  return exercises.some((e) => e.periodizationEnabled);
}
