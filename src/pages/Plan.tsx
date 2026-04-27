import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uid } from '../lib/storage';
import { defaultVariation } from '../lib/periodization';
import { todayISO } from '../lib/schedule';
import { NumberInput } from '../components/NumberInput';
import {
  BODY_PARTS,
  EXERCISE_TEMPLATES,
  type BodyPart,
  type ExerciseTemplate,
} from '../lib/exerciseTemplates';
import type { Exercise, Routine, SetMode } from '../types';

export function PlanPage() {
  const { state, dispatch } = useApp();
  const [openRoutineId, setOpenRoutineId] = useState<string | null>(null);

  const addRoutine = () => {
    if (state.routines.length >= 6) {
      alert('メニューは最大6つまでです');
      return;
    }
    const r: Routine = {
      id: uid(),
      name: `メニュー ${state.routines.length + 1}`,
      order: state.routines.length,
      exerciseIds: [],
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPSERT_ROUTINE', routine: r });
    setOpenRoutineId(r.id);
  };

  const regenerate = () => {
    const enabledRoutines = state.routines.filter((r) => r.enabled !== false);
    if (enabledRoutines.length === 0) {
      alert('チェックされたメニューがありません');
      return;
    }
    const rotation = [...enabledRoutines]
      .sort((a, b) => a.order - b.order)
      .map((r) => r.id);
    const offDays =
      state.schedule && state.schedule.offDays.length === rotation.length
        ? state.schedule.offDays
        : rotation.map(() => 1);
    dispatch({
      type: 'REGEN_SCHEDULE',
      rotation,
      offDays,
      startDate: todayISO(),
    });
    alert('スケジュールを再生成しました');
  };

  return (
    <div className="space-y-4">
      {/* スケジュール設定 */}
      <ScheduleSettings />

      {/* メニュー一覧 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            トレーニングメニュー ({state.routines.length}/6)
          </h2>
          <button
            type="button"
            onClick={regenerate}
            className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-md"
          >
            <RefreshCw size={12} /> 予定再生成
          </button>
        </div>

        <ul className="space-y-2">
          {[...state.routines]
            .sort((a, b) => a.order - b.order)
            .map((r) => (
              <RoutineCard
                key={r.id}
                routine={r}
                open={openRoutineId === r.id}
                onToggle={() =>
                  setOpenRoutineId(openRoutineId === r.id ? null : r.id)
                }
              />
            ))}
        </ul>

        {state.routines.length < 6 && (
          <button
            type="button"
            onClick={addRoutine}
            className="mt-3 w-full h-12 rounded-xl border-2 border-dashed border-neutral-700 text-neutral-400 flex items-center justify-center gap-2 hover:border-amber-500 hover:text-amber-300 transition"
          >
            <Plus size={18} /> メニューを追加
          </button>
        )}
      </section>
    </div>
  );
}

// ===== Schedule settings =====

function ScheduleSettings() {
  const { state, dispatch } = useApp();
  const schedule = state.schedule;
  if (!schedule || schedule.rotation.length === 0) {
    return (
      <div className="text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
        メニュー登録後に「予定再生成」を実行してください
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3">
      <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
        ローテーション & オフ日数
      </div>
      <ul className="space-y-1.5">
        {schedule.rotation.map((rid, i) => {
          const r = state.routines.find((x) => x.id === rid);
          return (
            <li
              key={rid + i}
              className="flex items-center justify-between gap-2 bg-neutral-800/50 rounded-lg px-2 py-1.5"
            >
              <div className="text-xs">
                <span className="text-neutral-500 mr-1">{i + 1}.</span>
                <span className="font-semibold">{r?.name ?? '(削除済み)'}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-neutral-500">後オフ</span>
                <NumberInput
                  value={schedule.offDays[i] ?? 0}
                  min={0}
                  max={7}
                  integer
                  inputMode="numeric"
                  onCommit={(v) => {
                    const next = [...schedule.offDays];
                    next[i] = v;
                    dispatch({
                      type: 'REGEN_SCHEDULE',
                      rotation: schedule.rotation,
                      offDays: next,
                      startDate: schedule.startDate,
                    });
                  }}
                  className="w-12 h-8 text-center bg-neutral-900 border border-neutral-700 rounded font-mono"
                />
                <span className="text-neutral-500">日</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ===== Routine card =====

function RoutineCard({
  routine,
  open,
  onToggle,
}: {
  routine: Routine;
  open: boolean;
  onToggle: () => void;
}) {
  const { state, dispatch } = useApp();
  const isEnabled = routine.enabled !== false;

  const updateName = (name: string) =>
    dispatch({ type: 'UPSERT_ROUTINE', routine: { ...routine, name } });

  /**
   * 反映チェックを切替。スケジュールも自動で再生成する。
   * (オフ日数は既存値があれば保持)
   */
  const toggleEnabled = () => {
    const updated = { ...routine, enabled: !isEnabled };
    dispatch({ type: 'UPSERT_ROUTINE', routine: updated });

    const allRoutines = state.routines.map((r) =>
      r.id === updated.id ? updated : r,
    );
    const newRotation = [...allRoutines]
      .filter((r) => r.enabled !== false)
      .sort((a, b) => a.order - b.order)
      .map((r) => r.id);

    const oldOffMap = new Map<string, number>();
    state.schedule?.rotation.forEach((rid, i) => {
      oldOffMap.set(rid, state.schedule!.offDays[i] ?? 1);
    });
    const newOffDays = newRotation.map((rid) => oldOffMap.get(rid) ?? 1);

    dispatch({
      type: 'REGEN_SCHEDULE',
      rotation: newRotation,
      offDays: newOffDays,
      startDate: state.schedule?.startDate ?? todayISO(),
    });
  };

  const addExerciseToRoutine = (exerciseId: string) => {
    if (routine.exerciseIds.includes(exerciseId)) return;
    dispatch({
      type: 'UPSERT_ROUTINE',
      routine: { ...routine, exerciseIds: [...routine.exerciseIds, exerciseId] },
    });
  };

  const removeExerciseFromRoutine = (exerciseId: string) => {
    dispatch({
      type: 'UPSERT_ROUTINE',
      routine: {
        ...routine,
        exerciseIds: routine.exerciseIds.filter((id) => id !== exerciseId),
      },
    });
  };

  const addNewExercise = () => {
    const ex: Exercise = {
      id: uid(),
      name: '新しい種目',
      baseWeight: 20,
      sets: 3,
      reps: 8,
      periodizationEnabled: false,
      variation: defaultVariation(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPSERT_EXERCISE', exercise: ex });
    addExerciseToRoutine(ex.id);
  };

  return (
    <li
      className={`rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden ${
        isEnabled ? '' : 'opacity-60'
      }`}
    >
      <div className="flex items-center px-2">
        {/* チェックボックス: 予定への反映可否 */}
        <span
          role="checkbox"
          aria-checked={isEnabled}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            toggleEnabled();
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              toggleEnabled();
            }
          }}
          title={isEnabled ? '予定に反映中 (タップで除外)' : '除外中 (タップで反映)'}
          className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 cursor-pointer transition-colors ${
            isEnabled
              ? 'bg-amber-500 border-amber-500'
              : 'bg-transparent border-neutral-600 hover:border-neutral-400'
          }`}
        >
          {isEnabled && <Check size={14} className="text-neutral-950" />}
        </span>

        <button
          type="button"
          onClick={onToggle}
          className="flex-1 px-2 py-3 flex items-center justify-between min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs bg-amber-500/20 text-amber-300 w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {routine.order + 1}
            </span>
            <span className="font-semibold truncate">{routine.name}</span>
            <span className="text-[10px] text-neutral-500 flex-shrink-0">
              {routine.exerciseIds.length}種目
            </span>
          </div>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-800 p-3 space-y-3">
          {/* メニュー名 */}
          <div>
            <label className="text-[10px] text-neutral-500 uppercase">
              メニュー名
            </label>
            <input
              type="text"
              value={routine.name}
              onChange={(e) => updateName(e.target.value)}
              className="mt-1 w-full h-10 bg-neutral-950 border border-neutral-700 rounded-lg px-3 text-sm"
            />
          </div>

          {/* 種目 */}
          <div>
            <div className="text-[10px] text-neutral-500 uppercase mb-1">
              種目
            </div>
            <ul className="space-y-2">
              {routine.exerciseIds.map((eid) => {
                const ex = state.exercises.find((x) => x.id === eid);
                if (!ex) return null;
                return (
                  <ExerciseEditor
                    key={eid}
                    exercise={ex}
                    onRemove={() => removeExerciseFromRoutine(eid)}
                  />
                );
              })}
            </ul>

            <button
              type="button"
              onClick={addNewExercise}
              className="mt-2 w-full h-10 rounded-lg bg-neutral-800 text-neutral-200 text-sm font-semibold flex items-center justify-center gap-1"
            >
              <Plus size={14} /> 空の種目を追加
            </button>

            <ExercisePicker
              routineExerciseIds={routine.exerciseIds}
              onPickTemplate={(t) => {
                // 同名の既存種目があればそれを流用、なければ新規作成
                const existing = state.exercises.find(
                  (e) => e.name === t.name,
                );
                if (existing) {
                  addExerciseToRoutine(existing.id);
                  return;
                }
                const ex: Exercise = {
                  id: uid(),
                  name: t.name,
                  baseWeight: t.baseWeight,
                  sets: t.sets,
                  reps: t.reps,
                  periodizationEnabled: false,
                  variation: defaultVariation(),
                  createdAt: new Date().toISOString(),
                };
                dispatch({ type: 'UPSERT_EXERCISE', exercise: ex });
                addExerciseToRoutine(ex.id);
              }}
              onPickExisting={addExerciseToRoutine}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm(`「${routine.name}」を削除しますか?`)) {
                dispatch({ type: 'DELETE_ROUTINE', id: routine.id });
              }
            }}
            className="w-full text-xs text-red-400 flex items-center justify-center gap-1 h-8"
          >
            <Trash2 size={12} /> メニューを削除
          </button>
        </div>
      )}
    </li>
  );
}

// ===== Exercise Picker (テンプレート + 既存種目) =====

function ExercisePicker({
  routineExerciseIds,
  onPickTemplate,
  onPickExisting,
}: {
  routineExerciseIds: string[];
  onPickTemplate: (t: ExerciseTemplate) => void;
  onPickExisting: (id: string) => void;
}) {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [activePart, setActivePart] = useState<BodyPart>('胸');

  const unusedExercises = state.exercises.filter(
    (e) => !routineExerciseIds.includes(e.id),
  );
  const templates = EXERCISE_TEMPLATES[activePart];

  return (
    <div className="mt-2 rounded-lg border border-neutral-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs text-neutral-300 bg-neutral-800/60 hover:bg-neutral-800"
      >
        <span className="flex items-center gap-1.5">
          <Plus size={12} /> テンプレート / 既存種目から追加
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="p-2.5 space-y-2.5 bg-neutral-900/60">
          {/* 部位タブ */}
          <div className="flex gap-1 overflow-x-auto -mx-0.5 px-0.5 pb-0.5">
            {BODY_PARTS.map((p) => {
              const isActive = p === activePart;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePart(p)}
                  className={`text-[11px] px-2.5 h-7 rounded-full whitespace-nowrap font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* テンプレート一覧 */}
          <ul className="space-y-1">
            {templates.map((t) => {
              const alreadyInRoutine = state.exercises.some(
                (e) =>
                  e.name === t.name && routineExerciseIds.includes(e.id),
              );
              return (
                <li key={t.name}>
                  <button
                    type="button"
                    onClick={() => onPickTemplate(t)}
                    disabled={alreadyInRoutine}
                    className="w-full flex items-center justify-between bg-neutral-800/60 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md px-2.5 py-1.5 text-left"
                  >
                    <span className="text-xs font-semibold text-neutral-100">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {t.baseWeight}kg · {t.sets}×{t.reps}
                      {alreadyInRoutine && (
                        <span className="ml-1 text-amber-400">追加済</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* 既存のユーザー種目 */}
          {unusedExercises.length > 0 && (
            <div className="pt-2 border-t border-neutral-800">
              <div className="text-[10px] text-neutral-500 uppercase mb-1">
                登録済み種目
              </div>
              <div className="flex flex-wrap gap-1">
                {unusedExercises.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => onPickExisting(ex.id)}
                    className="text-[11px] px-2 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700"
                  >
                    + {ex.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== Exercise editor =====

function ExerciseEditor({
  exercise,
  onRemove,
}: {
  exercise: Exercise;
  onRemove: () => void;
}) {
  const { dispatch } = useApp();
  const update = (patch: Partial<Exercise>) =>
    dispatch({ type: 'UPSERT_EXERCISE', exercise: { ...exercise, ...patch } });

  return (
    <li className="rounded-lg bg-neutral-800/50 border border-neutral-800 p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => update({ name: e.target.value })}
          className="flex-1 h-9 bg-neutral-950 border border-neutral-700 rounded px-2 text-sm font-semibold"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-neutral-500 hover:text-red-400 p-1"
          aria-label="remove"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="基準kg">
          <NumberInput
            value={exercise.baseWeight}
            min={0}
            step={0.5}
            onCommit={(v) => update({ baseWeight: v })}
            className="w-full h-9 bg-neutral-950 border border-neutral-700 rounded px-2 text-center font-mono"
          />
        </Field>
        <Field label="set">
          <NumberInput
            value={exercise.sets}
            min={1}
            max={10}
            integer
            inputMode="numeric"
            onCommit={(v) => update({ sets: v })}
            className="w-full h-9 bg-neutral-950 border border-neutral-700 rounded px-2 text-center font-mono"
          />
        </Field>
        <Field label="rep">
          <NumberInput
            value={exercise.reps}
            min={1}
            max={30}
            integer
            inputMode="numeric"
            onCommit={(v) => update({ reps: v })}
            className="w-full h-9 bg-neutral-950 border border-neutral-700 rounded px-2 text-center font-mono"
          />
        </Field>
      </div>

      {/* ピリオダイゼーション */}
      <label className="flex items-center justify-between bg-neutral-900 rounded px-2 py-1.5">
        <span className="text-xs">ピリオダイゼーション</span>
        <input
          type="checkbox"
          checked={exercise.periodizationEnabled}
          onChange={(e) => update({ periodizationEnabled: e.target.checked })}
          className="w-4 h-4 accent-amber-500"
        />
      </label>

      {/* 変動セット */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="セット種別">
          <select
            value={exercise.variation.mode}
            onChange={(e) =>
              update({
                variation: {
                  ...exercise.variation,
                  mode: e.target.value as SetMode,
                },
              })
            }
            className="w-full h-9 bg-neutral-950 border border-neutral-700 rounded px-2 text-xs"
          >
            <option value="straight">ストレート</option>
            <option value="ascending">アセンディング</option>
            <option value="drop">ドロップ</option>
          </select>
        </Field>
        <Field label="増減 %">
          <NumberInput
            value={exercise.variation.percent ?? 0}
            min={0}
            max={100}
            step={1}
            onCommit={(v) =>
              update({
                variation: {
                  ...exercise.variation,
                  percent: v,
                },
              })
            }
            disabled={exercise.variation.mode === 'straight'}
            className="w-full h-9 bg-neutral-950 border border-neutral-700 rounded px-2 text-center font-mono disabled:opacity-40"
          />
        </Field>
      </div>
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] text-neutral-500 uppercase">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}
