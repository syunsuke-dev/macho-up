import { supabase } from './supabase';
import type {
  Exercise,
  Log,
  PersistedState,
  Routine,
  Schedule,
  ScheduleEntry,
  Theme,
  User,
  VariationConfig,
} from '../types';

// ============================================================
// row → app types のマッパー
// ============================================================

interface UserSettingsRow {
  user_id: string;
  name: string;
  current_cycle: number;
  last_cycle_advanced_at: string | null;
  theme: Theme;
  created_at: string;
}
interface ExerciseRow {
  id: string;
  user_id: string;
  name: string;
  base_weight: number;
  sets: number;
  reps: number;
  periodization_enabled: boolean;
  variation: VariationConfig;
  created_at: string;
}
interface RoutineRow {
  id: string;
  user_id: string;
  name: string;
  order: number;
  exercise_ids: string[];
  enabled: boolean;
  created_at: string;
}
interface ScheduleRow {
  user_id: string;
  rotation: string[];
  off_days: number[];
  start_date: string;
  entries: ScheduleEntry[];
}
interface LogRow {
  id: string;
  user_id: string;
  date: string;
  routine_id: string | null;
  cycle: number;
  exercises: Log['exercises'];
  memo: string | null;
  created_at: string;
}

function rowToUser(row: UserSettingsRow): User {
  return {
    id: row.user_id,
    name: row.name,
    currentCycle: row.current_cycle as 1 | 2 | 3 | 4,
    lastCycleAdvancedAt: row.last_cycle_advanced_at,
    theme: row.theme,
    createdAt: row.created_at,
  };
}
function rowToExercise(r: ExerciseRow): Exercise {
  return {
    id: r.id,
    name: r.name,
    baseWeight: Number(r.base_weight),
    sets: r.sets,
    reps: r.reps,
    periodizationEnabled: r.periodization_enabled,
    variation: r.variation,
    createdAt: r.created_at,
  };
}
function rowToRoutine(r: RoutineRow): Routine {
  return {
    id: r.id,
    name: r.name,
    order: r.order,
    exerciseIds: r.exercise_ids ?? [],
    enabled: r.enabled,
    createdAt: r.created_at,
  };
}
function rowToSchedule(r: ScheduleRow): Schedule {
  return {
    id: r.user_id, // schedules は 1ユーザー1行なので user_id をスケジュールIDとして使う
    rotation: r.rotation ?? [],
    offDays: r.off_days ?? [],
    startDate: r.start_date,
    entries: r.entries ?? [],
  };
}
function rowToLog(r: LogRow): Log {
  return {
    id: r.id,
    date: r.date,
    routineId: r.routine_id,
    cycle: r.cycle as 1 | 2 | 3 | 4,
    exercises: r.exercises ?? [],
    memo: r.memo ?? undefined,
    createdAt: r.created_at,
  };
}

// ============================================================
// Read: 全データ取得 (ログイン時)
// ============================================================

export async function loadAll(userId: string): Promise<PersistedState> {
  const [settingsRes, exercisesRes, routinesRes, scheduleRes, logsRes] =
    await Promise.all([
      supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('exercises').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('routines').select('*').eq('user_id', userId).order('order'),
      supabase.from('schedules').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
    ]);

  if (settingsRes.error) throw settingsRes.error;
  if (exercisesRes.error) throw exercisesRes.error;
  if (routinesRes.error) throw routinesRes.error;
  if (scheduleRes.error) throw scheduleRes.error;
  if (logsRes.error) throw logsRes.error;

  // user_settings がまだ無い場合 (トリガーが何らかの理由で動かなかった等) は作成
  let userRow = settingsRes.data as UserSettingsRow | null;
  if (!userRow) {
    const { data: created, error } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) throw error;
    userRow = created as UserSettingsRow;
  }

  // schedules も同様
  let schedRow = scheduleRes.data as ScheduleRow | null;
  if (!schedRow) {
    const { data: created, error } = await supabase
      .from('schedules')
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) throw error;
    schedRow = created as ScheduleRow;
  }

  return {
    version: 1,
    user: rowToUser(userRow),
    exercises: ((exercisesRes.data as ExerciseRow[]) ?? []).map(rowToExercise),
    routines: ((routinesRes.data as RoutineRow[]) ?? []).map(rowToRoutine),
    schedule: rowToSchedule(schedRow),
    logs: ((logsRes.data as LogRow[]) ?? []).map(rowToLog),
  };
}

// ============================================================
// Write: 個別 mutator
// ============================================================

export async function saveUser(userId: string, user: User) {
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userId,
    name: user.name,
    current_cycle: user.currentCycle,
    last_cycle_advanced_at: user.lastCycleAdvancedAt,
    theme: user.theme,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function upsertExercise(userId: string, ex: Exercise) {
  const { error } = await supabase.from('exercises').upsert({
    id: ex.id,
    user_id: userId,
    name: ex.name,
    base_weight: ex.baseWeight,
    sets: ex.sets,
    reps: ex.reps,
    periodization_enabled: ex.periodizationEnabled,
    variation: ex.variation,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteExercise(id: string) {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertRoutine(userId: string, r: Routine) {
  const { error } = await supabase.from('routines').upsert({
    id: r.id,
    user_id: userId,
    name: r.name,
    order: r.order,
    exercise_ids: r.exerciseIds,
    enabled: r.enabled,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteRoutine(id: string) {
  const { error } = await supabase.from('routines').delete().eq('id', id);
  if (error) throw error;
}

export async function saveSchedule(userId: string, s: Schedule) {
  const { error } = await supabase.from('schedules').upsert({
    user_id: userId,
    rotation: s.rotation,
    off_days: s.offDays,
    start_date: s.startDate,
    entries: s.entries,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function insertLog(userId: string, log: Log) {
  const { error } = await supabase.from('logs').insert({
    id: log.id,
    user_id: userId,
    date: log.date,
    routine_id: log.routineId,
    cycle: log.cycle,
    exercises: log.exercises,
    memo: log.memo ?? null,
  });
  if (error) throw error;
}

/** 全データ削除 (RESET) */
export async function resetAllData(userId: string) {
  await Promise.all([
    supabase.from('logs').delete().eq('user_id', userId),
    supabase.from('exercises').delete().eq('user_id', userId),
    supabase.from('routines').delete().eq('user_id', userId),
    supabase
      .from('schedules')
      .update({
        rotation: [],
        off_days: [],
        start_date: new Date().toISOString().slice(0, 10),
        entries: [],
      })
      .eq('user_id', userId),
    supabase
      .from('user_settings')
      .update({ current_cycle: 1, last_cycle_advanced_at: null, theme: 'dark' })
      .eq('user_id', userId),
  ]);
}
