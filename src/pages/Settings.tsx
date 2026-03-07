import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Brain, Database, Shield, Settings as SettingsIcon, AlertTriangle, Check, Loader2, Download } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { getKnowledgeGraph, clearUserData } from '@/lib/api';

const PREFS_KEY = 'neuroweave_settings';

interface Preferences {
  dailyReminders: boolean;
  autoStudyPlans: boolean;
  smartConnections: boolean;
  studyDuration: string;
  decayAlerts: boolean;
  aiInsights: boolean;
  weeklyReport: boolean;
}

const defaultPrefs: Preferences = {
  dailyReminders: true,
  autoStudyPlans: true,
  smartConnections: true,
  studyDuration: '30 minutes',
  decayAlerts: true,
  aiInsights: true,
  weeklyReport: false,
};

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export function Settings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const togglePref = useCallback((key: keyof Preferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
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
    } catch { /* ignore */ }
    setClearing(false);
  };

  const joined = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '--';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-[#8B92A8]">Configure your Neuroweave experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#4F8CFF]" />
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8B92A8] mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8B92A8] mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white/60 focus:outline-none cursor-not-allowed"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
              </motion.button>
            </div>
          </motion.div>

          {/* Learning Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#7A5CFF]" />
              Learning Preferences
            </h2>
            <div className="space-y-4">
              <ToggleRow label="Daily Review Reminders" description="Get notified about pending reviews" checked={prefs.dailyReminders} onChange={() => togglePref('dailyReminders')} />
              <ToggleRow label="Auto-generate Study Plans" description="AI creates weekly schedules automatically" checked={prefs.autoStudyPlans} onChange={() => togglePref('autoStudyPlans')} />
              <ToggleRow label="Smart Concept Connections" description="Automatically link related concepts" checked={prefs.smartConnections} onChange={() => togglePref('smartConnections')} />

              <div>
                <label className="block text-sm text-[#8B92A8] mb-2">Preferred Study Duration</label>
                <select
                  value={prefs.studyDuration}
                  onChange={e => setPrefs(prev => ({ ...prev, studyDuration: e.target.value }))}
                  className="w-full bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#4F8CFF] appearance-none"
                >
                  <option className="bg-[#131824] text-white">15 minutes</option>
                  <option className="bg-[#131824] text-white">30 minutes</option>
                  <option className="bg-[#131824] text-white">45 minutes</option>
                  <option className="bg-[#131824] text-white">60 minutes</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00E5FF]" />
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
            transition={{ delay: 0.3 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00FFA3]" />
              Data & Privacy
            </h2>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-[rgba(79,140,255,0.1)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4 text-left hover:border-[rgba(79,140,255,0.4)] transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Export Knowledge Graph</p>
                    <p className="text-sm text-[#8B92A8]">{exporting ? 'Downloading...' : 'Download all your data as JSON'}</p>
                  </div>
                  {exporting ? <Loader2 className="w-5 h-5 text-[#4F8CFF] animate-spin" /> : <Download className="w-5 h-5 text-[#4F8CFF]" />}
                </div>
              </motion.button>

              {showClearConfirm ? (
                <div className="bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.3)] rounded-lg p-4 space-y-3">
                  <p className="text-[#FF4D6D] font-semibold">Are you sure?</p>
                  <p className="text-sm text-[#8B92A8]">This will reset all local preferences. Your uploaded knowledge in the database is not affected.</p>
                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearData}
                      disabled={clearing}
                      className="px-4 py-2 bg-[#FF4D6D] text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      {clearing ? 'Clearing...' : 'Yes, Clear'}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 bg-[rgba(79,140,255,0.1)] text-white rounded-lg text-sm border border-[rgba(79,140,255,0.2)]"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.2)] rounded-lg p-4 text-left hover:border-[rgba(255,77,109,0.4)] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#FF4D6D]">Clear All Data</p>
                      <p className="text-sm text-[#8B92A8]">Reset all preferences</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-[#FF4D6D]" />
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
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[rgba(79,140,255,0.1)] to-[rgba(122,92,255,0.1)] border border-[rgba(79,140,255,0.3)] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[rgba(79,140,255,0.2)] rounded-lg">
                <SettingsIcon className="w-6 h-6 text-[#4F8CFF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Account Info</h3>
                <p className="text-sm text-[#8B92A8]">v1.0.0</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#8B92A8]">Provider</span>
                <span className="text-white">{user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B92A8]">Joined</span>
                <span className="text-white">{joined}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B92A8]">UID</span>
                <span className="text-white font-mono text-xs truncate max-w-[140px]" title={user?.uid}>{user?.uid?.slice(0, 12)}...</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-3">About Neuroweave</h3>
            <p className="text-sm text-[#8B92A8] leading-relaxed mb-4">
              An AI-powered cognitive learning system that models knowledge as a network of interconnected concepts.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-[#8B92A8]">Built with React, FastAPI, and Groq AI</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white">{label}</p>
        <p className="text-sm text-[#8B92A8]">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-[rgba(79,140,255,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4F8CFF] peer-checked:to-[#7A5CFF]"></div>
      </label>
    </div>
  );
}
