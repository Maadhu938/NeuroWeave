import { Brain, LayoutDashboard, Network, Upload, TrendingUp, MessageSquare, Calendar, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentPage, onNavigate, open, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'brain-map', icon: Network, label: 'Brain Map' },
    { id: 'upload', icon: Upload, label: 'Upload Knowledge' },
    { id: 'insights', icon: TrendingUp, label: 'Insights' },
    { id: 'planner', icon: Calendar, label: 'Study Planner' },
    { id: 'ask', icon: MessageSquare, label: 'Ask Your Brain' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    onClose?.();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 md:p-6 border-b border-[rgba(79,140,255,0.1)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-7 h-7 md:w-8 md:h-8 text-[#4F8CFF]" />
            <div className="absolute inset-0 blur-lg bg-[#4F8CFF] opacity-50 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">Neuroweave</h1>
            <p className="text-xs text-[#8B92A8]">Intelligence System</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button onClick={onClose} className="md:hidden p-1.5 rounded-lg text-[#8B92A8] hover:text-white hover:bg-[rgba(79,140,255,0.1)] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.id)}
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

      {/* User & Logout */}
      <div className="p-3 md:p-4 border-t border-[rgba(79,140,255,0.1)] space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#7A5CFF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user.displayName || 'Explorer'}</p>
              <p className="text-xs text-[#8B92A8] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => { await signOut(); onNavigate('landing'); onClose?.(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#8B92A8] hover:bg-[rgba(255,77,109,0.1)] hover:text-[#FF4D6D] transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </motion.button>
        <div className="bg-gradient-to-r from-[rgba(79,140,255,0.1)] to-[rgba(122,92,255,0.1)] rounded-lg p-3 border border-[rgba(79,140,255,0.2)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#00FFA3] rounded-full animate-pulse" />
            <span className="text-xs text-[#E8EEF7]">Neural Network Active</span>
          </div>
          <p className="text-xs text-[#8B92A8]">All systems operational</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="hidden md:flex w-64 h-screen bg-[#0D1117] border-r border-[rgba(79,140,255,0.1)] flex-col fixed left-0 top-0 z-30"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0D1117] border-r border-[rgba(79,140,255,0.1)] flex flex-col z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
