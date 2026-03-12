import { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Target, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { getTopBarMetrics } from '@/lib/api';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [metrics, setMetrics] = useState({ knowledgeScore: '--', retentionRate: '--', studyStreak: '--' });

  useEffect(() => {
    const fetchMetrics = () => {
      getTopBarMetrics()
        .then(setMetrics)
        .catch(() => { /* API not available yet */ });
    };

    fetchMetrics();

    const onDataCleared = () => {
      setMetrics({ knowledgeScore: '0%', retentionRate: '0%', studyStreak: '0 days' });
      fetchMetrics();
    };

    window.addEventListener('neuroweave:dataCleared', onDataCleared as EventListener);
    return () => window.removeEventListener('neuroweave:dataCleared', onDataCleared as EventListener);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="h-14 md:h-16 bg-[#0D1117] border-b border-[rgba(79,140,255,0.1)] flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 md:left-64 right-0 z-40"
    >
      <div className="flex items-center gap-3 md:gap-6">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-3 -ml-2 rounded-lg text-[#8B92A8] hover:text-white hover:bg-[rgba(79,140,255,0.1)] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#4F8CFF] hidden sm:block" />
          <span className="text-xs sm:text-sm text-[#E8EEF7] hidden sm:inline">Cognitive Intelligence System</span>
          <span className="text-xs text-[#E8EEF7] sm:hidden">Neuroweave</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 md:gap-2 bg-[rgba(79,140,255,0.1)] px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg border border-[rgba(79,140,255,0.2)]"
        >
          <Zap className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#FFB800]" />
          <div>
            <p className="text-[10px] md:text-xs text-[#8B92A8] hidden sm:block">Knowledge</p>
            <p className="text-xs md:text-sm font-semibold text-[#E8EEF7]">{metrics.knowledgeScore}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="hidden sm:flex items-center gap-2 bg-[rgba(122,92,255,0.1)] px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg border border-[rgba(122,92,255,0.2)]"
        >
          <TrendingUp className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#00FFA3]" />
          <div>
            <p className="text-[10px] md:text-xs text-[#8B92A8]">Retention</p>
            <p className="text-xs md:text-sm font-semibold text-[#E8EEF7]">{metrics.retentionRate}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="hidden md:flex items-center gap-2 bg-[rgba(0,229,255,0.1)] px-4 py-2 rounded-lg border border-[rgba(0,229,255,0.2)]"
        >
          <Target className="w-4 h-4 text-[#00E5FF]" />
          <div>
            <p className="text-xs text-[#8B92A8]">Study Streak</p>
            <p className="text-sm font-semibold text-[#E8EEF7]">{metrics.studyStreak}</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
