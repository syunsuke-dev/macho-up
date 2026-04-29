import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayISO } from '../lib/schedule';
import { DayDetailSheet } from '../components/DayDetailSheet';

const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];

export function CalendarPage() {
  const { state, routineMap } = useApp();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = todayISO();
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const y = target.getFullYear();
  const m = target.getMonth();
  const monthStart = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const nm = new Date(y, m + 1, 1);
  const monthEnd = `${nm.getFullYear()}-${String(nm.getMonth() + 1).padStart(2, '0')}-01`;

  // その月のトレーニング予定 (オフ日は除外)
  const entries = useMemo(() => {
    if (!state.schedule) return [];
    return state.schedule.entries
      .filter(
        (e) => e.routineId != null && e.date >= monthStart && e.date < monthEnd,
      )
      .sort((a, b) => a.date.localeCompare(b.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.schedule, monthStart, monthEnd]);

  // 実施日: log.date (yyyy-mm-dd) をキーにマップ
  const logByDate = useMemo(() => {
    const map = new Map<string, { date: string; routineId: string | null }>();
    for (const log of state.logs) map.set(log.date, log);
    return map;
  }, [state.logs]);

  return (
    <div className="space-y-4">
      {/* 月切替 */}
      <section className="flex items-center justify-between rounded-xl bg-neutral-900 border border-neutral-800 px-2 py-2">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o - 1)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-neutral-800"
          aria-label="前月"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-1.5">
          <CalendarDays size={16} className="text-amber-400" />
          <span className="font-bold text-base">
            {y}年 {m + 1}月
          </span>
          {monthOffset !== 0 && (
            <button
              type="button"
              onClick={() => setMonthOffset(0)}
              className="ml-2 text-[10px] text-amber-300 underline"
            >
              今月へ
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o + 1)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-neutral-800"
          aria-label="翌月"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {/* カレンダー (月次グリッド) */}
      <MonthGrid
        year={y}
        month={m}
        today={today}
        entries={state.schedule?.entries ?? []}
        routineColors={routineColorMap(state.routines.map((r) => r.id))}
        onSelectDate={setSelectedDate}
      />

      {/* リスト */}
      <section className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-[72px_1fr_72px] gap-2 px-3 py-2 text-[10px] text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
          <span>予定日</span>
          <span>プラン名</span>
          <span className="text-right">実施日</span>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            この月のトレーニング予定はありません
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {entries.map((e) => {
              const routine = e.routineId ? routineMap[e.routineId] : null;
              const log = logByDate.get(e.date);
              const executed = e.done ? log?.date ?? e.date : null;
              const d = new Date(e.date);
              const isToday = e.date === today;
              const isPast = e.date < today;
              const isMissed = isPast && !e.done;

              return (
                <li key={e.date}>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(e.date)}
                    className={`w-full grid grid-cols-[72px_1fr_72px] gap-2 px-3 py-2.5 items-center text-left active:bg-neutral-800/40 transition-colors ${
                      isToday ? 'bg-amber-500/10' : ''
                    }`}
                  >
                  {/* 予定日 */}
                  <div>
                    <div
                      className={`text-sm font-mono font-bold ${
                        isToday ? 'text-amber-300' : 'text-neutral-100'
                      }`}
                    >
                      {String(d.getMonth() + 1).padStart(2, '0')}/
                      {String(d.getDate()).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      ({WEEKDAY_JP[d.getDay()]})
                      {isToday && (
                        <span className="ml-1 text-amber-400">今日</span>
                      )}
                    </div>
                  </div>

                  {/* プラン名 */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {routine?.name ?? '—'}
                    </div>
                    {routine && (
                      <div className="text-[10px] text-neutral-500 truncate">
                        {routine.exerciseIds.length}種目
                      </div>
                    )}
                  </div>

                  {/* 実施日 */}
                  <div className="text-right">
                    {executed ? (
                      <>
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {executed.slice(5).replace('-', '/')}
                        </div>
                        <div className="text-[10px] text-emerald-500/80 flex items-center justify-end">
                          <Dot size={14} className="-mr-1" /> 完了
                        </div>
                      </>
                    ) : isMissed ? (
                      <div className="text-xs text-red-400">未消化</div>
                    ) : (
                      <div className="text-xs text-neutral-500">—</div>
                    )}
                  </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-neutral-500 text-center">
        予定日・実施日がズレる場合はリスケまたは手動ログに起因します
        <br />
        日付タップでリスケが可能です
      </p>

      {/* 日付タップで開く詳細モーダル */}
      {selectedDate && (
        <DayDetailSheet
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

// ===== Month Grid =====

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed
  today: string;
  entries: { date: string; routineId: string | null; done: boolean }[];
  routineColors: Record<string, string>;
  onSelectDate: (date: string) => void;
}

/** 6種類のパレット (ルーティンに順に割り当て) */
const PALETTE = [
  { dot: 'bg-amber-400', ring: 'ring-amber-500/40' },
  { dot: 'bg-sky-400', ring: 'ring-sky-500/40' },
  { dot: 'bg-emerald-400', ring: 'ring-emerald-500/40' },
  { dot: 'bg-fuchsia-400', ring: 'ring-fuchsia-500/40' },
  { dot: 'bg-rose-400', ring: 'ring-rose-500/40' },
  { dot: 'bg-cyan-400', ring: 'ring-cyan-500/40' },
] as const;

function routineColorMap(routineIds: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  routineIds.forEach((id, i) => {
    map[id] = String(i % PALETTE.length);
  });
  return map;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function MonthGrid({ year, month, today, entries, routineColors, onSelectDate }: MonthGridProps) {
  const { routineMap } = useApp();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0..6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  type Cell =
    | null
    | {
        day: number;
        date: string;
        routineId: string | null;
        done: boolean;
      };

  const cells: Cell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${pad(month + 1)}-${pad(d)}`;
    const e = entries.find((x) => x.date === date);
    cells.push({
      day: d,
      date,
      routineId: e?.routineId ?? null,
      done: e?.done ?? false,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  // 使われているルーティンの凡例
  const usedRoutineIds = Array.from(
    new Set(
      entries
        .filter((e) => e.date.startsWith(`${year}-${pad(month + 1)}`))
        .map((e) => e.routineId)
        .filter((id): id is string => id != null),
    ),
  );

  return (
    <section className="rounded-xl bg-neutral-900 border border-neutral-800 p-3">
      {/* 曜日ヘッダ */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_JP.map((w, i) => (
          <div
            key={w}
            className={`text-center text-[10px] font-semibold ${
              i === 0
                ? 'text-rose-400'
                : i === 6
                  ? 'text-sky-400'
                  : 'text-neutral-500'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* セル */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="aspect-square" />;
          const isToday = cell.date === today;
          const isPast = cell.date < today;
          const routine = cell.routineId ? routineMap[cell.routineId] : null;
          const palIdx = cell.routineId
            ? Number(routineColors[cell.routineId] ?? 0)
            : 0;
          const pal = PALETTE[palIdx];

          const base =
            'aspect-square rounded-md text-[10px] flex flex-col items-center justify-center relative border';
          const borderCls = isToday
            ? 'border-amber-500'
            : routine
              ? 'border-neutral-700'
              : 'border-neutral-800/50';
          const bgCls = isToday
            ? 'bg-amber-500/10'
            : routine
              ? 'bg-neutral-800/40'
              : 'bg-neutral-950/40';
          const dimCls = isPast && !cell.done && routine ? 'opacity-50' : '';

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`${base} ${borderCls} ${bgCls} ${dimCls} active:scale-[0.96] transition-transform`}
              title={routine ? `${cell.date} ${routine.name}` : cell.date}
            >
              <div
                className={`font-mono font-bold text-[11px] ${
                  isToday ? 'text-amber-300' : 'text-neutral-200'
                }`}
              >
                {cell.day}
              </div>

              {routine ? (
                <div
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full ${pal.dot}`}
                  aria-label={routine.name}
                />
              ) : (
                <div className="mt-0.5 h-1.5" />
              )}

              {cell.done && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      {usedRoutineIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {usedRoutineIds.map((rid) => {
            const r = routineMap[rid];
            if (!r) return null;
            const pal = PALETTE[Number(routineColors[rid] ?? 0)];
            return (
              <span
                key={rid}
                className="inline-flex items-center gap-1 text-[10px] text-neutral-300"
              >
                <span className={`w-2 h-2 rounded-full ${pal.dot}`} />
                {r.name}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 ml-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> 完了
          </span>
        </div>
      )}
    </section>
  );
}

