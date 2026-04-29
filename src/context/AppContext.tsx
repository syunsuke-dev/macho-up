import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import type {
  Exercise,
  Log,
  PersistedState,
  Routine,
  Schedule,
  Theme,
} from '../types';
import {
  generateSchedule,
  rescheduleFrom,
  rescheduleSingleDay,
  todayISO,
} from '../lib/schedule';
import { nextCycle } from '../lib/periodization';
import {
  deleteExercise as repoDeleteExercise,
  deleteRoutine as repoDeleteRoutine,
  insertLog as repoInsertLog,
  loadAll,
  resetAllData,
  saveSchedule,
  saveUser,
  upsertExercise as repoUpsertExercise,
  upsertRoutine as repoUpsertRoutine,
} from '../lib/repo';
import { useAuth } from './AuthContext';

// ===== Actions =====

type Action =
  | { type: 'REPLACE'; state: PersistedState }
  | { type: 'RESET' }
  | { type: 'ADVANCE_CYCLE' }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_NAME'; name: string }
  | { type: 'UPSERT_EXERCISE'; exercise: Exercise }
  | { type: 'DELETE_EXERCISE'; id: string }
  | { type: 'UPSERT_ROUTINE'; routine: Routine }
  | { type: 'DELETE_ROUTINE'; id: string }
  | {
      type: 'REGEN_SCHEDULE';
      rotation: string[];
      offDays: number[];
      startDate: string;
    }
  | { type: 'RESCHEDULE'; fromDate: string }
  | { type: 'RESCHEDULE_SINGLE_DAY'; fromDate: string }
  | { type: 'SET_DAY_ROUTINE'; date: string; routineId: string | null }
  | { type: 'RESTORE_SCHEDULE'; schedule: Schedule }
  | { type: 'ADD_LOG'; log: Log }
  | { type: 'MARK_DONE'; date: string };

function emptyState(userId: string): PersistedState {
  const now = new Date().toISOString();
  return {
    version: 1,
    user: {
      id: userId,
      name: 'You',
      currentCycle: 1,
      lastCycleAdvancedAt: null,
      theme: 'dark',
      createdAt: now,
    },
    exercises: [],
    routines: [],
    schedule: {
      id: userId,
      rotation: [],
      offDays: [],
      startDate: todayISO(),
      entries: [],
    },
    logs: [],
  };
}

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'REPLACE':
      return action.state;
    case 'RESET':
      return emptyState(state.user.id);
    case 'ADVANCE_CYCLE':
      return {
        ...state,
        user: {
          ...state.user,
          currentCycle: nextCycle(state.user.currentCycle),
          lastCycleAdvancedAt: new Date().toISOString(),
        },
      };
    case 'SET_THEME':
      return { ...state, user: { ...state.user, theme: action.theme } };
    case 'SET_NAME':
      return { ...state, user: { ...state.user, name: action.name } };
    case 'UPSERT_EXERCISE': {
      const i = state.exercises.findIndex((e) => e.id === action.exercise.id);
      const list =
        i >= 0
          ? state.exercises.map((e) =>
              e.id === action.exercise.id ? action.exercise : e,
            )
          : [...state.exercises, action.exercise];
      return { ...state, exercises: list };
    }
    case 'DELETE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter((e) => e.id !== action.id),
        routines: state.routines.map((r) => ({
          ...r,
          exerciseIds: r.exerciseIds.filter((id) => id !== action.id),
        })),
      };
    case 'UPSERT_ROUTINE': {
      const i = state.routines.findIndex((r) => r.id === action.routine.id);
      const list =
        i >= 0
          ? state.routines.map((r) =>
              r.id === action.routine.id ? action.routine : r,
            )
          : [...state.routines, action.routine];
      return { ...state, routines: list };
    }
    case 'DELETE_ROUTINE': {
      const filtered = state.routines.filter((r) => r.id !== action.id);
      const newRotation =
        state.schedule?.rotation.filter((id) => id !== action.id) ?? [];
      const newOffDays =
        state.schedule?.offDays.slice(0, newRotation.length) ?? [];
      return {
        ...state,
        routines: filtered,
        schedule: state.schedule
          ? {
              ...state.schedule,
              rotation: newRotation,
              offDays: newOffDays,
            }
          : null,
      };
    }
    case 'REGEN_SCHEDULE': {
      const entries = generateSchedule(
        action.rotation,
        action.offDays,
        action.startDate,
        60,
      );
      const schedule: Schedule = {
        id: state.schedule?.id ?? state.user.id,
        rotation: action.rotation,
        offDays: action.offDays,
        startDate: action.startDate,
        entries,
      };
      return { ...state, schedule };
    }
    case 'RESCHEDULE':
      if (!state.schedule) return state;
      return {
        ...state,
        schedule: rescheduleFrom(state.schedule, action.fromDate),
      };
    case 'RESCHEDULE_SINGLE_DAY':
      if (!state.schedule) return state;
      return {
        ...state,
        schedule: rescheduleSingleDay(state.schedule, action.fromDate),
      };
    case 'SET_DAY_ROUTINE': {
      if (!state.schedule) return state;
      // 該当日のエントリの routineId を上書き (done フラグはリセット)
      const found = state.schedule.entries.some((e) => e.date === action.date);
      const entries = found
        ? state.schedule.entries.map((e) =>
            e.date === action.date
              ? { ...e, routineId: action.routineId, done: false }
              : e,
          )
        : [
            ...state.schedule.entries,
            { date: action.date, routineId: action.routineId, done: false },
          ].sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...state,
        schedule: { ...state.schedule, entries },
      };
    }
    case 'RESTORE_SCHEDULE':
      return { ...state, schedule: action.schedule };
    case 'ADD_LOG':
      return { ...state, logs: [action.log, ...state.logs] };
    case 'MARK_DONE':
      if (!state.schedule) return state;
      return {
        ...state,
        schedule: {
          ...state.schedule,
          entries: state.schedule.entries.map((e) =>
            e.date === action.date ? { ...e, done: true } : e,
          ),
        },
      };
    default:
      return state;
  }
}

/**
 * 各アクションに対応する Supabase 永続化処理。
 * fire-and-forget。失敗時はコンソールにログ。
 */
async function persistAction(
  userId: string,
  action: Action,
  prev: PersistedState,
  next: PersistedState,
): Promise<void> {
  switch (action.type) {
    case 'REPLACE':
      return; // ロードからの初期化なので保存不要
    case 'RESET':
      await resetAllData(userId);
      return;
    case 'ADVANCE_CYCLE':
    case 'SET_THEME':
    case 'SET_NAME':
      await saveUser(userId, next.user);
      return;
    case 'UPSERT_EXERCISE':
      await repoUpsertExercise(userId, action.exercise);
      return;
    case 'DELETE_EXERCISE': {
      await repoDeleteExercise(action.id);
      // 影響を受けたルーティン (exerciseIds が変わったもの) を保存
      const tasks: Promise<void>[] = [];
      for (const r of next.routines) {
        const old = prev.routines.find((o) => o.id === r.id);
        if (
          old &&
          JSON.stringify(old.exerciseIds) !== JSON.stringify(r.exerciseIds)
        ) {
          tasks.push(repoUpsertRoutine(userId, r));
        }
      }
      await Promise.all(tasks);
      return;
    }
    case 'UPSERT_ROUTINE':
      await repoUpsertRoutine(userId, action.routine);
      return;
    case 'DELETE_ROUTINE':
      await repoDeleteRoutine(action.id);
      if (next.schedule) await saveSchedule(userId, next.schedule);
      return;
    case 'REGEN_SCHEDULE':
    case 'RESCHEDULE':
    case 'RESCHEDULE_SINGLE_DAY':
    case 'MARK_DONE':
    case 'SET_DAY_ROUTINE':
    case 'RESTORE_SCHEDULE':
      if (next.schedule) await saveSchedule(userId, next.schedule);
      return;
    case 'ADD_LOG':
      await repoInsertLog(userId, action.log);
      return;
  }
}

// ===== Context =====

interface UndoToken {
  /** 復元用のスケジュールスナップショット */
  schedule: Schedule;
  /** 表示用ラベル */
  label: string;
  /** 一意なID (タイムアウト管理用) */
  id: number;
}

interface AppContextValue {
  state: PersistedState;
  dispatch: Dispatch<Action>;
  exerciseMap: Record<string, Exercise>;
  routineMap: Record<string, Routine>;
  /** 直近のリスケ Undo 情報 (null = なし) */
  undo: UndoToken | null;
  /** Undo を実行 (元のスケジュールに復元) */
  performUndo: () => void;
  /** Undo を破棄 */
  dismissUndo: () => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<PersistedState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [undo, setUndo] = useState<UndoToken | null>(null);

  // ユーザー切替時にデータロード
  useEffect(() => {
    if (!userId) {
      setState(null);
      return;
    }
    let cancelled = false;
    setState(null);
    setLoadError(null);
    loadAll(userId)
      .then((s) => {
        if (!cancelled) setState(s);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // テーマクラスを <html> に反映
  useEffect(() => {
    const theme = state?.user.theme ?? 'dark';
    const cls = theme === 'light' ? 'theme-light' : 'theme-dark';
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(cls);
  }, [state?.user.theme]);

  const dispatch = useCallback<Dispatch<Action>>(
    (action) => {
      if (!userId) return;
      setState((prev) => {
        if (!prev) return prev;
        // リスケ系アクションは直前のスケジュールを Undo として保持
        if (
          (action.type === 'RESCHEDULE' ||
            action.type === 'RESCHEDULE_SINGLE_DAY') &&
          prev.schedule
        ) {
          setUndo({
            id: Date.now(),
            schedule: prev.schedule,
            label:
              action.type === 'RESCHEDULE'
                ? '全体をずらしました'
                : 'その日のみずらしました',
          });
        }
        const next = reducer(prev, action);
        Promise.resolve()
          .then(() => persistAction(userId, action, prev, next))
          .catch((e) => {
            console.error('persistAction failed', action.type, e);
          });
        return next;
      });
    },
    [userId],
  );

  const performUndo = useCallback(() => {
    if (!undo) return;
    dispatch({ type: 'RESTORE_SCHEDULE', schedule: undo.schedule });
    setUndo(null);
  }, [undo, dispatch]);

  const dismissUndo = useCallback(() => setUndo(null), []);

  // Undo は一定時間で自動消滅
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 8000);
    return () => clearTimeout(t);
  }, [undo]);

  const exerciseMap = useMemo(
    () => Object.fromEntries((state?.exercises ?? []).map((e) => [e.id, e])),
    [state?.exercises],
  );
  const routineMap = useMemo(
    () => Object.fromEntries((state?.routines ?? []).map((r) => [r.id, r])),
    [state?.routines],
  );

  // Loading / Error states
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm font-semibold mb-1">データ読込エラー</div>
          <div className="text-xs text-neutral-400 mb-4">{loadError}</div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs bg-amber-500 text-neutral-950 px-3 py-1.5 rounded font-bold"
          >
            リロード
          </button>
        </div>
      </div>
    );
  }
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xs text-neutral-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <Ctx.Provider
      value={{
        state,
        dispatch,
        exerciseMap,
        routineMap,
        undo,
        performUndo,
        dismissUndo,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export type { Action as AppAction };
