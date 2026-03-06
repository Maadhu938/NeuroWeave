import { Brain, TrendingUp, AlertCircle, Calendar, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MemoryHeatmap } from './MemoryHeatmap';
import { MemoryDecayChart } from './MemoryDecayChart';
import { AIInsightCards } from './AIInsightCards';

export function Dashboard() {
  const retentionData = [
    { date: 'Mon', retention: 85 },
    { date: 'Tue', retention: 88 },
    { date: 'Wed', retention: 82 },
    { date: 'Thu', retention: 90 },
    { date: 'Fri', retention: 87 },
    { date: 'Sat', retention: 92 },
    { date: 'Sun', retention: 89 },
  ];

  const knowledgeStrength = [
    { subject: 'Neural Networks', score: 90 },
    { subject: 'Deep Learning', score: 85 },
    { subject: 'Reinforcement Learning', score: 65 },
    { subject: 'NLP', score: 78 },
    { subject: 'Computer Vision', score: 82 },
    { subject: 'Transformers', score: 70 },
  ];

  const weakAreas = [
    { topic: 'Reinforcement Learning', strength: 65, review: 'Critical' },
    { topic: 'Policy Gradients', strength: 58, review: 'Urgent' },
    { topic: 'Q-Learning', strength: 72, review: 'Soon' },
  ];

  const upcomingReviews = [
    { concept: 'Backpropagation', time: '2 hours', priority: 'high' },
    { concept: 'Attention Mechanisms', time: '5 hours', priority: 'medium' },
    { concept: 'GANs Architecture', time: '1 day', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cognitive Dashboard</h1>
          <p className="text-[#8B92A8]">Your knowledge intelligence overview</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(79,140,255,0.3)]"
        >
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white">AI Analysis</span>
        </motion.div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Brain className="w-6 h-6" />}
          title="Knowledge Score"
          value="87.5%"
          change="+3.2%"
          trend="up"
          color="#4F8CFF"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Retention Rate"
          value="92.3%"
          change="+1.8%"
          trend="up"
          color="#00FFA3"
        />
        <MetricCard
          icon={<Target className="w-6 h-6" />}
          title="Concepts Mastered"
          value="342"
          change="+12"
          trend="up"
          color="#7A5CFF"
        />
        <MetricCard
          icon={<Zap className="w-6 h-6" />}
          title="Study Streak"
          value="12 days"
          change="New record!"
          trend="up"
          color="#FFB800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Strength Meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#4F8CFF]" />
            Knowledge Strength Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00FFA3]" />
            Memory Retention Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Knowledge Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
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
              Your weakest area is <span className="text-[#FF4D6D] font-semibold">Reinforcement Learning</span>. 
              I recommend reviewing <span className="text-[#4F8CFF] font-semibold">Policy Gradients</span> and 
              <span className="text-[#4F8CFF] font-semibold"> Q-Learning</span> concepts within the next 24 hours 
              to prevent significant knowledge decay.
            </p>
            <p className="text-sm text-[#8B92A8]">
              Based on your learning patterns, morning study sessions yield 23% better retention for theoretical topics.
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI-Generated Insight Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FFB800]" />
          AI Intelligence Insights
        </h2>
        <AIInsightCards />
      </motion.div>

      {/* Memory Strength Heatmap - NAMA Algorithm Visualization */}
      <MemoryHeatmap />

      {/* Memory Decay Prediction */}
      <MemoryDecayChart concept="Reinforcement Learning" />
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