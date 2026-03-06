import { motion } from 'motion/react';
import { TrendingUp, Brain, Clock, Target, Lightbulb, AlertTriangle } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MemoryDecayChart } from './MemoryDecayChart';

export function Insights() {
  const knowledgeCoverage = [
    { subject: 'Theory', score: 85 },
    { subject: 'Practical', score: 92 },
    { subject: 'Mathematics', score: 78 },
    { subject: 'Implementation', score: 88 },
    { subject: 'Applications', score: 82 },
  ];

  const learningPatterns = [
    { time: 'Morning', effectiveness: 92 },
    { time: 'Afternoon', effectiveness: 75 },
    { time: 'Evening', effectiveness: 68 },
    { time: 'Night', effectiveness: 55 },
  ];

  const subjectRetention = [
    { subject: 'Neural Networks', retention: 90, color: '#4F8CFF' },
    { subject: 'Deep Learning', retention: 85, color: '#7A5CFF' },
    { subject: 'RL', retention: 65, color: '#FF4D6D' },
    { subject: 'NLP', retention: 78, color: '#00E5FF' },
    { subject: 'Computer Vision', retention: 82, color: '#00FFA3' },
  ];

  const insights = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Optimal Learning Time',
      description: 'Your retention rate is 23% higher during morning study sessions (7-10 AM).',
      type: 'success',
      color: '#00FFA3',
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Theory vs Practice Gap',
      description: 'You retain practical concepts 14% better than theoretical ones. Consider more hands-on practice.',
      type: 'warning',
      color: '#FFB800',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Review Frequency',
      description: 'Concepts reviewed 3+ times have 87% retention vs 62% for single reviews.',
      type: 'info',
      color: '#4F8CFF',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Weak Subject Cluster',
      description: 'Reinforcement Learning related topics consistently show lower retention. Focus needed.',
      type: 'danger',
      color: '#FF4D6D',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Insights</h1>
        <p className="text-[#8B92A8]">Deep analysis of your learning patterns and knowledge retention</p>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6 hover:border-[rgba(79,140,255,0.4)] transition-all"
            style={{
              boxShadow: `0 0 30px ${insight.color}15`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${insight.color}20`, color: insight.color }}
              >
                {insight.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{insight.title}</h3>
                <p className="text-[#8B92A8] text-sm leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Coverage Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#4F8CFF]" />
            Knowledge Coverage Analysis
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={knowledgeCoverage}>
              <PolarGrid stroke="rgba(79,140,255,0.2)" />
              <PolarAngleAxis dataKey="subject" stroke="#8B92A8" />
              <PolarRadiusAxis stroke="#8B92A8" />
              <Radar
                name="Coverage"
                dataKey="score"
                stroke="#4F8CFF"
                fill="#4F8CFF"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-[rgba(79,140,255,0.1)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4">
            <p className="text-sm text-[#8B92A8]">
              <span className="text-[#4F8CFF] font-semibold">Mathematics</span> shows the lowest coverage at 78%. 
              Consider reviewing foundational concepts.
            </p>
          </div>
        </motion.div>

        {/* Learning Pattern Effectiveness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#7A5CFF]" />
            Learning Pattern Analysis
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={learningPatterns}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,140,255,0.1)" />
              <XAxis dataKey="time" stroke="#8B92A8" />
              <YAxis stroke="#8B92A8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131824',
                  border: '1px solid rgba(79,140,255,0.2)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="effectiveness" radius={[8, 8, 0, 0]}>
                {learningPatterns.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`rgba(79, 140, 255, ${0.4 + (entry.effectiveness / 100) * 0.6})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-[rgba(122,92,255,0.1)] border border-[rgba(122,92,255,0.2)] rounded-lg p-4">
            <p className="text-sm text-[#8B92A8]">
              Peak effectiveness observed in <span className="text-[#7A5CFF] font-semibold">morning sessions</span>. 
              Schedule critical reviews during 7-10 AM.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Subject Retention Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
          Subject Retention Breakdown
        </h2>
        <div className="space-y-4">
          {subjectRetention.map((subject, index) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{subject.subject}</span>
                <span className="text-sm text-[#8B92A8]">{subject.retention}%</span>
              </div>
              <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.retention}%` }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${subject.color}, ${subject.color}dd)`,
                    boxShadow: `0 0 10px ${subject.color}80`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-[rgba(79,140,255,0.1)] to-[rgba(122,92,255,0.1)] border border-[rgba(79,140,255,0.3)] rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#FFB800]" />
          AI Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[rgba(0,0,0,0.2)] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">📚 Focus Areas</h4>
            <ul className="space-y-1 text-sm text-[#8B92A8]">
              <li>• Reinforce Reinforcement Learning concepts</li>
              <li>• Review mathematical foundations</li>
              <li>• Practice more theoretical problems</li>
            </ul>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">⏰ Optimal Schedule</h4>
            <ul className="space-y-1 text-sm text-[#8B92A8]">
              <li>• Study new concepts: 7-10 AM</li>
              <li>• Practice problems: 2-4 PM</li>
              <li>• Quick reviews: 8-9 PM</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Memory Decay Analysis */}
      <MemoryDecayChart concept="Neural Networks" />
    </div>
  );
}