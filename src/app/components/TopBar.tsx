import { Brain, Zap, TrendingUp, Target } from 'lucide-react';
import { motion } from 'motion/react';

export function TopBar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-[#0D1117] border-b border-[rgba(79,140,255,0.1)] flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10"
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#4F8CFF]" />
          <span className="text-sm text-[#E8EEF7]">Cognitive Intelligence System</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Intelligence Metrics */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-[rgba(79,140,255,0.1)] px-4 py-2 rounded-lg border border-[rgba(79,140,255,0.2)]"
        >
          <Zap className="w-4 h-4 text-[#FFB800]" />
          <div>
            <p className="text-xs text-[#8B92A8]">Knowledge Score</p>
            <p className="text-sm font-semibold text-[#E8EEF7]">87.5%</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-[rgba(122,92,255,0.1)] px-4 py-2 rounded-lg border border-[rgba(122,92,255,0.2)]"
        >
          <TrendingUp className="w-4 h-4 text-[#00FFA3]" />
          <div>
            <p className="text-xs text-[#8B92A8]">Retention Rate</p>
            <p className="text-sm font-semibold text-[#E8EEF7]">92.3%</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-[rgba(0,229,255,0.1)] px-4 py-2 rounded-lg border border-[rgba(0,229,255,0.2)]"
        >
          <Target className="w-4 h-4 text-[#00E5FF]" />
          <div>
            <p className="text-xs text-[#8B92A8]">Study Streak</p>
            <p className="text-sm font-semibold text-[#E8EEF7]">12 days</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
