import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { LottieIcon } from './AnimatedIcons';
import { BarChart3, BookOpenCheck, CalendarDays, LayoutDashboard, LogOut, MessageCircleQuestion, Network, Settings, UploadCloud, X, Shield } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  open?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'brain-map', icon: Network, label: 'Brain Map' },
  { id: 'upload', icon: UploadCloud, label: 'Upload Knowledge' },
  { id: 'insights', icon: BarChart3, label: 'Insights' },
  { id: 'planner', icon: CalendarDays, label: 'Study Planner' },
  { id: 'ask', icon: MessageCircleQuestion, label: 'Ask Your Brain' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const bottomNavItems = [
  { id: 'privacy', icon: Shield, label: 'Privacy Policy' },
];

export function Sidebar({ currentPage, onNavigate, open, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();

  const handleNav = (page: string) => {
    onNavigate(page);
    onClose?.();
  };

  const sidebarContent = (
    <>
      <div className="p-5 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
            <LottieIcon name="neuroweave" size={36} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Neuroweave</h1>
            <p className="text-xs text-muted-foreground">AI learning desk</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                group w-full flex items-center gap-3 px-4 py-3 rounded-[1.35rem] transition-all duration-200
                ${isActive 
                  ? 'bg-primary/15 text-primary font-semibold shadow-sm ring-1 ring-primary/10' 
                  : 'text-muted-foreground hover:bg-muted/75 hover:text-foreground'
                }
              `}
            >
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-muted-foreground group-hover:text-foreground'}`}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-2 w-2 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <div className="soft-tile p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpenCheck className="h-4 w-4 text-primary" />
            Review Ready
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Your study space is synced and ready.</p>
        </div>
        {user && (
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/12">
              <LottieIcon name="user" size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate">{user.displayName || 'Explorer'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        {bottomNavItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted/75 hover:text-foreground'
                }
              `}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="text-sm">{item.label}</span>
            </motion.button>
          );
        })}
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => { await signOut(); onNavigate('landing'); onClose?.(); }}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span className="text-sm">Sign Out</span>
        </motion.button>
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
        className="hidden md:flex w-72 h-screen glass-panel border-r border-sidebar-border flex-col fixed left-0 top-0 z-30"
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
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 glass-panel-strong border-r border-sidebar-border flex flex-col z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
