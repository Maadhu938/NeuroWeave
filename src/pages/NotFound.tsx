import { motion } from 'motion/react';
import { Home, ArrowLeft, Search, Compass } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface NotFoundProps {
  onNavigate?: (page: string) => void;
}

// 404 Animation URL
const ERROR_404_URL = 'https://lottie.host/7e1b39g6-0d4h-7g0e-2f1h-5i8d1e2f4g5h/error-404.json';

export function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        {/* Floating Numbers */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 text-8xl font-bold text-primary/10"
        >
          4
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-40 right-32 text-6xl font-bold text-accent/10"
        >
          0
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 3, -3, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-1/3 text-7xl font-bold text-warning/10"
        >
          4
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        {/* Lottie Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-64 h-64 mx-auto mb-8"
        >
          <DotLottieReact
            src={ERROR_404_URL}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>

        {/* Error Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-8xl md:text-9xl font-bold text-foreground mb-2 tracking-tight">
            <span className="text-primary">4</span>
            <span className="text-accent">0</span>
            <span className="text-primary">4</span>
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off into the neural network. 
            Let's get you back on track.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('dashboard')}
            className="group bg-primary text-primary-foreground px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-foreground border border-border hover:bg-muted transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">You might want to try:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SuggestionChip 
              icon={<Compass className="w-4 h-4" />} 
              label="Brain Map" 
              onClick={() => onNavigate?.('brain-map')} 
            />
            <SuggestionChip 
              icon={<Search className="w-4 h-4" />} 
              label="Ask Your Brain" 
              onClick={() => onNavigate?.('ask')} 
            />
            <SuggestionChip 
              icon={<Home className="w-4 h-4" />} 
              label="Dashboard" 
              onClick={() => onNavigate?.('dashboard')} 
            />
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 p-4 bg-muted/50 rounded-xl border border-border"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Did you know?</span>{' '}
            The 404 error code was named after a room at CERN where the World Wide Web was born.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface SuggestionChipProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function SuggestionChip({ icon, label, onClick }: SuggestionChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-full text-sm text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
    >
      {icon}
      {label}
    </motion.button>
  );
}
