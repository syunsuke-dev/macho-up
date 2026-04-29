import { useState } from 'react';
import { SkipForward, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  buildSetWeights,
  routineHasAnyPeriodization,
} from '../lib/periodization';
import { getEntryByDate, todayISO } from '../lib/schedule';
import { ReschedulePicker } from './ReschedulePicker';

const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];

interface Props {
  date: string;
  onClose: () => void;
}

/**
 * 日付タップで開く詳細ボトムシート (上部寄せ表示)。
 * 当日と未来日のみリスケボタンが表示される。過去日は閲覧のみ。
 */
export function DayDetailSheet({ date, onClose }: Props) {
  const { state, dispatch, exerciseMap, routineMap } = useApp();
  const entry = getEntryByDate(state.schedule, date);
  const routine = entry?.routineId ? routineMap[entry.routineId] : null;
  const d = new Date(date);
  const today = todayISO();
  const isToday = date === today;
  const isPast = date < today;

  const [pickerOpen, setPickerOpen] = useState(false);

  const routineExercises = routine
    ? routine.exerciseIds
        .map((id) => exerciseMap[id])
        .filter((e): e is NonNullable<typeof e> => !!e)
    : [];
  const forceDeload = routineHasAnyPeriodization(routineExercises);

  const handleShiftAll = () => {
    dispatch({ type: 'RESCHEDULE', fromDate: date });
    setPickerOpen(false);
    onClose();
  };
  const handleSingleDay = () => {
    dispatch({ type: 'RESCHEDULE_SINGLE_DAY', fromDate: date });
    setPickerOpen(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="w-full max-w-md bg-neutral-900 border-b border-x border-neutral-800 rounded-b-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* ヘッダ */}
          <div className="px-4 pt-3 pb-3 flex items-start justify-between border-b border-neutral-800">
            <div>
              <div
                className={`text-xs ${
                  isToday ? 'text-amber-300' : 'text-neutral-400'
                }`}
              >
                {isToday ? '今日' : isPast ? '過去' : '予定'}
              </div>
              <div className="text-lg font-bold font-mono">
                {d.getFullYear()}/
                {String(d.getMonth() + 1).padStart(2, '0')}/
                {String(d.getDate()).padStart(2, '0')} (
                {WEEKDAY_JP[d.getDay()]})
              </div>
              <div className="text-sm text-neutral-300 mt-0.5">
                {routine ? routine.name : 'オフ日'}
                {entry?.done && (
                  <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                    完了
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800"
              aria-label="close"
            >
              <X size={18} />
            </button>
          </div>

          {/* 本体 */}
          <div className="p-4">
            {!routine ? (
              <div className="text-center text-neutral-400 py-6">
                <div className="text-3xl mb-1">💤</div>
                <div className="font-semibold text-sm">休養日</div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  しっかり回復しましょう
                </div>
              </div>
            ) : routineExercises.length === 0 ? (
              <div className="text-center text-neutral-500 text-sm py-6">
                種目が登録されていません
              </div>
            ) : (
              <ul className="space-y-2">
                {routineExercises.map((ex) => {
                  const weights = buildSetWeights(
                    ex,
                    state.user.currentCycle,
                    { forceDeload },
                  );
                  return (
                    <li
                      key={ex.id}
                      className="bg-neutral-800/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">
                            {ex.name}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {ex.sets} set × {ex.reps} rep
                            {ex.periodizationEnabled && (
                              <span className="ml-1 text-amber-400">· P</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {weights.map((w, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono font-bold text-amber-300 bg-neutral-900/70 rounded px-1.5 py-0.5"
                          >
                            {i + 1}· {w}kg
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* リスケボタン (今日 or 未来日のみ) */}
            {!isPast && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-4 w-full h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <SkipForward size={14} />
                リスケ
                {!routine && (
                  <span className="text-[10px] text-emerald-400">(前倒し)</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* リスケのモード選択 */}
      {pickerOpen && (
        <ReschedulePicker
          fromDate={date}
          isOffDay={!routine}
          onPickShiftAll={handleShiftAll}
          onPickSingleDay={handleSingleDay}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
