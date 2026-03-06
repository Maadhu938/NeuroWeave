import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { BrainMap } from './components/BrainMap';
import { UploadKnowledge } from './components/UploadKnowledge';
import { Insights } from './components/Insights';
import { StudyPlanner } from './components/StudyPlanner';
import { AskYourBrain } from './components/AskYourBrain';
import { Settings } from './components/Settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'brain-map':
        return <BrainMap />;
      case 'upload':
        return <UploadKnowledge />;
      case 'insights':
        return <Insights />;
      case 'planner':
        return <StudyPlanner />;
      case 'ask':
        return <AskYourBrain />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Landing page has its own layout
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-[#0B0F1A]">
        {renderPage()}
      </div>
    );
  }

  // Main app layout with sidebar and topbar
  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <TopBar />
      <main className="ml-64 pt-16 p-6">
        {renderPage()}
      </main>
    </div>
  );
}
