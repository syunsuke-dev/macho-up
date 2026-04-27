import { useEffect, useState, type ReactNode } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileLayout } from './components/MobileLayout';
import type { TabKey } from './components/BottomNav';
import { AuthScreen } from './pages/AuthScreen';
import { HomePage } from './pages/Home';
import { PlanPage } from './pages/Plan';
import { CalendarPage } from './pages/Calendar';
import { LogPage } from './pages/Log';
import { ChartPage } from './pages/Chart';
import { SettingsPage } from './pages/Settings';
import { GuidePage } from './pages/GuidePage';

const TITLES: Record<TabKey, string> = {
  home: 'Home',
  plan: 'Plan',
  calendar: 'Schedule',
  log: 'Log',
  chart: 'Progress',
  settings: 'Settings',
};

export function App() {
  const [showGuide, setShowGuide] = useState(false);
  const openGuide = () => setShowGuide(true);
  const closeGuide = () => setShowGuide(false);

  return (
    <>
      <AuthProvider>
        <AuthGate openGuide={openGuide}>
          <AppProvider>
            <MainApp openGuide={openGuide} />
          </AppProvider>
        </AuthGate>
      </AuthProvider>
      {showGuide && <GuidePage onClose={closeGuide} />}
    </>
  );
}

/** ログイン済みユーザー向けのスプラッシュ最低表示時間 (ms) */
const SPLASH_MIN_MS = 2000;

function AuthGate({
  children,
  openGuide,
}: {
  children: ReactNode;
  openGuide: () => void;
}) {
  const { session, loading, isPasswordRecovery } = useAuth();
  const [splashHoldDone, setSplashHoldDone] = useState(false);

  // 認証ロード完了後、ログイン済みユーザーには SPLASH_MIN_MS のあいだロゴだけ見せる
  useEffect(() => {
    if (loading) return;
    if (!session || isPasswordRecovery) {
      // 未ログイン or リカバリ中はスプラッシュを延長しない
      setSplashHoldDone(true);
      return;
    }
    const t = setTimeout(() => setSplashHoldDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, [loading, session, isPasswordRecovery]);

  // 認証チェック中、またはログイン済みでまだスプラッシュ最低時間に達していない間
  if (loading || (session && !isPasswordRecovery && !splashHoldDone)) {
    return <SplashScreen />;
  }

  // パスワード再設定リンクから入った場合は、たとえセッションがあっても
  // 新パスワード設定画面 (AuthScreen の reset モード) を出す
  if (!session || isPasswordRecovery) {
    return <AuthScreen onShowGuide={openGuide} />;
  }
  return <>{children}</>;
}

function SplashScreen() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-6 px-6">
      <img
        src="/macho-up-logo.png"
        alt="macho up"
        className="w-72 h-72 max-w-[80vw] max-h-[80vw] object-contain animate-pulse"
      />
      <div className="flex items-center gap-3 text-neutral-300">
        <span
          className="inline-block w-6 h-6 rounded-full border-[3px] border-neutral-700 border-t-amber-400 animate-spin"
          aria-hidden="true"
        />
        <span className="text-base font-semibold tracking-wide">Loading...</span>
      </div>
    </div>
  );
}

function MainApp({ openGuide }: { openGuide: () => void }) {
  const [tab, setTab] = useState<TabKey>('home');
  return (
    <MobileLayout active={tab} onChangeTab={setTab} title={TITLES[tab]}>
      {tab === 'home' && <HomePage onGoLog={() => setTab('log')} />}
      {tab === 'plan' && <PlanPage onShowGuide={openGuide} />}
      {tab === 'calendar' && <CalendarPage />}
      {tab === 'log' && <LogPage />}
      {tab === 'chart' && <ChartPage />}
      {tab === 'settings' && <SettingsPage onShowGuide={openGuide} />}
    </MobileLayout>
  );
}
