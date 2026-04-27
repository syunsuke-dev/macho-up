import { useState, type ReactNode } from 'react';
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

function AuthGate({
  children,
  openGuide,
}: {
  children: ReactNode;
  openGuide: () => void;
}) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xs text-neutral-400">起動中...</div>
      </div>
    );
  }
  if (!session) return <AuthScreen onShowGuide={openGuide} />;
  return <>{children}</>;
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
