import { useEffect, useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';

const SELECTED_KEY = 'machoup:chart:selectedIds';
const MAX_SELECT = 3;

/** 最大3種目分のオーバーレイ用カラー */
const SERIES_COLORS = ['#f59e0b', '#3b82f6', '#10b981'] as const;

export function ChartPage() {
  const { state, exerciseMap } = useApp();
  const isDark = state.user.theme !== 'light';
  const gridStroke = isDark ? '#2a3145' : '#c4c9d3';
  const axisTick = { fill: isDark ? '#9ca3af' : '#525d72', fontSize: 10 } as const;
  const tooltipStyle = {
    background: isDark ? '#1a2030' : '#2c3242',
    border: isDark ? '1px solid #2a3145' : '1px solid #4b5563',
    borderRadius: 8,
    fontSize: 12,
    color: '#f5f5f5',
  } as const;

  // 履歴 (= ログに登場する) のある種目だけが選択肢
  const exercisesWithLogs = useMemo(() => {
    const ids = new Set<string>();
    for (const log of state.logs) {
      for (const ex of log.exercises) {
        ids.add(ex.exerciseId);
      }
    }
    return state.exercises.filter((e) => ids.has(e.id));
  }, [state.exercises, state.logs]);

  // 選択中の種目ID (最大 3, デフォルト=ログのある先頭最大3件)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SELECTED_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr.filter((v) => typeof v === 'string').slice(0, MAX_SELECT);
      }
    } catch {
      /* noop */
    }
    return [];
  });

  // 削除等で消えた ID を除去
  useEffect(() => {
    const validIds = new Set(exercisesWithLogs.map((e) => e.id));
    const next = selectedIds.filter((id) => validIds.has(id));
    if (next.length !== selectedIds.length) setSelectedIds(next);
  }, [exercisesWithLogs, selectedIds]);

  // 選択を永続化
  useEffect(() => {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) {
        alert(`最大 ${MAX_SELECT} 種目まで選択できます`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const isMulti = selectedIds.length > 0;

  /**
   * - 0 種目選択時: 全種目合算ボリューム (date, total)
   * - 1〜3 種目選択時: 各種目を別系列で表示。
   *   wide format: { date, [`${id}_max`], [`${id}_vol`] }
   */
  const data = useMemo(() => {
    if (!isMulti) {
      const rows: { date: string; total: number }[] = [];
      for (const log of state.logs) {
        let vol = 0;
        for (const ex of log.exercises) {
          vol += ex.setLogs
            .filter((s) => s.completed)
            .reduce((sum, s) => sum + s.weight * s.reps, 0);
        }
        if (vol > 0) rows.push({ date: log.date, total: vol });
      }
      return rows.sort((a, b) => a.date.localeCompare(b.date));
    }

    const dateMap = new Map<string, Record<string, number | string>>();
    for (const log of state.logs) {
      for (const id of selectedIds) {
        const ex = log.exercises.find((e) => e.exerciseId === id);
        if (!ex) continue;
        const completed = ex.setLogs.filter((s) => s.completed && s.reps > 0);
        if (completed.length === 0) continue;
        const maxW = Math.max(0, ...completed.map((s) => s.weight));
        const vol = completed.reduce((sum, s) => sum + s.weight * s.reps, 0);
        const row = dateMap.get(log.date) ?? { date: log.date };
        row[`${id}_max`] = maxW;
        row[`${id}_vol`] = vol;
        dateMap.set(log.date, row);
      }
    }
    return [...dateMap.values()].sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    );
  }, [state.logs, selectedIds, isMulti]);

  // ===== Empty states =====
  if (state.exercises.length === 0) {
    return (
      <div className="text-center text-neutral-400 py-10">種目が未登録です</div>
    );
  }
  if (exercisesWithLogs.length === 0) {
    return (
      <div className="text-center text-neutral-400 py-10">
        <div className="text-3xl mb-2">📊</div>
        <div className="font-semibold text-sm">トレーニング履歴がありません</div>
        <div className="text-xs mt-1 text-neutral-500">
          ログを保存するとここに推移が表示されます
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ===== 種目選択 (最大3) ===== */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
            <Layers size={12} /> 表示する種目 (最大{MAX_SELECT})
          </label>
          <span className="text-[10px] text-neutral-500 font-mono">
            {selectedIds.length} / {MAX_SELECT}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {exercisesWithLogs.map((ex) => {
            const idx = selectedIds.indexOf(ex.id);
            const selected = idx >= 0;
            const color = selected ? SERIES_COLORS[idx] : undefined;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => toggleSelect(ex.id)}
                className={`text-xs px-3 h-8 rounded-full font-semibold transition-colors flex items-center gap-1.5 ${
                  selected
                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-600'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${selected ? '' : 'bg-neutral-700'}`}
                  style={selected ? { backgroundColor: color } : undefined}
                />
                {ex.name}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-neutral-500 mt-2">
          {isMulti
            ? `${selectedIds.length}種目を重ねて表示中`
            : '未選択時は全種目の合算ボリュームを表示します'}
        </div>
      </section>

      {/* ===== Charts ===== */}
      {isMulti ? (
        <>
          {/* 最大挙上重量 (オーバーレイ) */}
          <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3">
            <div className="text-xs font-semibold text-neutral-400 mb-2">
              最大挙上重量の推移
            </div>
            <div className="h-56">
              {data.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={axisTick}
                      tickFormatter={(d: string) => d.slice(5)}
                    />
                    <YAxis tick={axisTick} width={40} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: '#a3a3a3' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                      iconType="circle"
                    />
                    {selectedIds.map((id, i) => (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={`${id}_max`}
                        name={exerciseMap[id]?.name ?? id}
                        stroke={SERIES_COLORS[i]}
                        strokeWidth={2}
                        dot={{ fill: SERIES_COLORS[i], r: 3 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* ボリューム (オーバーレイ) */}
          <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3">
            <div className="text-xs font-semibold text-neutral-400 mb-2">
              総挙上量(ボリューム)推移
            </div>
            <div className="h-48">
              {data.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={axisTick}
                      tickFormatter={(d: string) => d.slice(5)}
                    />
                    <YAxis tick={axisTick} width={40} />
                    <Tooltip contentStyle={tooltipStyle} />
                    {selectedIds.map((id, i) => (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={`${id}_vol`}
                        name={exerciseMap[id]?.name ?? id}
                        stroke={SERIES_COLORS[i]}
                        strokeWidth={2}
                        dot={{ fill: SERIES_COLORS[i], r: 3 }}
                        strokeDasharray="4 2"
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </>
      ) : (
        // 全種目合算
        <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3">
          <div className="text-xs font-semibold text-neutral-400 mb-2">
            総挙上量(ボリューム)推移 — 全種目合算
          </div>
          <div className="h-56">
            {data.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                >
                  <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={axisTick}
                    tickFormatter={(d: string) => d.slice(5)}
                  />
                  <YAxis tick={axisTick} width={40} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="合算ボリューム"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      )}

      <section className="text-[11px] text-neutral-500">
        ※ 完了済みセットのみを集計。
        {isMulti
          ? `${selectedIds
              .map((id) => exerciseMap[id]?.name)
              .filter(Boolean)
              .join(' / ')} を表示`
          : '全種目の総ボリューム (kg×reps の合計) を日次表示'}
      </section>
    </div>
  );
}

function Empty() {
  return (
    <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
      データがありません
    </div>
  );
}
