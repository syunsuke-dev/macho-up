import {
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Home,
  LineChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type TabKey = 'home' | 'plan' | 'calendar' | 'log' | 'chart' | 'settings';

interface NavItem {
  key: TabKey;
  label: string;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { key: 'home', label: 'ホーム', icon: Home },
  { key: 'plan', label: 'プラン', icon: Dumbbell },
  { key: 'calendar', label: '予定', icon: CalendarDays },
  { key: 'log', label: 'ログ', icon: ClipboardList },
  { key: 'chart', label: 'グラフ', icon: LineChart },
  { key: 'settings', label: '設定', icon: Settings },
];

interface Props {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-neutral-900/95 backdrop-blur border-t border-neutral-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-6 max-w-md mx-auto">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange(key)}
                className={`w-full h-16 flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={22} className={isActive ? 'stroke-[2.5]' : ''} />
                <span className="text-[10px] font-medium tracking-wide">
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
