import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getTopBarMetrics } from '@/lib/api';
import { Bell, BrainCircuit, CalendarCheck, Menu, Moon, Search, Sparkles, Sun, TrendingUp, Zap } from 'lucide-react';

interface TopBarProps {
  onMenuToggle?: () => void;
  onNavigate?: (page: string) => void;
}

const THEME_KEY = 'neuroweave_theme';

const NOTIFICATIONS = [
  { id: '1', title: 'Review cycle due', desc: '3 concepts need review today', time: '2m ago' },
  { id: '2', title: 'Study streak active', desc: 'You have a 5-day streak', time: '1h ago' },
  { id: '3', title: 'New insight available', desc: 'AI generated new recommendations', time: '3h ago' },
];

export function TopBar({ onMenuToggle, onNavigate }: TopBarProps) {
  const [metrics, setMetrics] = useState({ knowledgeScore: '--', retentionRate: '--', studyStreak: '--' });
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiBoosting, setAiBoosting] = useState(false);

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

  useEffect(() => {
    const refreshTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    refreshTheme();
    window.addEventListener('neuroweave:themeChanged', refreshTheme);
    return () => window.removeEventListener('neuroweave:themeChanged', refreshTheme);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(next);
    setIsDark(next === 'dark');
    window.dispatchEvent(new Event('neuroweave:themeChanged'));
  };

  const handleAiBoost = async () => {
    setAiBoosting(true);
    try {
      await getTopBarMetrics().then(setMetrics).catch(() => {});
    } finally {
      setTimeout(() => setAiBoosting(false), 500);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onNavigate?.('brain-map');
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="nn-topbar fixed top-0 left-0 md:left-72 right-0 z-40 px-4 pt-4 md:px-6"
    >
      <div className="glass-panel-strong flex h-14 md:h-16 items-center justify-between rounded-2xl px-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden min-w-0 items-center gap-3 sm:flex">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Learning Dashboard</p>
              <p className="text-xs text-muted-foreground">Memory, maps, reviews</p>
            </div>
          </div>

          <label className="hidden lg:flex h-10 w-[min(28vw,380px)] items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-muted-foreground">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="Search concepts..."
              onKeyDown={handleSearch}
            />
          </label>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <MetricChip icon={Zap} value={metrics.knowledgeScore} />
          <MetricChip icon={TrendingUp} value={metrics.retentionRate} className="hidden sm:flex" />
          <MetricChip icon={CalendarCheck} value={metrics.studyStreak} className="hidden xl:flex" />

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAiBoost}
            disabled={aiBoosting}
            className={`hidden md:flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${aiBoosting ? 'bg-success text-success-foreground shadow-lg shadow-success/25' : 'bg-primary text-primary-foreground shadow-lg shadow-sky-500/20'}`}
          >
            <Sparkles className="h-4 w-4" />
            {aiBoosting ? 'Boosting...' : 'AI Boost'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotifOpen(v => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
            </motion.button>

            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-12 w-80 glass-panel-strong border border-border rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                  <button onClick={() => setNotifOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function MetricChip({ icon: Icon, value, className = '' }: { icon: typeof Zap; value: string; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={`items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm font-semibold text-foreground ${className || 'flex'}`}
    >
      <Icon className="h-4 w-4 text-primary" />
      <span>{value}</span>
    </motion.div>
  );
}
