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
 * 指定日のトレーニングを実施できなかった場合、その日以降の「すべての予定」を
 * 1日ずつ後ろへスライドさせる。オフ日の配置関係 (ルーティンとオフのセット) は維持する。
 *
 * 実装:
 *   1. fromDate より前の entries はそのまま残す (完了済み・過去はロック)。
 *   2. fromDate 以降の entries の date をすべて +1 日。
 *   3. できた空きの fromDate には「オフ日」を挿入 (既に done 済みの当日は触らない)。
 *
 * @param schedule 現在のスケジュール
 * @param fromDate スキップする日付 (yyyy-mm-dd)
 */
export function rescheduleFrom(
  schedule: Schedule,
  fromDate: string,
): Schedule {
  const before = schedule.entries.filter((e) => e.date < fromDate);
  const after = schedule.entries.filter((e) => e.date >= fromDate);

  // fromDate の既存エントリがあれば「スキップ扱い」にしてオフ日として残す
  // そして実施予定だったルーティンは翌日以降へ押し出す
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
 * 「その日のみ」リスケ。
 * 指定日のルーティンを次の最も近いオフ日へ移動し、その日はオフ日にする。
 * 後続のトレーニング予定日には影響しない。
 *
 * 次のオフ日が見つからない場合は rescheduleFrom にフォールバック。
 */
export function rescheduleSingleDay(
  schedule: Schedule,
  fromDate: string,
): Schedule {
  const idx = schedule.entries.findIndex((e) => e.date === fromDate);
  if (idx < 0) return schedule;
  const target = schedule.entries[idx];
  if (target.routineId == null) return schedule; // 元々オフ日

  // 同日以降の最初のオフ日を探す
  const offIdx = schedule.entries.findIndex(
    (e, i) => i > idx && e.routineId == null,
  );
  if (offIdx < 0) {
    return rescheduleFrom(schedule, fromDate);
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
