import { useState } from 'react';
import { CalendarDays, ChevronRight, Dumbbell, SkipForward, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CYCLE_LABELS,
  buildSetWeights,
  routineHasAnyPeriodization,
} from '../lib/periodization';
import {
  calculateTotalVolume,
  getAchievedComparisons,
} from '../lib/achievements';
import {
  getEntryByDate,
  getUpcomingEntries,
  todayISO,
} from '../lib/schedule';
import { DayDetailSheet } from '../components/DayDetailSheet';
import { ReschedulePicker } from '../components/ReschedulePicker';

interface Props {
  onGoLog: () => void;
}

const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];

export function HomePage({ onGoLog }: Props) {
  const { state, dispatch, exerciseMap, routineMap } = useApp();
  const today = todayISO();
  const todayEntry = getEntryByDate(state.schedule, today);
  const upcoming = getUpcomingEntries(state.schedule, today, 7);
  const todayRoutine = todayEntry?.routineId
    ? routineMap[todayEntry.routineId]
    : null;

  // 週次スケジュール: 日付タップでその日の詳細を表示
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // リスケのモード選択ピッカー
  const [reschedulePickerOpen, setReschedulePickerOpen] = useState(false);

  // 総重量と達成バッジ
  const totalVolume = calculateTotalVolume(state.logs);
  const achieved = getAchievedComparisons(totalVolume);

  const recentLogs = [...state.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  // 今日のルーティン内でいずれかの種目がピリオダイゼーション有効なら
  // ・4サイクル目は全種目 50% に強制する (forceDeload)
  // ・サイクル表示カードを表示する
  const todayRoutineExercises = todayRoutine
    ? todayRoutine.exerciseIds
        .map((id) => exerciseMap[id])
        .filter((e): e is NonNullable<typeof e> => !!e)
    : [];
  const todayHasPeriodization = routineHasAnyPeriodization(
    todayRoutineExercises,
  );
  const forceDeload = todayHasPeriodization;

  return (
    <div className="space-y-5">
      {/* ユーザー名 + 達成バッジ */}
      <section className="flex items-center justify-between gap-2 -mb-1">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-xs text-neutral-400">ようこそ、</span>
          <span className="font-bold text-base truncate">
            {state.user.name || 'You'}
          </span>
          <span className="text-xs text-neutral-400">さん</span>
        </div>
        {achieved.length > 0 && (
          <div className="flex gap-0.5 text-base flex-shrink-0">
            {achieved.map((c) => (
              <span
                key={c.name}
                title={`${c.name} 達成 (1個分=${c.unit})`}
                className="leading-none"
              >
                {c.emoji}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* サイクル表示 (今日のメニューに ピリオダイゼーション ON の種目が
          1つ以上ある場合のみ表示) */}
      {todayHasPeriodization && (
        <section className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-300/80">現在のサイクル</div>
            <div className="text-base font-bold text-amber-200">
              {CYCLE_LABELS[state.user.currentCycle]}
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'ADVANCE_CYCLE' })}
            className="text-xs font-semibold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-full"
          >
            次へ →
          </button>
        </section>
      )}

      {/* 今日のメニュー */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          今日のメニュー
        </h2>
        {todayRoutine ? (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Dumbbell size={18} className="text-amber-400" />
                <div className="font-bold text-base">{todayRoutine.name}</div>
              </div>
              {todayEntry?.done && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  完了
                </span>
              )}
            </div>

            <ul className="space-y-2 mb-4">
              {todayRoutine.exerciseIds.map((eid) => {
                const ex = exerciseMap[eid];
                if (!ex) return null;
                const weights = buildSetWeights(
                  ex,
                  state.user.currentCycle,
                  { forceDeload },
                );
                return (
                  <li
                    key={eid}
                    className="bg-neutral-800/50 rounded-lg px-3 py-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm">{ex.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        {ex.sets} set × {ex.reps} rep
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-neutral-400">重量</div>
                      <div className="text-sm font-mono font-bold text-amber-300">
                        {weights.join(' / ')}kg
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onGoLog}
                className="h-12 rounded-xl bg-amber-500 text-neutral-950 font-bold active:scale-[0.98] transition"
              >
                記録する
              </button>
              <button
                type="button"
                onClick={() => setReschedulePickerOpen(true)}
                className="h-12 rounded-xl bg-neutral-800 text-neutral-200 font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition"
              >
                <SkipForward size={16} />
                リスケ
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-400">
            <div className="text-3xl mb-1">💤</div>
            <div className="font-semibold">今日はオフです</div>
            <div className="text-xs mt-1 mb-4">しっかり休養を取りましょう</div>
            {/* オフ日でもリスケボタン (前倒し用) */}
            <button
              type="button"
              onClick={() => setReschedulePickerOpen(true)}
              className="mx-auto h-11 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <SkipForward size={14} />
              リスケ (前倒し)
            </button>
          </div>
        )}
      </section>

      {/* 今週のスケジュール */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <CalendarDays size={14} /> 今週のスケジュール
        </h2>
        <div className="grid grid-cols-7 gap-1">
          {upcoming.slice(0, 7).map((e) => {
            const d = new Date(e.date);
            const isToday = e.date === today;
            const routine = e.routineId ? routineMap[e.routineId] : null;
            return (
              <button
                type="button"
                key={e.date}
                onClick={() => setSelectedDate(e.date)}
                className={`rounded-lg p-1.5 text-center border active:scale-[0.96] transition-transform ${
                  isToday
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                <div className="text-[10px] text-neutral-400">
                  {WEEKDAY_JP[d.getDay()]}
                </div>
                <div className="text-xs font-bold">{d.getDate()}</div>
                <div
                  className={`text-[9px] mt-1 h-4 leading-none flex items-center justify-center truncate ${
                    routine ? 'text-amber-300' : 'text-neutral-500'
                  }`}
                  title={routine?.name}
                >
                  {routine ? routine.name.slice(0, 3) : 'off'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 直近履歴 */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <TrendingUp size={14} /> 直近履歴
        </h2>
        {recentLogs.length === 0 ? (
          <div className="text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
            ログはまだありません
          </div>
        ) : (
          <ul className="space-y-2">
            {recentLogs.map((log) => {
              const r = log.routineId ? routineMap[log.routineId] : null;
              const total = log.exercises.reduce(
                (sum, ex) =>
                  sum + ex.setLogs.reduce((s, st) => s + st.weight * st.reps, 0),
                0,
              );
              return (
                <li
                  key={log.id}
                  className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2"
                >
                  <div>
                    <div className="text-xs text-neutral-400">{log.date}</div>
                    <div className="font-semibold text-sm">
                      {r?.name ?? '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-neutral-400">volume</div>
                    <div className="text-sm font-mono font-bold">
                      {total.toLocaleString()}kg
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-neutral-600 ml-2" />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 日付タップで表示される詳細モーダル */}
      {selectedDate && (
        <DayDetailSheet
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* リスケのモード選択 */}
      {reschedulePickerOpen && (
        <ReschedulePicker
          fromDate={today}
          isOffDay={!todayRoutine}
          onPickShiftAll={() => {
            dispatch({ type: 'RESCHEDULE', fromDate: today });
            setReschedulePickerOpen(false);
          }}
          onPickSingleDay={() => {
            dispatch({ type: 'RESCHEDULE_SINGLE_DAY', fromDate: today });
            setReschedulePickerOpen(false);
          }}
          onClose={() => setReschedulePickerOpen(false)}
        />
      )}
    </div>
  );
}
