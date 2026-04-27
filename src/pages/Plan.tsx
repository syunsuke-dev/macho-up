import { useState } from 'react';
import { BookOpen, Check, ChevronDown, ChevronUp, Plus, Sparkles, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uid } from '../lib/storage';
import { defaultVariation } from '../lib/periodization';
import { todayISO } from '../lib/schedule';
import { NumberInput } from '../components/NumberInput';
import { HelpIcon } from '../components/HelpIcon';
import {
  BODY_PARTS,
  EXERCISE_TEMPLATES,
  type BodyPart,
  type ExerciseTemplate,
} from '../lib/exerciseTemplates';
import type { Exercise, Routine, SetMode } from '../types';

interface PlanPageProps {
  onShowGuide?: () => void;
}

export function PlanPage({ onShowGuide }: PlanPageProps = {}) {
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

  /**
   * クイックスタート: Push/Pull/Legs の3メニュー構成をテンプレから自動作成
   */
  const quickStart = () => {
    const now = new Date().toISOString();

    // 各部位からピックする種目 (テンプレ先頭から数件ずつ)
    const pickFromBodyPart = (
      part: BodyPart,
      count: number,
    ): Exercise[] =>
      EXERCISE_TEMPLATES[part].slice(0, count).map((t) => ({
        id: uid(),
        name: t.name,
        baseWeight: t.baseWeight,
        sets: t.sets,
        reps: t.reps,
        periodizationEnabled: false,
        variation: defaultVariation(),
        createdAt: now,
      }));

    const pushExercises = [
      ...pickFromBodyPart('胸', 3),
      ...pickFromBodyPart('肩', 2),
      ...pickFromBodyPart('腕', 1),
    ];
    const pullExercises = [
      ...pickFromBodyPart('背中', 4),
      ...pickFromBodyPart('腕', 1),
    ];
    const legsExercises = pickFromBodyPart('下半身', 5);

    const pushRoutine: Routine = {
      id: uid(),
      name: 'Push (胸・肩・三頭)',
      order: 0,
      exerciseIds: pushExercises.map((e) => e.id),
      enabled: true,
      createdAt: now,
    };
    const pullRoutine: Routine = {
      id: uid(),
      name: 'Pull (背中・二頭)',
      order: 1,
      exerciseIds: pullExercises.map((e) => e.id),
      enabled: true,
      createdAt: now,
    };
    const legsRoutine: Routine = {
      id: uid(),
      name: 'Legs (下半身)',
      order: 2,
      exerciseIds: legsExercises.map((e) => e.id),
      enabled: true,
      createdAt: now,
    };

    // 種目を全て追加 (UPSERT_EXERCISE)
    [...pushExercises, ...pullExercises, ...legsExercises].forEach((ex) => {
      dispatch({ type: 'UPSERT_EXERCISE', exercise: ex });
    });

    // ルーティンを追加
    dispatch({ type: 'UPSERT_ROUTINE', routine: pushRoutine });
    dispatch({ type: 'UPSERT_ROUTINE', routine: pullRoutine });
    dispatch({ type: 'UPSERT_ROUTINE', routine: legsRoutine });

    // スケジュールを生成
    dispatch({
      type: 'REGEN_SCHEDULE',
      rotation: [pushRoutine.id, pullRoutine.id, legsRoutine.id],
      offDays: [1, 1, 1],
      startDate: todayISO(),
    });
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

  // 初回 (メニューが空) の場合はオンボーディング画面を表示
  if (state.routines.length === 0) {
    return (
      <PlanEmptyState
        onQuickStart={quickStart}
        onManualStart={addRoutine}
        onShowGuide={onShowGuide}
      />
    );
  }

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

// ===== 初回オンボーディング (メニューが空のとき) =====

function PlanEmptyState({
  onQuickStart,
  onManualStart,
  onShowGuide,
}: {
  onQuickStart: () => void;
  onManualStart: () => void;
  onShowGuide?: () => void;
}) {
  return (
    <div className="space-y-5 pt-4">
      <section className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 mb-3">
          <Sparkles size={26} className="text-amber-400" />
        </div>
        <h2 className="text-base font-bold mb-1">
          まずはトレーニングメニューを作りましょう
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed px-2">
          最大6つまでメニューを登録できます。
          <br />
          おすすめプラン or 自分で1から、お好きな方を選んでください。
        </p>
      </section>

      <section className="space-y-2">
        <button
          type="button"
          onClick={onQuickStart}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 text-left active:scale-[0.99] transition shadow-lg shadow-amber-500/20"
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <Sparkles size={16} /> おすすめプランで始める
          </div>
          <div className="text-[11px] leading-relaxed opacity-80">
            Push (胸・肩・三頭) / Pull (背中・二頭) / Legs (下半身) の
            3メニュー構成を即座に作成。<br />
            あとから自由に編集できます。
          </div>
        </button>

        <button
          type="button"
          onClick={onManualStart}
          className="w-full p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-left active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-2 font-bold mb-1 text-neutral-100">
            <Plus size={16} /> 自分で1から作る
          </div>
          <div className="text-[11px] text-neutral-400 leading-relaxed">
            空のメニューを作成 → 種目をテンプレートまたは手動で追加。
            <br />
            こだわり派におすすめ。
          </div>
        </button>
      </section>

      {/* コンセプト解説リンク (基本だけ) */}
      <section className="pt-2">
        <div className="text-[10px] text-neutral-500 uppercase mb-2">
          まずは知っておきたい
        </div>
        <div className="space-y-1.5">
          <ConceptCard
            title="メニューって何個作るの？"
            body={
              <>
                <strong>1〜6 個</strong>{' '}
                までお好きに。1つだけでも OK
                ですし、Push/Pull/Legs のように分けても OK。
                登録したメニューを順番に回すスケジュールが自動で作られます。
              </>
            }
          />
          <ConceptCard
            title="基準KGって何を入れる？"
            body={
              <>
                普段やっている <strong>無理なくこなせる重量</strong>{' '}
                を入れてください。例えばベンチプレスを 60kg×5回 でやっているなら 60。
                あとからプラン画面でいつでも変更できます。
              </>
            }
          />
          <ConceptCard
            title="オフ日の設定は？"
            body={
              <>
                各メニュー後の休養日数を 0〜7 日で指定できます。
                例: Push の後 1 日オフ → Pull の後 1 日オフ → Legs の後 2 日オフ、など。
                プラン上部の「ローテーション & オフ日数」で調整できます。
              </>
            }
          />
          <ConceptCard
            title="📈 ピリオダイゼーションって何？(任意)"
            body={
              <>
                計画的に重量を上げ下げする筋トレの手法 (4サイクル制で 75/80/85/50%)。
                <strong className="text-amber-300">
                  使わなくて全く問題ありません
                </strong>
                。デフォルトで OFF なので意識せず使えます。
                興味あれば右下「詳しい使い方ガイド」の「応用機能」セクションへ。
              </>
            }
          />
        </div>
      </section>

      {onShowGuide && (
        <button
          type="button"
          onClick={onShowGuide}
          className="w-full h-11 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <BookOpen size={14} /> 詳しい使い方ガイド
        </button>
      )}
    </div>
  );
}

function ConceptCard({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 flex items-center justify-between text-left"
      >
        <span className="text-xs font-semibold text-amber-300">{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="px-3 pb-3 text-[11px] text-neutral-300 leading-relaxed border-t border-neutral-800 pt-2">
          {body}
        </div>
      )}
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
        <Field
          label="基準kg"
          help={{
            title: '基準KG とは',
            body: (
              <>
                <p>サイクル係数を掛ける元になる重量です。</p>
                <p>
                  例: 基準KG が <strong>100kg</strong> でピリオダイゼーション
                  ON の場合
                </p>
                <ul className="list-disc list-inside text-neutral-300">
                  <li>Cycle 1 → 75kg</li>
                  <li>Cycle 2 → 80kg</li>
                  <li>Cycle 3 → 85kg</li>
                  <li>Cycle 4 → 50kg (Deload)</li>
                </ul>
                <p className="text-neutral-400">
                  ※ 0.5 kg 単位で自動丸め
                </p>
                <p className="text-neutral-400">
                  自分の最大挙上重量(1RM)、または「ちょっと余裕がある重量」を入れるのが目安。
                </p>
              </>
            ),
          }}
        >
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

      {/* ピリオダイゼーション (任意機能) */}
      <label className="flex items-center justify-between bg-neutral-900 rounded px-2 py-1.5">
        <span className="text-xs flex items-center gap-1">
          ピリオダイゼーション
          <span className="text-[9px] text-neutral-500 border border-neutral-700 rounded px-1 py-0.5">
            任意
          </span>
          <HelpIcon
            title="ピリオダイゼーション (任意)"
            body={
              <>
                <p>
                  <strong className="text-amber-300">
                    使わなくて全く問題ない応用機能
                  </strong>
                  です。OFF のままなら入力した重量がそのまま表示されます。
                </p>
                <p className="mt-2">
                  ON にすると、計画的に重量を上げ下げする「4サイクル制」
                  (75% → 80% → 85% → 50% Deload) が適用されます。
                  本格的に筋力を伸ばしたい人向け。
                </p>
                <p className="text-neutral-400 mt-2">
                  詳しくは「設定」→「使い方ガイド」→「応用機能」をご覧ください。
                </p>
              </>
            }
          />
        </span>
        <input
          type="checkbox"
          checked={exercise.periodizationEnabled}
          onChange={(e) => update({ periodizationEnabled: e.target.checked })}
          className="w-4 h-4 accent-amber-500"
        />
      </label>

      {/* 変動セット */}
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="セット種別"
          help={{
            title: 'セット種別 (変動セット)',
            body: (
              <>
                <p>1セッション内でセットごとの重量パターンを選択:</p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1">
                  <li>
                    <strong>ストレート</strong>: 全セット同じ重量 (基本)
                  </li>
                  <li>
                    <strong>アセンディング</strong>: 前セットから「増減%」上げる
                    <br />
                    例 5%: 80→84→88kg
                  </li>
                  <li>
                    <strong>ドロップ</strong>: 前セットから「増減%」下げる
                    <br />
                    例 10%: 80→72→64kg
                  </li>
                </ul>
              </>
            ),
          }}
        >
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

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: { title: string; body: React.ReactNode };
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
        {label}
        {help && <HelpIcon title={help.title} body={help.body} size={11} />}
      </span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}
