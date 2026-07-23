import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { LottieIcon } from '@/components/AnimatedIcons';
import { getStudyPlan, type StudyRecommendation, type WeekDay, type Milestone } from '@/lib/api';
import { ReviewQuiz } from '@/components/ReviewQuiz';

interface StudyPlannerProps {
  onNavigate?: (page: string) => void;
}

export function StudyPlanner({ onNavigate }: StudyPlannerProps) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0=Mon ... 6=Sun
  
  const [todayRecommendations, setTodayRecommendations] = useState<StudyRecommendation[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekDay[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, completed: 0, timeSpent: '--', avgScore: 0 });

  const [loading, setLoading] = useState(false);
  const [reviewConcept, setReviewConcept] = useState<{ label: string; strength: number } | null>(null);

  const fetchPlan = useCallback(() => {
    setLoading(true);
    getStudyPlan()
      .then((data) => {
        setTodayRecommendations(data.recommendations);
        setWeekSchedule(data.weekSchedule);
        setUpcomingMilestones(data.milestones);
        setStats(data.stats);
      })
      .catch(() => { /* API not available yet */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPlan();

    const onDataCleared = () => {
      setTodayRecommendations([]);
      setWeekSchedule([]);
      setUpcomingMilestones([]);
      setStats({ totalReviews: 0, completed: 0, timeSpent: '--', avgScore: 0 });
      fetchPlan();
    };
    window.addEventListener('neuroweave:dataCleared', onDataCleared as EventListener);
    return () => window.removeEventListener('neuroweave:dataCleared', onDataCleared as EventListener);
  }, [fetchPlan]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Adaptive Study Planner</h1>
          <p className="text-sm text-muted-foreground">AI-generated learning schedule optimized for retention</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchPlan}
          className="bg-gradient-to-r from-primary to-accent px-5 py-2.5 md:px-6 md:py-3 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20 text-white self-start sm:self-auto"
        >
          <div className="w-4 h-4 md:w-5 md:h-5">
            <LottieIcon name="calendar" size={20} />
          </div>
          <span className="text-white text-sm md:text-base">{loading ? 'Refreshing...' : 'Generate New Plan'}</span>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="soft-card p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/15">
              <div className="w-5 h-5">
                <LottieIcon name="target" size={20} />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">This Week</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalReviews} reviews</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="soft-card p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[rgba(0,255,163,0.2)]">
              <div className="w-5 h-5">
                <LottieIcon name="check" size={20} />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.completed} / {stats.totalReviews}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="soft-card p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[rgba(255,184,0,0.2)]">
              <div className="w-5 h-5">
                <LottieIcon name="clock" size={20} />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Time Spent</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.timeSpent}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="soft-card p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/15">
              <div className="w-5 h-5">
                <LottieIcon name="chart" size={20} />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Avg. Score</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.avgScore}%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Recommendations */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="soft-card p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="target" size={20} />
              </div>
              Today's Priority Reviews
            </h2>
            <div className="space-y-3">
              {todayRecommendations.map((rec, index) => (
                <motion.div
                  key={rec.concept}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${rec.priority === 'critical' 
                      ? 'bg-[rgba(255,77,109,0.05)] border-[rgba(255,77,109,0.3)] hover:border-[rgba(255,77,109,0.5)]'
                      : rec.priority === 'high'
                      ? 'bg-[rgba(255,184,0,0.05)] border-[rgba(255,184,0,0.3)] hover:border-[rgba(255,184,0,0.5)]'
                      : rec.priority === 'medium'
                      ? 'bg-primary/5 border-primary/25 hover:border-primary/50'
                      : 'bg-[rgba(0,255,163,0.05)] border-[rgba(0,255,163,0.3)] hover:border-[rgba(0,255,163,0.5)]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-foreground font-semibold">{rec.concept}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          rec.priority === 'critical' ? 'bg-[#FF4D6D] text-white' :
                          rec.priority === 'high' ? 'bg-[#FFB800] text-[#0B0F1A]' :
                          rec.priority === 'medium' ? 'bg-primary text-white' :
                          'bg-[#00FFA3] text-[#0B0F1A]'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Current strength: {rec.strength}%</p>
                    </div>
                    <div className="text-right">
                      <div className="w-4 h-4 inline mr-1">
                        <LottieIcon name="clock" size={16} />
                      </div>
                      <span className="text-sm text-muted-foreground">{rec.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rec.strength}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className="h-full"
                        style={{
                          background: rec.strength >= 80 ? '#00FFA3' : rec.strength >= 70 ? '#FFB800' : '#FF4D6D',
                        }}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReviewConcept({ label: rec.concept, strength: rec.strength })}
                      className="px-4 py-1 bg-gradient-to-r from-primary to-accent text-white text-sm rounded-md"
                    >
                      Start
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Week Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.25 }}
            className="soft-card p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-5 h-5">
                <LottieIcon name="calendar" size={20} />
              </div>
              Week Overview
            </h2>
            <div className="grid grid-cols-7 gap-1.5 md:gap-3">
              {weekSchedule.map((day, index) => {
                const isToday = index === todayIndex;
                const isCompleted = day.completed === day.sessions;
                
                return (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`
                      rounded-xl p-2 md:p-4 text-center cursor-pointer transition-all
                      ${isToday 
                        ? 'bg-gradient-to-br from-primary/15 to-accent/15 border-2 border-primary'
                        : 'bg-primary/5 border border-border hover:border-primary/40'
                      }
                    `}
                  >
                    <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">{day.day}</p>
                    <p className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2">{day.sessions}</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {isCompleted ? (
                        <div className="w-4 h-4">
                          <LottieIcon name="check" size={16} />
                        </div>
                      ) : day.completed > 0 ? (
                        <div className="w-4 h-4">
                          <LottieIcon name="alert" size={16} />
                        </div>
                      ) : (
                        <div className="w-4 h-4">
                          <LottieIcon name="clock" size={16} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{day.total} min</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Upcoming Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="soft-card p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-5 h-5">
              <LottieIcon name="chart" size={20} />
            </div>
            Milestones
          </h2>
          <div className="space-y-4">
            {upcomingMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-primary/5 border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-foreground font-semibold text-sm">{milestone.title}</h4>
                  <span className="text-xs text-muted-foreground">{milestone.dueDate}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-sm font-semibold text-primary">{milestone.progress}%</span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.progress}%` }}
                      transition={{ delay: 1.0 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Review Quiz Modal */}
      {reviewConcept && (
        <ReviewQuiz
          concept={reviewConcept.label}
          strength={reviewConcept.strength}
          onClose={() => setReviewConcept(null)}
          onComplete={() => {
            // Refresh the plan to reflect updated strengths
            fetchPlan();
          }}
        />
      )}
    </div>
  );
}
