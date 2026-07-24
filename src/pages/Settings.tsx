import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { getKnowledgeGraph, clearUserData, getUserSettings, updateUserSettings, type UserPreferences } from '@/lib/api';
import { LottieIcon } from '@/components/AnimatedIcons';
import {
  loadCookiePreferences,
  saveCookiePreferences,
  type CookiePreferences,
  type ConsentChoice,
} from '@/hooks/useCookieConsent';

const PREFS_KEY = 'neuroweave_settings';
const THEME_KEY = 'neuroweave_theme';

type Theme = 'light' | 'dark' | 'system';

const defaultPrefs: UserPreferences = {
  dailyReminders: true,
  autoStudyPlans: true,
  smartConnections: true,
  studyDuration: '30 minutes',
  decayAlerts: true,
  aiInsights: true,
  weeklyReport: false,
};

function loadPrefs(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

export function Settings({ onNavigate }: { onNavigate?: (page: string) => void } = {}) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [prefs, setPrefs] = useState<UserPreferences>(loadPrefs);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const hydratedFromServerRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  useEffect(() => {
    getUserSettings()
      .then((serverPrefs) => {
        const merged = { ...defaultPrefs, ...serverPrefs };
        setPrefs(merged);
        localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
        hydratedFromServerRef.current = true;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    window.dispatchEvent(new Event('neuroweave:themeChanged'));
  }, [theme]);

  useEffect(() => {
    if (!hydratedFromServerRef.current) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    saveTimerRef.current = window.setTimeout(() => {
      updateUserSettings(prefs).catch(() => {});
    }, 600);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [prefs]);

  const togglePref = useCallback((key: keyof UserPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(user, { displayName: displayName.trim() || null });
      localStorage.setItem('neuroweave_display_name', displayName.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const graph = await getKnowledgeGraph();
      const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuroweave-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setExporting(false);
  };

  const handleClearData = async () => {
    setClearing(true);
    try {
      await clearUserData();
      localStorage.removeItem(PREFS_KEY);
      setPrefs(defaultPrefs);
      setShowClearConfirm(false);
      window.dispatchEvent(new Event('neuroweave:dataCleared'));
    } catch { /* ignore */ }
    setClearing(false);
  };

  const joined = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '--';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your Neuroweave experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-xl p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="monitor" size={20} />
              </div>
              Appearance
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <ThemeButton
                active={theme === 'light'}
                onClick={() => setTheme('light')}
                icon="sun"
                label="Light"
              />
              <ThemeButton
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
                icon="moon"
                label="Dark"
              />
              <ThemeButton
                active={theme === 'system'}
                onClick={() => setTheme('system')}
                icon="monitor"
                label="System"
              />
            </div>
          </motion.div>

          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="user" size={20} />
              </div>
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
                    <LottieIcon name="user" size={16} />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-muted border border-border rounded-lg p-3 pl-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
                    <LottieIcon name="mail" size={16} />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full bg-muted border border-border rounded-lg p-3 pl-10 text-muted-foreground focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4">
                    <LottieIcon name="loading" size={16} />
                  </div>
                ) : saved ? (
                  <div className="w-4 h-4">
                    <LottieIcon name="check" size={16} />
                  </div>
                ) : null}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
              </motion.button>
            </div>
          </motion.div>

          {/* Learning Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="brain" size={20} />
              </div>
              Learning Preferences
            </h2>
            <div className="space-y-4">
              <ToggleRow label="Daily Review Reminders" description="Get notified about pending reviews" checked={prefs.dailyReminders} onChange={() => togglePref('dailyReminders')} />
              <ToggleRow label="Auto-generate Study Plans" description="AI creates weekly schedules automatically" checked={prefs.autoStudyPlans} onChange={() => togglePref('autoStudyPlans')} />
              <ToggleRow label="Smart Concept Connections" description="Automatically link related concepts" checked={prefs.smartConnections} onChange={() => togglePref('smartConnections')} />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preferred Study Duration</label>
                <select
                  value={prefs.studyDuration}
                  onChange={e => setPrefs(prev => ({ ...prev, studyDuration: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                >
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="bell" size={20} />
              </div>
              Notifications
            </h2>
            <div className="space-y-4">
              <ToggleRow label="Knowledge Decay Alerts" description="Notify when concepts need review" checked={prefs.decayAlerts} onChange={() => togglePref('decayAlerts')} />
              <ToggleRow label="AI Insights" description="Receive personalized learning insights" checked={prefs.aiInsights} onChange={() => togglePref('aiInsights')} />
              <ToggleRow label="Weekly Progress Report" description="Summary of your learning activity" checked={prefs.weeklyReport} onChange={() => togglePref('weeklyReport')} />
            </div>
          </motion.div>

          {/* Data & Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="shield" size={20} />
              </div>
              Data & Privacy
            </h2>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-muted border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">Export Knowledge Graph</p>
                    <p className="text-sm text-muted-foreground">{exporting ? 'Downloading...' : 'Download all your data as JSON'}</p>
                  </div>
                  {exporting ? (
                    <div className="w-5 h-5">
                      <LottieIcon name="loading" size={20} />
                    </div>
                  ) : (
                    <div className="w-5 h-5">
                      <LottieIcon name="download" size={20} />
                    </div>
                  )}
                </div>
              </motion.button>

              {showClearConfirm ? (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3">
                  <p className="text-destructive font-semibold">Are you sure?</p>
                  <p className="text-sm text-muted-foreground">This will reset all local preferences. Your uploaded knowledge in the database is not affected.</p>
                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearData}
                      disabled={clearing}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    >
                      {clearing ? 'Clearing...' : 'Yes, Clear'}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium border border-border hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left hover:border-destructive/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-destructive font-medium">Clear All Data</p>
                      <p className="text-sm text-muted-foreground">Reset all preferences</p>
                    </div>
                    <div className="w-5 h-5">
                      <LottieIcon name="alert" size={20} />
                    </div>
                  </div>
                </motion.button>
              )}

              {onNavigate && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onNavigate('privacy')}
                  className="w-full bg-muted border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">Privacy Policy</p>
                      <p className="text-sm text-muted-foreground">View our privacy policy and cookie settings</p>
                    </div>
                    <div className="w-5 h-5">
                      <LottieIcon name="shield" size={20} />
                    </div>
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <div className="w-6 h-6">
                  <LottieIcon name="settings" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Account Info</h3>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="text-foreground font-medium">{user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span className="text-foreground font-medium">{joined}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">UID</span>
                <span className="text-foreground font-mono text-xs truncate max-w-[140px]" title={user?.uid}>{user?.uid?.slice(0, 12)}...</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-foreground font-semibold mb-3">About Neuroweave</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              An AI-powered cognitive learning system that models knowledge as a network of interconnected concepts.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Built with React, FastAPI, and Groq AI</p>
            </div>
          </motion.div>
        </div>

        {/* Cookie Preferences */}
        <CookiePreferencesSection />
      </div>
    </div>
  );
}

function CookiePreferencesSection() {
  const [prefs, setPrefs] = useState<CookiePreferences>(() => {
    try {
      const stored = loadCookiePreferences();
      return stored
        ? { essential: stored.essential, analytics: stored.analytics, preferences: stored.preferences }
        : { essential: true, analytics: false, preferences: false };
    } catch {
      return { essential: true, analytics: false, preferences: false };
    }
  });

  const handleSave = () => {
    saveCookiePreferences(prefs, 'custom');
  };

  const handleReset = () => {
    setPrefs({ essential: true, analytics: false, preferences: false });
    saveCookiePreferences({ essential: true, analytics: false, preferences: false }, 'essential');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-xl p-5 md:p-6"
    >
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <div className="w-5 h-5">
          <LottieIcon name="shield" size={20} />
        </div>
        Cookie Preferences
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Essential cookies are always enabled. Manage optional categories below.
      </p>
      <div className="space-y-4">
        <ToggleRow label="Essential" description="Authentication, security, and core app functionality." checked={prefs.essential} onChange={() => {}} disabled />
        <ToggleRow label="Preferences" description="Remembers your theme, sidebar state, and settings." checked={prefs.preferences} onChange={(checked) => setPrefs((prev) => ({ ...prev, preferences: checked }))} />
        <ToggleRow label="Analytics" description="Helps us understand usage and improve the learning experience." checked={prefs.analytics} onChange={(checked) => setPrefs((prev) => ({ ...prev, analytics: checked }))} />
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Reject Non-Essential
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPrefs({ essential: true, analytics: true, preferences: true })}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25"
        >
          Accept All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25"
        >
          Save Preferences
        </motion.button>
      </div>
    </motion.div>
  );
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
        active 
          ? 'bg-primary/10 border-primary text-primary' 
          : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
      }`}
    >
      <div className="w-5 h-5">
        <LottieIcon name={icon as any} size={20} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={() => onChange(!checked)} disabled={disabled} />
        <div className={`w-11 h-6 ${disabled ? 'bg-muted' : 'peer-focus:outline-none'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border`}></div>
      </label>
    </div>
  );
}
