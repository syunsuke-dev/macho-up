import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  buildSetWeights,
  CYCLE_LABELS,
  routineHasAnyPeriodization,
} from '../lib/periodization';
import { todayISO, getEntryByDate } from '../lib/schedule';
import { uid } from '../lib/storage';
import type { ExerciseLog, Log, SetLog } from '../types';

// ===== Draft 保存 (画面遷移・再起動を超えて当日中だけ維持) =====

const DRAFT_KEY_PREFIX = 'machoup:logdraft:';

interface LogDraft {
  /** 紐付くルーティンID — ルーティン変更時には破棄するため */
  routineId: string;
  /** ユーザー入力中の各種目の状態 */
  exercises: ExerciseLog[];
  memo: string;
}

function loadDraft(date: string): LogDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY_PREFIX + date);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.routineId !== 'string') return null;
    if (!Array.isArray(parsed.exercises)) return null;
    return parsed as LogDraft;
  } catch {
    return null;
  }
}

function saveDraft(date: string, draft: LogDraft) {
  try {
    localStorage.setItem(DRAFT_KEY_PREFIX + date, JSON.stringify(draft));
  } catch {
    /* noop */
  }
}

function clearDraft(date: string) {
  try {
    localStorage.removeItem(DRAFT_KEY_PREFIX + date);
  } catch {
    /* noop */
  }
}

/** 今日以外の日付の Draft を全削除 (翌日以降に持ち越さない) */
function purgeOldDrafts(today: string) {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith(DRAFT_KEY_PREFIX) &&
        key !== DRAFT_KEY_PREFIX + today
      ) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* noop */
  }
}

export function LogPage() {
  const { state, dispatch, exerciseMap, routineMap } = useApp();
  const today = todayISO();
  const entry = getEntryByDate(state.schedule, today);
  const routineId = entry?.routineId ?? state.routines[0]?.id ?? null;
  const routine = routineId ? routineMap[routineId] : null;

  const initialLogs: ExerciseLog[] = useMemo(() => {
    if (!routine) return [];
    const routineExercises = routine.exerciseIds
      .map((id) => exerciseMap[id])
      .filter((e): e is NonNullable<typeof e> => !!e);
    const forceDeload = routineHasAnyPeriodization(routineExercises);
    return routine.exerciseIds.map((eid) => {
      const ex = exerciseMap[eid];
      const planned = ex
        ? buildSetWeights(ex, state.user.currentCycle, { forceDeload })
        : [];
      const setLogs: SetLog[] = planned.map((w) => ({
        weight: w,
        reps: ex?.reps ?? 0,
        completed: false,
      }));
      return { exerciseId: eid, plannedWeights: planned, setLogs };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine?.id, state.user.currentCycle]);

  // Draft (今日のログ作業中の状態) を localStorage から復元
  // ルーティンが一致する場合のみ復元する
  const initialFromDraft = useMemo<{
    exercises: ExerciseLog[];
    memo: string;
  } | null>(() => {
    if (!routine) return null;
    const saved = loadDraft(today);
    if (!saved || saved.routineId !== routine.id) return null;
    return { exercises: saved.exercises, memo: saved.memo };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, routine?.id]);

  const [draft, setDraft] = useState<ExerciseLog[]>(
    initialFromDraft?.exercises ?? initialLogs,
  );
  const [memo, setMemo] = useState<string>(initialFromDraft?.memo ?? '');

  // 起動時: 過去日付の Draft を一掃 (翌日以降にチェック状態を持ち越さない)
  useEffect(() => {
    purgeOldDrafts(today);
  }, [today]);

  // routine / cycle 切替時: 該当ルーティンに draft があれば復元、無ければ initialLogs
  const sig = useMemo(
    () => `${routine?.id}|${state.user.currentCycle}`,
    [routine?.id, state.user.currentCycle],
  );
  useEffect(() => {
    if (!routine) return;
    const saved = loadDraft(today);
    if (saved && saved.routineId === routine.id) {
      setDraft(saved.exercises);
      setMemo(saved.memo);
    } else {
      setDraft(initialLogs);
      setMemo('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  // draft / memo の変更を localStorage に逐次保存
  useEffect(() => {
    if (!routine) return;
    saveDraft(today, {
      routineId: routine.id,
      exercises: draft,
      memo,
    });
  }, [draft, memo, routine, today]);

  if (!routine) {
    return (
      <div className="text-center text-neutral-400 py-10">
        <div className="text-3xl mb-2">💤</div>
        本日はオフ日 / メニュー未登録です
      </div>
    );
  }

  const updateSet = (exIdx: number, setIdx: number, patch: Partial<SetLog>) => {
    setDraft((prev) =>
      prev.map((e, i) =>
        i !== exIdx
          ? e
          : {
              ...e,
              setLogs: e.setLogs.map((s, j) =>
                j !== setIdx ? s : { ...s, ...patch },
              ),
            },
      ),
    );
  };

  const handleSave = () => {
    const log: Log = {
      id: uid(),
      date: today,
      routineId: routine.id,
      cycle: state.user.currentCycle,
      exercises: draft,
      memo: memo || undefined,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_LOG', log });
    dispatch({ type: 'MARK_DONE', date: today });
    // 保存完了後、今日の Draft はクリア
    clearDraft(today);
    alert('記録を保存しました');
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-neutral-500 uppercase">today</div>
          <div className="text-sm font-bold">{today}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-neutral-500 uppercase">routine</div>
          <div className="text-sm font-bold">{routine.name}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-neutral-500 uppercase">cycle</div>
          <div className="text-xs font-bold text-amber-300">
            {CYCLE_LABELS[state.user.currentCycle].split('·')[0].trim()}
          </div>
        </div>
      </section>

      {draft.map((ex, exIdx) => {
        const meta = exerciseMap[ex.exerciseId];
        if (!meta) return null;
        return (
          <section
            key={ex.exerciseId}
            className="rounded-xl bg-neutral-900 border border-neutral-800 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">{meta.name}</div>
              <div className="text-[10px] text-neutral-500">
                予定: {ex.plannedWeights.join(' / ')}kg
              </div>
            </div>

            <ul className="space-y-1.5">
              {ex.setLogs.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-6 text-[10px] text-neutral-500 text-center">
                    {i + 1}
                  </span>

                  <NumStepper
                    value={s.weight}
                    step={2.5}
                    suffix="kg"
                    onChange={(v) => updateSet(exIdx, i, { weight: v })}
                  />
                  <span className="text-neutral-600">×</span>
                  <NumStepper
                    value={s.reps}
                    step={1}
                    suffix="rep"
                    onChange={(v) => updateSet(exIdx, i, { reps: v })}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateSet(exIdx, i, { completed: !s.completed })
                    }
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      s.completed
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                    aria-label="done"
                  >
                    <Check size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section>
        <label className="text-[10px] text-neutral-500 uppercase">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="調子・体感など"
          rows={2}
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm"
        />
      </section>

      <button
        type="button"
        onClick={handleSave}
        className="w-full h-14 rounded-xl bg-amber-500 text-neutral-950 font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Save size={18} /> 今日のログを保存
      </button>
    </div>
  );
}

// ===== Num Stepper =====

function NumStepper({
  value,
  step,
  suffix,
  onChange,
}: {
  value: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1 flex items-center bg-neutral-950 border border-neutral-700 rounded-lg h-10 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - step))}
        className="w-9 h-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-full bg-transparent text-center font-mono text-sm min-w-0"
      />
      <span className="text-[10px] text-neutral-500 pr-1.5">{suffix}</span>
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="w-9 h-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

