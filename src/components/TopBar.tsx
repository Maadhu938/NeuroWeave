import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getTopBarMetrics, getNotifications, type NotificationItem } from '@/lib/api';
import { Bell, BrainCircuit, CalendarCheck, Menu, Moon, Search, Sun, TrendingUp, Zap } from 'lucide-react';

interface TopBarProps {
  onMenuToggle?: () => void;
  onNavigate?: (page: string) => void;
}

const THEME_KEY = 'neuroweave_theme';

export function TopBar({ onMenuToggle, onNavigate }: TopBarProps) {
  const [metrics, setMetrics] = useState({ knowledgeScore: '--', retentionRate: '--', studyStreak: '--' });
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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

  useEffect(() => {
    getNotifications()
      .then((data) => setNotifications(data.notifications))
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(next);
    setIsDark(next === 'dark');
    window.dispatchEvent(new Event('neuroweave:themeChanged'));
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onNavigate?.('brain-map');
    }
  };

  const priorityColor: Record<string, string> = {
    critical: 'bg-destructive',
    high: 'bg-warning',
    success: 'bg-success',
    info: 'bg-primary',
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
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
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
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-muted-foreground text-center">No notifications yet. Upload knowledge or complete reviews to see them here.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`h-2 w-2 rounded-full ${priorityColor[n.priority] || 'bg-muted-foreground'}`} />
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground pl-4">{n.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 pl-4">{n.time}</p>
                      </div>
                    ))
                  )}
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