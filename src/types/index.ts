// ===== macho up: Core Type Definitions =====

/** UI テーマ */
export type Theme = 'dark' | 'light';

/** ユーザー設定 */
export interface User {
  id: string;
  name: string;
  /** 現在のピリオダイゼーション・サイクル (1..4) — 4サイクルで1ループ */
  currentCycle: 1 | 2 | 3 | 4;
  /** 最後にサイクルを進めた日 (ISO) */
  lastCycleAdvancedAt: string | null;
  /** UI テーマ */
  theme: Theme;
  createdAt: string;
}

/** セットの種類 */
export type SetMode = 'straight' | 'ascending' | 'drop';

/** 変動セットの増減指定 */
export interface VariationConfig {
  mode: SetMode;
  /** percent: 前セットから何%増減するか (straightなら未使用) */
  percent?: number;
  /** 手動でセット毎の重量をオーバーライドしたい場合に使用 (長さ = sets) */
  manualWeights?: number[];
}

/** 1つの種目 */
export interface Exercise {
  id: string;
  name: string;
  /** 基準重量 (1RM または基準セット重量) kg */
  baseWeight: number;
  /** セット数 */
  sets: number;
  /** 目標レップ数 */
  reps: number;
  /** この種目にピリオダイゼーションを適用するか */
  periodizationEnabled: boolean;
  /** 変動セット設定 */
  variation: VariationConfig;
  createdAt: string;
}

/** トレーニングメニュー (= ルーティン, 1日分のワークアウト) */
export interface Routine {
  id: string;
  name: string;
  /** 並び順 (0..5, 最大6) */
  order: number;
  /** 含まれる種目ID */
  exerciseIds: string[];
  /** スケジュールに反映するか (true=反映, false=外す) */
  enabled: boolean;
  createdAt: string;
}

/** スケジュールの1日分のエントリ */
export interface ScheduleEntry {
  /** 日付 ISO (yyyy-mm-dd) */
  date: string;
  /** その日のルーティンID。null ならオフ日 */
  routineId: string | null;
  /** 完了済みフラグ */
  done: boolean;
}

/** スケジュール全体 */
export interface Schedule {
  id: string;
  /** ルーティンをどの順で回すか (RoutineのIDリスト) */
  rotation: string[];
  /** 各メニューの後に挟むオフ日数 (rotation と同じ長さ) */
  offDays: number[];
  /** 生成開始日 */
  startDate: string;
  /** 生成済みのエントリ (日付昇順) */
  entries: ScheduleEntry[];
}

/** 1セットのログ */
export interface SetLog {
  weight: number;
  reps: number;
  completed: boolean;
}

/** 1種目のログ */
export interface ExerciseLog {
  exerciseId: string;
  /** その日このセッションで計画された重量 (cycle適用済み) */
  plannedWeights: number[];
  /** 実績セット */
  setLogs: SetLog[];
}

/** 1日分のトレーニングログ */
export interface Log {
  id: string;
  date: string;
  routineId: string | null;
  /** 実施したサイクル番号 */
  cycle: 1 | 2 | 3 | 4;
  exercises: ExerciseLog[];
  memo?: string;
  createdAt: string;
}

/** LocalStorage 全体の永続化データ */
export interface PersistedState {
  version: 1;
  user: User;
  exercises: Exercise[];
  routines: Routine[];
  schedule: Schedule | null;
  logs: Log[];
}
