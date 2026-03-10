import { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, AlertCircle, Calendar, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MemoryHeatmap } from '@/components/MemoryHeatmap';
import { MemoryDecayChart } from '@/components/MemoryDecayChart';
import { AIInsightCards } from '@/components/AIInsightCards';
import { getDashboard, type DashboardData, type RetentionDataPoint, type KnowledgeStrengthItem, type WeakArea, type UpcomingReview } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const [retentionData, setRetentionData] = useState<RetentionDataPoint[]>([]);
  const [knowledgeStrength, setKnowledgeStrength] = useState<KnowledgeStrengthItem[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [upcomingReviews, setUpcomingReviews] = useState<UpcomingReview[]>([]);
  const [metrics, setMetrics] = useState({ knowledgeScore: '--', retentionRate: '--', conceptsMastered: '--', studyStreak: '--' });
  const [aiInsight, setAiInsight] = useState('');
  const [showHeavyComponents, setShowHeavyComponents] = useState({ ai: false, heatmap: false, decay: false });

  useEffect(() => {
    getDashboard()
      .then((data: DashboardData) => {
        setRetentionData(data.retentionData);
        setKnowledgeStrength(data.knowledgeStrength);
        setWeakAreas(data.weakAreas);
        setUpcomingReviews(data.upcomingReviews);
        setMetrics({
          knowledgeScore: `${data.metrics.knowledgeScore}%`,
          retentionRate: `${data.metrics.retentionRate}%`,
          conceptsMastered: `${data.metrics.conceptsMastered}`,
          studyStreak: `${data.metrics.studyStreakDays} days`,
        });
        setAiInsight(data.aiInsight);
      })
      .catch(() => { /* API not available yet */ });

    // Faster staggered loading
    const t1 = setTimeout(() => setShowHeavyComponents(prev => ({ ...prev, ai: true })), 400);
    const t2 = setTimeout(() => setShowHeavyComponents(prev => ({ ...prev, heatmap: true })), 1000);
    const t3 = setTimeout(() => setShowHeavyComponents(prev => ({ ...prev, decay: true })), 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            {user?.displayName ? `Welcome, ${user.displayName}` : 'Cognitive Dashboard'}
          </h1>
          <p className="text-sm text-[#8B92A8]">Your knowledge intelligence overview</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => aiSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] px-5 py-2.5 md:px-6 md:py-3 rounded-lg flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(79,140,255,0.3)] self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <span className="text-white text-sm md:text-base">AI Analysis</span>
        </motion.div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={<Brain className="w-6 h-6" />}
          title="Knowledge Score"
          value={metrics.knowledgeScore}
          change=""
          trend="up"
          color="#4F8CFF"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Retention Rate"
          value={metrics.retentionRate}
          change=""
          trend="up"
          color="#00FFA3"
        />
        <MetricCard
          icon={<Target className="w-6 h-6" />}
          title="Concepts Mastered"
          value={metrics.conceptsMastered}
          change=""
          trend="up"
          color="#7A5CFF"
        />
        <MetricCard
          icon={<Zap className="w-6 h-6" />}
          title="Study Streak"
          value={metrics.studyStreak}
          change=""
          trend="up"
          color="#FFB800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Knowledge Strength Meter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
        >
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#4F8CFF]" />
            Knowledge Strength Analysis
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={knowledgeStrength}>
              <PolarGrid stroke="rgba(79,140,255,0.2)" />
              <PolarAngleAxis dataKey="subject" stroke="#8B92A8" />
              <PolarRadiusAxis stroke="#8B92A8" />
              <Radar
                name="Strength"
                dataKey="score"
                stroke="#4F8CFF"
                fill="#4F8CFF"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Memory Retention Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
        >
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00FFA3]" />
            Memory Retention Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={retentionData}>
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,140,255,0.1)" />
              <XAxis dataKey="date" stroke="#8B92A8" />
              <YAxis stroke="#8B92A8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131824',
                  border: '1px solid rgba(79,140,255,0.2)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#4F8CFF"
                strokeWidth={3}
                fill="url(#retentionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Weak Knowledge Areas */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
        >
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF4D6D]" />
            Weak Knowledge Areas
          </h2>
          <div className="space-y-3">
            {weakAreas.map((area, index) => (
              <motion.div
                key={area.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-[rgba(255,77,109,0.05)] border border-[rgba(255,77,109,0.2)] rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">{area.topic}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    area.review === 'Critical' ? 'bg-[#FF4D6D] text-white' :
                    area.review === 'Urgent' ? 'bg-[#FFB800] text-[#0B0F1A]' :
                    'bg-[#4F8CFF] text-white'
                  }`}>
                    {area.review}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${area.strength}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-[#FF4D6D] to-[#FFB800]"
                    />
                  </div>
                  <span className="text-sm text-[#8B92A8] w-12">{area.strength}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
        >
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00E5FF]" />
            Upcoming Reviews
          </h2>
          <div className="space-y-3">
            {upcomingReviews.map((review, index) => (
              <motion.div
                key={review.concept}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4 cursor-pointer hover:border-[rgba(79,140,255,0.4)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white mb-1">{review.concept}</p>
                    <p className="text-sm text-[#8B92A8]">Review in {review.time}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    review.priority === 'critical' ? 'bg-[#FF0000]' :
                    review.priority === 'high' ? 'bg-[#FF4D6D]' :
                    review.priority === 'medium' ? 'bg-[#FFB800]' :
                    'bg-[#00FFA3]'
                  } animate-pulse`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-[rgba(79,140,255,0.1)] to-[rgba(122,92,255,0.1)] border border-[rgba(79,140,255,0.3)] rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[rgba(79,140,255,0.2)] rounded-lg">
            <Sparkles className="w-6 h-6 text-[#4F8CFF]" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">AI Insight</h3>
            <p className="text-[#E8EEF7] mb-3">
              {aiInsight || 'Connect to the backend to receive AI-generated insights based on your learning patterns.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI-Generated Insight Cards */}
      {showHeavyComponents.ai && (
        <motion.div
          ref={aiSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFB800]" />
            AI Intelligence Insights
          </h2>
          <AIInsightCards />
        </motion.div>
      )}

      {/* Memory Strength Heatmap */}
      {showHeavyComponents.heatmap && <MemoryHeatmap />}

      {/* Memory Decay Prediction */}
      {showHeavyComponents.decay && (
        <MemoryDecayChart concept={weakAreas.length > 0 ? weakAreas[0].topic : undefined} />
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

function MetricCard({ icon, title, value, change, trend, color }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-5 hover:border-[rgba(79,140,255,0.4)] transition-all"
      style={{
        boxShadow: `0 0 30px ${color}15`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <span className={`text-xs px-2 py-1 rounded ${trend === 'up' ? 'bg-[rgba(0,255,163,0.2)] text-[#00FFA3]' : 'bg-[rgba(255,77,109,0.2)] text-[#FF4D6D]'}`}>
          {change}
        </span>
      </div>
      <p className="text-sm text-[#8B92A8] mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}