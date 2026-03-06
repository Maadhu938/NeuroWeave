import { Brain, LayoutDashboard, Network, Upload, TrendingUp, MessageSquare, Calendar, Settings, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'landing', icon: Sparkles, label: 'Welcome' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'brain-map', icon: Network, label: 'Brain Map' },
    { id: 'upload', icon: Upload, label: 'Upload Knowledge' },
    { id: 'insights', icon: TrendingUp, label: 'Insights' },
    { id: 'planner', icon: Calendar, label: 'Study Planner' },
    { id: 'ask', icon: MessageSquare, label: 'Ask Your Brain' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-[#0D1117] border-r border-[rgba(79,140,255,0.1)] flex flex-col fixed left-0 top-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(79,140,255,0.1)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-[#4F8CFF]" />
            <div className="absolute inset-0 blur-lg bg-[#4F8CFF] opacity-50 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Neuroweave</h1>
            <p className="text-xs text-[#8B92A8]">Intelligence System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-[rgba(79,140,255,0.15)] text-[#4F8CFF] shadow-[0_0_20px_rgba(79,140,255,0.3)]' 
                  : 'text-[#8B92A8] hover:bg-[rgba(79,140,255,0.05)] hover:text-[#E8EEF7]'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1 h-6 bg-[#4F8CFF] rounded-full shadow-[0_0_10px_rgba(79,140,255,0.8)]"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[rgba(79,140,255,0.1)]">
        <div className="bg-gradient-to-r from-[rgba(79,140,255,0.1)] to-[rgba(122,92,255,0.1)] rounded-lg p-3 border border-[rgba(79,140,255,0.2)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#00FFA3] rounded-full animate-pulse" />
            <span className="text-xs text-[#E8EEF7]">Neural Network Active</span>
          </div>
          <p className="text-xs text-[#8B92A8]">All systems operational</p>
        </div>
      </div>
    </motion.aside>
  );
}
