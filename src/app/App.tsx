import { useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(user ? 'dashboard' : 'landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // When auth finishes loading, redirect logged-in users to dashboard
  const [authResolved, setAuthResolved] = useState(false);
  if (!authResolved && !loading) {
    setAuthResolved(true);
    if (user && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }

  // Show loading spinner while Firebase checks auth state
  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#4F8CFF]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#4F8CFF] animate-spin" style={{ animationDuration: '0.8s' }} />
          </div>
          <span className="text-sm text-[#8B92A8]">Loading Neuroweave...</span>
        </div>
      </div>
    );
  }

  // Landing page — always accessible
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#0B0F1A]">
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
      <div className="min-h-screen min-h-[100dvh] bg-[#0B0F1A]">
        <LoginPage onSuccess={() => setCurrentPage('dashboard')} />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard key={Date.now()} onNavigate={setCurrentPage} />;
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
      default:
        return <Dashboard key={Date.now()} onNavigate={setCurrentPage} />;
    }
  };

  // Main app layout with sidebar and topbar (authenticated)
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0B0F1A]">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopBar key={currentPage} onMenuToggle={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 pt-14 md:pt-16 p-4 md:p-6">
        {renderPage()}
      </main>
    </div>
  );
}
