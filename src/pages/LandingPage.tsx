import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const SVG_ANIMATIONS = {
  network: '/assets/knowledge-graph.svg',
  learning: '/assets/memory-prediction.svg',
  rocket: '/assets/smart-planning.svg',
  chart: '/assets/quick-insights.svg',
  clock: '/assets/space-repetion.svg',
  brain: '/assets/ai-tutor.svg',
};

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Animated Hero Visual */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <img src="/assets/ai-tutor.svg" alt="AI Brain" className="relative w-full h-full object-contain" style={{ animation: 'float 3s ease-in-out infinite' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight"
          >
            Master Knowledge with{' '}
            <span className="text-primary">Neuroweave</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            An intelligent learning platform that maps your knowledge, predicts retention, 
            and creates personalized study plans using advanced AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGetStarted}
              className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl flex items-center gap-2 font-medium text-foreground border border-border hover:bg-muted transition-all"
            >
              <BookOpen className="w-5 h-5" />
              View Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature Grid with Animated SVGs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
        >
          <FeatureCard
            animation={SVG_ANIMATIONS.network}
            title="Knowledge Graph"
            description="Visualize concepts as interconnected nodes. See how ideas relate and build upon each other."
            delay={0.45}
          />
          <FeatureCard
            animation={SVG_ANIMATIONS.learning}
            title="Memory Prediction"
            description="AI algorithms predict when you'll forget and schedule reviews at optimal times."
            delay={0.5}
          />
          <FeatureCard
            animation={SVG_ANIMATIONS.rocket}
            title="Smart Planning"
            description="Get personalized study plans based on your learning patterns and goals."
            delay={0.55}
          />
          <FeatureCard
            animation={SVG_ANIMATIONS.chart}
            title="Quick Insights"
            description="Instant analysis of your weak areas and personalized recommendations."
            delay={0.6}
          />
          <FeatureCard
            animation={SVG_ANIMATIONS.clock}
            title="Spaced Repetition"
            description="Scientifically proven techniques to maximize long-term retention."
            delay={0.65}
          />
          <FeatureCard
            animation={SVG_ANIMATIONS.brain}
            title="AI Tutor"
            description="Ask questions and get explanations tailored to your knowledge level."
            delay={0.7}
          />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 pt-16 border-t border-border"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
            <StatItem value="10K+" label="Active Learners" />
            <StatItem value="95%" label="Retention Rate" />
            <StatItem value="50K+" label="Concepts Mapped" />
            <StatItem value="4.9" label="User Rating" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  animation: string;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ animation, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
        <img
          src={animation}
          alt={title}
          className="w-full h-full object-contain"
          style={{ animation: 'svgPulse 2.5s ease-in-out infinite' }}
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed text-center">{description}</p>
    </motion.div>
  );
}

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
