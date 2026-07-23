import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { BrainMap } from '@/pages/BrainMap';
import { UploadKnowledge } from '@/pages/UploadKnowledge';
import { Insights } from '@/pages/Insights';
import { StudyPlanner } from '@/pages/StudyPlanner';
import { AskYourBrain } from '@/pages/AskYourBrain';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';

const THEME_KEY = 'neuroweave_theme';
type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(dark ? 'dark' : 'light');
    return;
  }

  root.classList.add(theme);
}

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(user ? 'dashboard' : 'landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'system';
    applyTheme(storedTheme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      const nextTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'system';
      applyTheme(nextTheme);
    };

    media.addEventListener('change', handleThemeChange);
    window.addEventListener('neuroweave:themeChanged', handleThemeChange);

    return () => {
      media.removeEventListener('change', handleThemeChange);
      window.removeEventListener('neuroweave:themeChanged', handleThemeChange);
    };
  }, []);

  // When auth finishes loading, redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }, [user, loading, currentPage]);

  // Show loading spinner while Firebase checks auth state
  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] app-surface flex items-center justify-center">
        <div className="glass-panel-strong rounded-2xl px-8 py-7 flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" style={{ animationDuration: '0.8s' }} />
          </div>
          <span className="text-sm text-muted-foreground">Loading Neuroweave...</span>
        </div>
      </div>
    );
  }

  // Landing page — always accessible
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen min-h-[100dvh] app-surface">
        <LandingPage onGetStarted={() => {
          if (user) {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('login');
          }
        }} />
      </div>
    );
  }

  // Login page — if not authenticated
  if (currentPage === 'login' || (!user && currentPage !== 'landing')) {
    return (
      <div className="min-h-screen min-h-[100dvh] app-surface">
        <LoginPage onSuccess={() => setCurrentPage('dashboard')} />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'brain-map':
        return <BrainMap onNavigate={setCurrentPage} />;
      case 'upload':
        return <UploadKnowledge onNavigate={setCurrentPage} />;
      case 'insights':
        return <Insights />;
      case 'planner':
        return <StudyPlanner onNavigate={setCurrentPage} />;
      case 'ask':
        return <AskYourBrain />;
      case 'settings':
        return <Settings />;
      case '404':
        return <NotFound onNavigate={setCurrentPage} />;
      default:
        return <NotFound onNavigate={setCurrentPage} />;
    }
  };

  // Main app layout with sidebar and topbar (authenticated)
  return (
    <div className="min-h-screen min-h-[100dvh] app-surface">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopBar onMenuToggle={() => setSidebarOpen(prev => !prev)} onNavigate={setCurrentPage} />
      <main
        className="relative md:ml-72 p-4 md:p-6 xl:p-8"
        style={{ paddingTop: 'var(--topbar-height, 96px)' }}
      >
        {renderPage()}
      </main>
    </div>
  );
}

// Keep the main content clear of the fixed TopBar by measuring its height
// and exposing it as a CSS variable `--topbar-height` that `main` uses.
{ /* eslint-disable-next-line no-sequence */ }
if (typeof window !== 'undefined') {
  const updateTopbarHeight = () => {
    const el = document.querySelector('.nn-topbar') as HTMLElement | null;
    if (!el) return;
    const h = Math.ceil(el.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--topbar-height', `${h}px`);
  };

  window.addEventListener('resize', updateTopbarHeight);
  // initial call (defer so React mount has run)
  setTimeout(updateTopbarHeight, 0);
}
