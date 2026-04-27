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

  const [draft, setDraft] = useState<ExerciseLog[]>(initialLogs);
  const [memo, setMemo] = useState('');

  // routine / cycle 切替時に draft を更新
  const sig = useMemo(
    () => `${routine?.id}|${state.user.currentCycle}`,
    [routine?.id, state.user.currentCycle],
  );
  useEffect(() => {
    setDraft(initialLogs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

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

