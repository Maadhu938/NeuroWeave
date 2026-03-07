import { Brain, Sparkles, Network, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-[#4F8CFF] rounded-full blur-[80px] md:blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-[#7A5CFF] rounded-full blur-[80px] md:blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 md:w-96 h-48 md:h-96 bg-[#00E5FF] rounded-full blur-[80px] md:blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <Brain className="w-14 h-14 md:w-20 md:h-20 text-[#4F8CFF]" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 blur-2xl bg-[#4F8CFF]"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
            className="text-4xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-[#4F8CFF] via-[#7A5CFF] to-[#00E5FF] bg-clip-text text-transparent"
          >
            Neuroweave
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="text-lg md:text-2xl text-[#8B92A8] mb-4 md:mb-6"
          >
            Weaving intelligence from data, models, and algorithms
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 20 }}
            className="text-base md:text-lg text-[#E8EEF7] mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
          >
            An AI-powered cognitive learning system that models knowledge as a network of interconnected concepts and predicts knowledge retention using advanced algorithms.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="group bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl flex items-center gap-2 mx-auto shadow-[0_0_40px_rgba(79,140,255,0.4)] hover:shadow-[0_0_60px_rgba(79,140,255,0.6)] transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-base md:text-lg">Enter Neural Interface</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-16 md:mt-24 max-w-5xl mx-auto"
        >
          <FeatureCard
            icon={<Network className="w-8 h-8" />}
            title="Knowledge Graph"
            description="Visualize your knowledge as an interconnected neural network of concepts"
            color="#4F8CFF"
            delay={0.45}
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Memory Prediction"
            description="AI-powered algorithms predict knowledge retention and optimize learning"
            color="#7A5CFF"
            delay={0.5}
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Adaptive Learning"
            description="Generate personalized study plans based on your cognitive patterns"
            color="#00E5FF"
            delay={0.55}
          />
        </motion.div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-[rgba(19,24,36,0.6)] backdrop-blur-xl border border-[rgba(79,140,255,0.2)] rounded-xl p-5 md:p-6 hover:border-[rgba(79,140,255,0.4)] transition-all"
      style={{
        boxShadow: `0 0 40px ${color}20`,
      }}
    >
      <div className="text-[color] mb-4" style={{ color }}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#8B92A8] leading-relaxed">{description}</p>
    </motion.div>
  );
}
