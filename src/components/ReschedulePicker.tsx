import { ChevronsRight, SkipForward } from 'lucide-react';

interface Props {
  fromDate: string;
  /** 対象日が現在オフ日 (前倒し方向) かどうか */
  isOffDay: boolean;
  onPickShiftAll: () => void;
  onPickSingleDay: () => void;
  onClose: () => void;
}

/**
 * リスケのモード選択ピッカー (ボトムシート)。
 * - トレーニング日 → 後ろへスライド (postpone)
 * - オフ日 → 前倒しスライド (pull-forward)
 */
export function ReschedulePicker({
  fromDate,
  isOffDay,
  onPickShiftAll,
  onPickSingleDay,
  onClose,
}: Props) {
  const allDesc = isOffDay
    ? '対象日以降の予定をすべて1日前倒しスライド (対象日のオフが無くなります)'
    : '対象日以降の予定をすべて1日後ろにスライド (オフ日構成は維持)';
  const singleDesc = isOffDay
    ? '対象日の次のトレーニング日を対象日に前倒し (他の予定はそのまま)'
    : '対象日の予定だけを次のオフ日に移動 (他の予定はそのまま)';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-neutral-900 border-t border-x border-neutral-800 rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="pt-2 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        <div className="px-4 pt-2 pb-3 border-b border-neutral-800">
          <div className="text-xs text-neutral-400">
            リスケ方法を選択
            {isOffDay && <span className="text-emerald-400 ml-1">(前倒し)</span>}
          </div>
          <div className="text-sm font-semibold mt-0.5">
            対象日: <span className="font-mono">{fromDate}</span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button
            type="button"
            onClick={onPickShiftAll}
            className="w-full text-left p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 active:scale-[0.99] transition flex items-start gap-3"
          >
            <span className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
              <ChevronsRight size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">全体をずらす</span>
              <span className="block text-[11px] text-neutral-400 mt-0.5">
                {allDesc}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onPickSingleDay}
            className="w-full text-left p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 active:scale-[0.99] transition flex items-start gap-3"
          >
            <span className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
              <SkipForward size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">その日のみずらす</span>
              <span className="block text-[11px] text-neutral-400 mt-0.5">
                {singleDesc}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center p-3 rounded-xl text-neutral-400 text-sm font-semibold hover:bg-neutral-800/60"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
