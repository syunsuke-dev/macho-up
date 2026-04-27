import type { ReactNode } from 'react';
import { BottomNav, type TabKey } from './BottomNav';

interface Props {
  active: TabKey;
  onChangeTab: (k: TabKey) => void;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}

/**
 * モバイル専用レイアウト:
 *   - max-w-md で固定幅 (タブレット以上でも中央寄せ)
 *   - 上部固定ヘッダー / 下部固定 BottomNav
 *   - スクロールは中央 main のみ
 */
export function MobileLayout({ active, onChangeTab, title, right, children }: Props) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        <header
          className="sticky top-0 z-20 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-3 h-14 flex items-center justify-between"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/macho-up-logo.png"
              alt="macho up"
              className="w-9 h-9 object-contain flex-shrink-0 rounded-md"
            />
            <span className="text-sm font-semibold text-neutral-300 truncate">
              {title}
            </span>
          </div>
          <div>{right}</div>
        </header>

        <main className="flex-1 pb-24 px-4 py-4">{children}</main>

        <BottomNav active={active} onChange={onChangeTab} />
      </div>
    </div>
  );
}
