import { useState, type ReactNode } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface Props {
  title: string;
  body: ReactNode;
  /** ボタンに付与する追加クラス */
  className?: string;
  /** ボタンサイズ (default 14) */
  size?: number;
}

/**
 * 入力欄ラベル等の横に置く小さな ? アイコン。
 * タップでミニ説明モーダルを表示する。
 */
export function HelpIcon({ title, body, className = '', size = 14 }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex items-center justify-center text-neutral-500 hover:text-amber-300 transition-colors ${className}`}
        aria-label={`${title}の説明`}
      >
        <HelpCircle size={size} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-amber-300">{title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800"
                aria-label="閉じる"
              >
                <X size={14} />
              </button>
            </div>
            <div className="text-xs text-neutral-200 leading-relaxed space-y-1.5">
              {body}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full mt-3 h-9 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
