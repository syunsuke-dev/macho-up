import type { PersistedState } from '../types';

const KEY = 'machoup:v1';

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}

/**
 * UUID v4 を生成。Supabase の uuid 型カラムにそのまま入れられる。
 * crypto.randomUUID は 2021 以降の主要ブラウザでサポート済み。
 */
export function uid(): string {
  return crypto.randomUUID();
}
