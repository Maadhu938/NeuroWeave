import { 
  Brain, 
  LayoutDashboard, 
  Network, 
  Upload, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu,
  Search,
  Bell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Rocket,
  Clock,
  Target,
  Zap,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  User,
  Mail,
  Lock,
  Eye,
  Sun,
  Moon,
  Monitor,
  Download,
  AlertCircle,
  Compass,
  Home,
  Shield,
  Database,
  FileText,
  Link2,
  X,
  RefreshCw,
  Maximize2,
  Minimize2,
  Trash2,
  Send,
  TrendingUp,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping to Lucide components
const ICONS: Record<string, LucideIcon> = {
  brain: Brain,
  dashboard: LayoutDashboard,
  network: Network,
  upload: Upload,
  chart: BarChart3,
  calendar: Calendar,
  message: MessageSquare,
  settings: Settings,
  logout: LogOut,
  menu: Menu,
  search: Search,
  bell: Bell,
  sparkles: Sparkles,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  check: Check,
  loading: Loader2,
  learning: BookOpen,
  rocket: Rocket,
  clock: Clock,
  target: Target,
  zap: Zap,
  book: BookOpen,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  user: User,
  mail: Mail,
  lock: Lock,
  eye: Eye,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  download: Download,
  alert: AlertCircle,
  compass: Compass,
  home: Home,
  shield: Shield,
  database: Database,
  fileText: FileText,
  link: Link2,
  x: X,
  refresh: RefreshCw,
  maximize: Maximize2,
  minimize: Minimize2,
  trash: Trash2,
  send: Send,
  trendingUp: TrendingUp,
  checkCircle: CheckCircle,
  alertCircle: AlertCircle,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

export function LottieIcon({ name, size = 24, className = '', animate = true }: IconProps) {
  // If the app wants to use a custom image for the brand "brain" logo,
  // serve an image from the public folder: `/neuroweave-logo.png`.
  // The user should place the provided image at `public/neuroweave-logo.png`.
  if (name === 'neuroweave' || name === 'logo') {
    const style: React.CSSProperties = { width: size, height: size, objectFit: 'contain' };
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img
        src="/neuroweave-logo.png"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/neuroweave-logo.svg'; }}
        className={`rounded ${className}`}
        style={style}
        alt="Neuroweave logo"
      />
    );
  }

  const IconComponent = ICONS[name];
  if (!IconComponent) {
    return (
      <div
        className={`bg-primary/20 rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Determine animation class based on icon name
  const getAnimationClass = () => {
    if (!animate) return '';

    switch (name) {
      case 'loading':
      case 'refresh':
        return 'animate-spin';
      case 'bell':
        return 'animate-bounce';
      case 'sparkles':
      case 'zap':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <IconComponent
      size={size}
      className={`${getAnimationClass()} ${className}`}
    />
  );
}

export function StaticLottieIcon({ name, size = 24, className = '' }: IconProps) {
  return (
    <LottieIcon 
      name={name} 
      size={size} 
      className={className} 
      animate={false}
    />
  );
}

// Re-export for backward compatibility
export { ICONS };
