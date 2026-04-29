import { Undo2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * リスケ操作直後に表示される元に戻すトースト。
 * AppProvider 内の undo state を読み、表示と操作を提供する。
 */
export function UndoToast() {
  const { undo, performUndo, dismissUndo } = useApp();
  if (!undo) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 pointer-events-none"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
      }}
      aria-live="polite"
    >
      <div className="pointer-events-auto bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl flex items-center gap-2 pl-4 pr-2 py-2">
        <span className="text-sm font-semibold text-neutral-100 flex-1 truncate">
          {undo.label}
        </span>
        <button
          type="button"
          onClick={performUndo}
          className="flex items-center gap-1 h-9 px-3 rounded-lg bg-amber-500 text-neutral-950 text-xs font-bold active:scale-[0.98] transition"
        >
          <Undo2 size={14} />
          元に戻す
        </button>
        <button
          type="button"
          onClick={dismissUndo}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-800"
          aria-label="閉じる"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
