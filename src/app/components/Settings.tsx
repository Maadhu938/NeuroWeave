import { motion } from 'motion/react';
import { User, Bell, Brain, Palette, Database, Shield, Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#8B92A8]">Configure your Neuroweave experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#4F8CFF]" />
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8B92A8] mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue="Neural Explorer"
                  className="w-full bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8B92A8] mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="user@neuroweave.ai"
                  className="w-full bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Daily Review Reminders</p>
                  <p className="text-sm text-[#8B92A8]">Get notified about pending reviews</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[rgba(79,140,255,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4F8CFF] peer-checked:to-[#7A5CFF]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Auto-generate Study Plans</p>
                  <p className="text-sm text-[#8B92A8]">AI creates weekly schedules automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[rgba(79,140,255,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4F8CFF] peer-checked:to-[#7A5CFF]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Smart Concept Connections</p>
                  <p className="text-sm text-[#8B92A8]">Automatically link related concepts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[rgba(79,140,255,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4F8CFF] peer-checked:to-[#7A5CFF]"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm text-[#8B92A8] mb-2">Preferred Study Duration</label>
                <select className="w-full bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#4F8CFF]">
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
            transition={{ delay: 0.2 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00E5FF]" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Knowledge Decay Alerts</p>
                  <p className="text-sm text-[#8B92A8]">Notify when concepts need review</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[rgba(79,140,255,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4F8CFF] peer-checked:to-[#7A5CFF]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">AI Insights</p>
                  <p className="text-sm text-[#8B92A8]">Receive personalized learning insights</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[rgba(79,140,255,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4F8CFF] peer-checked:to-[#7A5CFF]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Weekly Progress Report</p>
                  <p className="text-sm text-[#8B92A8]">Summary of your learning activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[rgba(79,140,255,0.2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4F8CFF] peer-checked:to-[#7A5CFF]"></div>
                </label>
              </div>
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
                className="w-full bg-[rgba(79,140,255,0.1)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4 text-left hover:border-[rgba(79,140,255,0.4)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Export Knowledge Graph</p>
                    <p className="text-sm text-[#8B92A8]">Download all your data as JSON</p>
                  </div>
                  <Database className="w-5 h-5 text-[#4F8CFF]" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.2)] rounded-lg p-4 text-left hover:border-[rgba(255,77,109,0.4)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#FF4D6D]">Clear All Data</p>
                    <p className="text-sm text-[#8B92A8]">Permanently delete your knowledge base</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-[#FF4D6D]" />
                </div>
              </motion.button>
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
                <h3 className="text-white font-semibold">System Info</h3>
                <p className="text-sm text-[#8B92A8]">Version 1.0.0</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#8B92A8]">Neural Engine</span>
                <span className="text-white">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B92A8]">Last Sync</span>
                <span className="text-white">2 min ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B92A8]">Storage Used</span>
                <span className="text-white">2.3 GB</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4">Appearance</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[#8B92A8] mb-2">Theme</label>
                <select className="w-full bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#4F8CFF]">
                  <option>Neural Dark (Default)</option>
                  <option>Cyber Blue</option>
                  <option>Neon Purple</option>
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg bg-gradient-to-br from-[#4F8CFF] to-[#0B0F1A] border-2 border-[#4F8CFF] cursor-pointer"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg bg-gradient-to-br from-[#7A5CFF] to-[#0B0F1A] border-2 border-transparent hover:border-[#7A5CFF] cursor-pointer"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#0B0F1A] border-2 border-transparent hover:border-[#00E5FF] cursor-pointer"
                />
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
              <a href="#" className="block text-[#4F8CFF] hover:underline">Documentation</a>
              <a href="#" className="block text-[#4F8CFF] hover:underline">Privacy Policy</a>
              <a href="#" className="block text-[#4F8CFF] hover:underline">Terms of Service</a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';
