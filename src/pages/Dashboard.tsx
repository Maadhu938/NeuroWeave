import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MemoryHeatmap } from '@/components/MemoryHeatmap';
import { MemoryDecayChart } from '@/components/MemoryDecayChart';
import { AIInsightCards } from '@/components/AIInsightCards';
import { getDashboard, type DashboardData, type RetentionDataPoint, type KnowledgeStrengthItem, type WeakArea, type UpcomingReview } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { LottieIcon } from '@/components/AnimatedIcons';

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

  const fetchDashboard = useCallback(() => {
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
  }, []);

  useEffect(() => {
    fetchDashboard();

    const t1 = setTimeout(() => setShowHeavyComponents(prev => ({ ...prev, ai: true })), 400);
    const t2 = setTimeout(() => setShowHeavyComponents(prev => ({ ...prev, heatmap: true })), 1000);
    const t3 = setTimeout(() => setShowHeavyComponents(prev => ({ ...prev, decay: true })), 1600);

    const onDataCleared = () => {
      setRetentionData([]);
      setKnowledgeStrength([]);
      setWeakAreas([]);
      setUpcomingReviews([]);
      setMetrics({ knowledgeScore: '--', retentionRate: '--', conceptsMastered: '--', studyStreak: '--' });
      setAiInsight('');
      fetchDashboard();
    };
    window.addEventListener('neuroweave:dataCleared', onDataCleared as EventListener);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('neuroweave:dataCleared', onDataCleared as EventListener);
    };
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">
            {user?.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="page-subtitle">Here's your learning progress overview</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => aiSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="primary-action px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <div className="w-4 h-4">
            <LottieIcon name="sparkles" size={16} />
          </div>
          <span className="text-sm">AI Insights</span>
        </motion.button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon="brain"
          title="Knowledge Score"
          value={metrics.knowledgeScore}
          color="primary"
        />
        <MetricCard
          icon="chart"
          title="Retention Rate"
          value={metrics.retentionRate}
          color="success"
        />
        <MetricCard
          icon="book"
          title="Concepts Mastered"
          value={metrics.conceptsMastered}
          color="accent"
        />
        <MetricCard
          icon="clock"
          title="Study Streak"
          value={metrics.studyStreak}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Strength Meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="soft-card p-5 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="target" size={20} />
              </div>
              Knowledge Strength
            </h2>
            <button
              onClick={() => onNavigate?.('brain-map')}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              View Details
              <div className="w-4 h-4">
                <LottieIcon name="arrowRight" size={16} />
              </div>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={knowledgeStrength}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={12} />
              <PolarRadiusAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Radar
                name="Strength"
                dataKey="score"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Memory Retention Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="soft-card p-5 md:p-6"
        >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-5 h-5">
                  <LottieIcon name="chart" size={20} />
                </div>
                Retention Trend
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">Last 7 days</span>
            </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={retentionData}>
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="var(--primary)"
                strokeWidth={2}
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
          transition={{ duration: 0.5, delay: 0.15 }}
          className="soft-card p-5 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="alert" size={20} />
              </div>
              Areas to Review
            </h2>
            <button 
              onClick={() => onNavigate?.('brain-map')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {weakAreas.length > 0 ? weakAreas.map((area, index) => (
              <motion.div
                key={area.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="soft-tile p-4 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium">{area.topic}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    area.review === 'Critical' ? 'bg-destructive/10 text-destructive' :
                    area.review === 'Urgent' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {area.review}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${area.strength}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className={`h-full rounded-full ${
                        area.strength < 40 ? 'bg-destructive' :
                        area.strength < 70 ? 'bg-warning' :
                        'bg-success'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10">{area.strength}%</span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-3 opacity-50">
                  <LottieIcon name="zap" size={48} />
                </div>
                <p>No weak areas detected. Great job!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="soft-card p-5 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="calendar" size={20} />
              </div>
              Upcoming Reviews
            </h2>
            <button 
              onClick={() => onNavigate?.('planner')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              View Planner
            </button>
          </div>
          <div className="space-y-3">
            {upcomingReviews.length > 0 ? upcomingReviews.map((review, index) => (
              <motion.div
                key={review.concept}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ x: 4 }}
                className="soft-tile p-4 cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium mb-1">{review.concept}</p>
                    <p className="text-sm text-muted-foreground">Review in {review.time}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    review.priority === 'critical' ? 'bg-destructive' :
                    review.priority === 'high' ? 'bg-warning' :
                    review.priority === 'medium' ? 'bg-accent' :
                    'bg-success'
                  }`} />
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-3 opacity-50">
                  <LottieIcon name="calendar" size={48} />
                </div>
                <p>No upcoming reviews scheduled</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <div className="w-6 h-6">
              <LottieIcon name="sparkles" size={24} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">AI Learning Insight</h3>
            <p className="text-muted-foreground leading-relaxed">
              {aiInsight || 'Connect to the backend to receive AI-generated insights based on your learning patterns. The system analyzes your study habits and provides personalized recommendations.'}
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
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-5 h-5">
              <LottieIcon name="zap" size={20} />
            </div>
            Personalized Recommendations
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
  icon: string;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'primary' | 'success' | 'warning' | 'accent' | 'destructive';
}

function MetricCard({ icon, title, value, trend, trendValue, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="soft-card p-5 hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <div className="w-5 h-5">
            <LottieIcon name={icon as any} size={20} />
          </div>
        </div>
        {trend !== 'neutral' && trendValue && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}>
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );
}
