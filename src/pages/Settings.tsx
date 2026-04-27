import { Download, LogOut, Moon, RotateCcw, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CYCLE_LABELS } from '../lib/periodization';
import type { Theme } from '../types';

export function SettingsPage() {
  const { state, dispatch, exerciseMap, routineMap } = useApp();
  const { user, signOut } = useAuth();

  const exportCSV = () => {
    const header = [
      'date',
      'routine',
      'cycle',
      'exercise',
      'set',
      'planned_weight_kg',
      'actual_weight_kg',
      'reps',
      'completed',
    ];
    const rows: string[] = [header.join(',')];

    for (const log of state.logs) {
      const rName = log.routineId ? routineMap[log.routineId]?.name ?? '' : '';
      for (const ex of log.exercises) {
        const eName = exerciseMap[ex.exerciseId]?.name ?? '';
        ex.setLogs.forEach((s, i) => {
          rows.push(
            [
              log.date,
              csvCell(rName),
              log.cycle,
              csvCell(eName),
              i + 1,
              ex.plannedWeights[i] ?? '',
              s.weight,
              s.reps,
              s.completed ? '1' : '0',
            ].join(','),
          );
        });
      }
    }

    const csv = '\uFEFF' + rows.join('\n'); // BOM付きでExcel対応
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machoup-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (confirm('全てのデータを初期化します。よろしいですか?')) {
      dispatch({ type: 'RESET' });
    }
  };

  const totalSets = state.logs.reduce(
    (sum, l) => sum + l.exercises.reduce((s, e) => s + e.setLogs.length, 0),
    0,
  );

  // 総重量: 完了済みセットの (重量 × レップ) を全て合算 (kg)
  const totalVolume = state.logs.reduce(
    (sum, l) =>
      sum +
      l.exercises.reduce(
        (s, e) =>
          s +
          e.setLogs
            .filter((st) => st.completed)
            .reduce((ss, st) => ss + st.weight * st.reps, 0),
        0,
      ),
    0,
  );

  /** 表示上限 (999,999,999,999 = 12桁) */
  const MAX_DISPLAY = 999_999_999_999;

  // 大きな数値は t / k 単位で省略表示。上限超過時は "MAX+ kg"
  const formatVolume = (kg: number): string => {
    if (kg > MAX_DISPLAY) return `${MAX_DISPLAY.toLocaleString()}+ kg`;
    if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(2)} Mt`;
    if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
    return `${kg.toLocaleString()} kg`;
  };

  /** kg を {基準kg} あたりの個数表示に変換。上限超過時は "MAX+ 個分" */
  const formatRatio = (kg: number, unitKg: number): string => {
    if (kg === 0) return '0 個分';
    const ratio = kg / unitKg;
    if (ratio > MAX_DISPLAY) return `${MAX_DISPLAY.toLocaleString()}+ 個分`;
    if (ratio < 0.01) return '0.01 個未満';
    if (ratio < 100) return `${ratio.toFixed(2)} 個分`;
    return `${Math.round(ratio).toLocaleString()} 個分`;
  };
  // 換算対象 (重い順)
  const COMPARISONS: { name: string; emoji: string; kg: number; unit: string; color: string }[] = [
    { name: '自由の女神', emoji: '🗽', kg: 225_000, unit: '225t/個', color: 'text-amber-300/90' },
    { name: 'モアイ象', emoji: '🗿', kg: 50_000, unit: '50t/個', color: 'text-emerald-300/90' },
    { name: 'スクールバス', emoji: '🚌', kg: 10_000, unit: '10t/個', color: 'text-yellow-300/90' },
    { name: 'グランドピアノ', emoji: '🎹', kg: 500, unit: '500kg/個', color: 'text-violet-300/90' },
    { name: 'ダイオウイカ', emoji: '🦑', kg: 200, unit: '200kg/個', color: 'text-sky-300/90' },
    { name: 'パンダ', emoji: '🐼', kg: 100, unit: '100kg/個', color: 'text-fuchsia-300/90' },
  ];

  const setTheme = (t: Theme) => dispatch({ type: 'SET_THEME', theme: t });

  return (
    <div className="space-y-4">
      {/* テーマ */}
      <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <div className="text-xs text-neutral-400 uppercase mb-3">テーマ</div>
        <div className="grid grid-cols-2 gap-2">
          <ThemeOption
            label="ダーク"
            sublabel="少し青みのある黒"
            icon={Moon}
            active={state.user.theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
          <ThemeOption
            label="ライト"
            sublabel="白ベース"
            icon={Sun}
            active={state.user.theme === 'light'}
            onClick={() => setTheme('light')}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <div className="text-xs text-neutral-400 uppercase mb-3">ステータス</div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="現在サイクル" value={CYCLE_LABELS[state.user.currentCycle]} />
          <Stat label="総ログ数" value={`${state.logs.length} 日`} />
          <Stat label="総セット数" value={`${totalSets} set`} />
          <Stat label="登録種目" value={`${state.exercises.length} 種目`} />
          <div className="col-span-2">
            <dt className="text-[10px] text-neutral-500 uppercase">総重量</dt>
            <dd className="font-semibold font-mono text-base">
              {formatVolume(totalVolume)}
            </dd>
            {COMPARISONS.map((c, i) => (
              <dd
                key={c.name}
                className={`text-[11px] ${c.color} ${
                  i === 0 ? 'mt-1' : 'mt-0.5'
                } flex items-center gap-1`}
              >
                <span>{c.emoji}</span>
                <span>
                  {c.name} 約 {formatRatio(totalVolume, c.kg)}
                </span>
                <span className="text-neutral-500">({c.unit})</span>
              </dd>
            ))}
          </div>
        </dl>
      </section>

      <section className="space-y-2">
        <button
          type="button"
          onClick={exportCSV}
          className="w-full h-14 rounded-xl bg-amber-500 text-neutral-950 font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Download size={18} /> ログを CSV でエクスポート
        </button>

        <button
          type="button"
          onClick={reset}
          className="w-full h-12 rounded-xl bg-neutral-900 border border-red-900/60 text-red-400 font-semibold flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} /> 全データを初期化
        </button>
      </section>

      {/* アカウント */}
      <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <div className="text-xs text-neutral-400 uppercase mb-2">アカウント</div>
        <div className="text-sm font-mono text-neutral-300 mb-3 truncate">
          {user?.email ?? '—'}
        </div>
        <button
          type="button"
          onClick={async () => {
            if (confirm('ログアウトしますか?')) await signOut();
          }}
          className="w-full h-11 rounded-xl bg-neutral-800 text-neutral-200 font-semibold flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> ログアウト
        </button>
      </section>

      <section className="text-[11px] text-neutral-500 text-center">
        macho up · v0.2.0 · データは Supabase に保存されデバイス間で同期されます
      </section>
    </div>
  );
}

function ThemeOption({
  label,
  sublabel,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  sublabel: string;
  icon: typeof Moon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-colors ${
        active
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800/60'
      }`}
    >
      <span
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          active ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
        }`}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className="block text-[10px] text-neutral-400">{sublabel}</span>
      </span>
    </button>
  );
}

function Stat({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'col-span-2' : undefined}>
      <dt className="text-[10px] text-neutral-500 uppercase">{label}</dt>
      <dd className="font-semibold font-mono">{value}</dd>
    </div>
  );
}

function csvCell(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
