import type { Schedule, ScheduleEntry } from '../types';

// ===== Date helpers (ローカルタイム、yyyy-mm-dd 文字列で扱う) =====

/** Date → 'yyyy-mm-dd' (ローカル時刻) */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 'yyyy-mm-dd' → Date (ローカル00:00) */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 日数加算 */
export function addDays(isoDate: string, days: number): string {
  const d = fromISODate(isoDate);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** 今日の ISO 日付 */
export function todayISO(): string {
  return toISODate(new Date());
}

// ===== Schedule generation =====

/**
 * rotation + offDays に基づきスケジュールを生成。
 *
 * ルール:
 *   Day0: rotation[0] 実施
 *   +offDays[0] 日オフ
 *   次: rotation[1] 実施
 *   ... ループ
 *
 * @param days 何日分生成するか (デフォルト 60)
 */
export function generateSchedule(
  rotation: string[],
  offDays: number[],
  startDate: string,
  days = 60,
): ScheduleEntry[] {
  if (rotation.length === 0) return [];
  if (rotation.length !== offDays.length) {
    throw new Error('rotation と offDays の長さが一致しません');
  }

  const entries: ScheduleEntry[] = [];
  let cursor = startDate;
  let idx = 0;
  const end = addDays(startDate, days);

  while (cursor < end) {
    // トレーニング日
    entries.push({
      date: cursor,
      routineId: rotation[idx],
      done: false,
    });
    cursor = addDays(cursor, 1);

    // オフ日
    const off = offDays[idx];
    for (let i = 0; i < off && cursor < end; i++) {
      entries.push({ date: cursor, routineId: null, done: false });
      cursor = addDays(cursor, 1);
    }

    idx = (idx + 1) % rotation.length;
  }

  return entries;
}

// ===== Reschedule (スライド) =====

/**
 * 全体ずらす【後ろへ】: 指定日 (トレーニング日想定) 以降を 1 日ずつ後ろへスライド。
 * fromDate の位置にはオフ日が挿入される。
 */
function postponeFrom(schedule: Schedule, fromDate: string): Schedule {
  const before = schedule.entries.filter((e) => e.date < fromDate);
  const after = schedule.entries.filter((e) => e.date >= fromDate);

  const slid: ScheduleEntry[] = after.map((e) => ({
    ...e,
    date: addDays(e.date, 1),
  }));

  const skippedDay: ScheduleEntry = {
    date: fromDate,
    routineId: null,
    done: false,
  };

  return {
    ...schedule,
    entries: [...before, skippedDay, ...slid].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  };
}

/**
 * 全体ずらす【前へ】: 指定日 (オフ日想定) 以降の予定を 1 日ずつ前にスライド。
 * fromDate の位置の「オフ日」は消え、翌日以降のトレーニングが繰り上がる。
 */
function pullForwardFrom(schedule: Schedule, fromDate: string): Schedule {
  const before = schedule.entries.filter((e) => e.date < fromDate);
  const after = schedule.entries.filter((e) => e.date > fromDate);

  const slid: ScheduleEntry[] = after.map((e) => ({
    ...e,
    date: addDays(e.date, -1),
  }));

  return {
    ...schedule,
    entries: [...before, ...slid].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  };
}

/**
 * 全体ずらす: 当日が「トレーニング日」なら後ろへ、「オフ日」なら前倒し。
 */
export function rescheduleFrom(
  schedule: Schedule,
  fromDate: string,
): Schedule {
  const entry = schedule.entries.find((e) => e.date === fromDate);
  if (!entry) {
    // エントリ自体が無い (=過去にスキップした未来) 場合は postpone 動作で挿入
    return postponeFrom(schedule, fromDate);
  }
  return entry.routineId == null
    ? pullForwardFrom(schedule, fromDate)
    : postponeFrom(schedule, fromDate);
}

/**
 * その日のみ【トレーニング → 次のオフへ移す】
 */
function swapToNextOff(schedule: Schedule, fromDate: string): Schedule {
  const idx = schedule.entries.findIndex((e) => e.date === fromDate);
  if (idx < 0) return schedule;
  const target = schedule.entries[idx];
  if (target.routineId == null) return schedule;

  const offIdx = schedule.entries.findIndex(
    (e, i) => i > idx && e.routineId == null,
  );
  if (offIdx < 0) {
    return postponeFrom(schedule, fromDate);
  }

  const movedRoutineId = target.routineId;
  const entries = schedule.entries.map((e, i) => {
    if (i === idx) return { ...e, routineId: null, done: false };
    if (i === offIdx) return { ...e, routineId: movedRoutineId, done: false };
    return e;
  });
  return { ...schedule, entries };
}

/**
 * その日のみ【次のトレーニング → 今日に前倒し】
 */
function pullForwardSingleDay(schedule: Schedule, fromDate: string): Schedule {
  const idx = schedule.entries.findIndex((e) => e.date === fromDate);
  if (idx < 0) return schedule;
  const target = schedule.entries[idx];
  if (target.routineId != null) return schedule; // 既にトレーニング日なので何もしない

  const trainIdx = schedule.entries.findIndex(
    (e, i) => i > idx && e.routineId != null,
  );
  if (trainIdx < 0) return schedule; // これ以上のトレーニングが無い

  const movedRoutineId = schedule.entries[trainIdx].routineId;
  const entries = schedule.entries.map((e, i) => {
    if (i === idx)
      return { ...e, routineId: movedRoutineId, done: false };
    if (i === trainIdx) return { ...e, routineId: null, done: false };
    return e;
  });
  return { ...schedule, entries };
}

/**
 * その日のみ: 当日の状態によって入替方向が変わる。
 * - トレーニング日 → 次のオフ日へ移す
 * - オフ日 → 次のトレーニング日を今日に前倒し
 */
export function rescheduleSingleDay(
  schedule: Schedule,
  fromDate: string,
): Schedule {
  const entry = schedule.entries.find((e) => e.date === fromDate);
  if (!entry) return schedule;
  return entry.routineId == null
    ? pullForwardSingleDay(schedule, fromDate)
    : swapToNextOff(schedule, fromDate);
}

/**
 * 指定日のエントリを取得 (存在しない場合 undefined)
 */
export function getEntryByDate(
  schedule: Schedule | null,
  date: string,
): ScheduleEntry | undefined {
  return schedule?.entries.find((e) => e.date === date);
}

/**
 * 今日から n 日間のエントリを取得 (週次表示用)
 */
export function getUpcomingEntries(
  schedule: Schedule | null,
  fromDate: string,
  days = 7,
): ScheduleEntry[] {
  if (!schedule) return [];
  const end = addDays(fromDate, days);
  return schedule.entries.filter((e) => e.date >= fromDate && e.date < end);
}
