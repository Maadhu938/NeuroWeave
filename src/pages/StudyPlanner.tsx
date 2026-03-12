import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Target, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Adaptive Study Planner</h1>
          <p className="text-sm text-[#8B92A8]">AI-generated learning schedule optimized for retention</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchPlan}
          className="bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] px-5 py-2.5 md:px-6 md:py-3 rounded-lg flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(79,140,255,0.3)] self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <span className="text-white text-sm md:text-base">{loading ? 'Refreshing...' : 'Generate New Plan'}</span>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[rgba(79,140,255,0.2)]">
              <Target className="w-5 h-5 text-[#4F8CFF]" />
            </div>
            <span className="text-sm text-[#8B92A8]">This Week</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalReviews} reviews</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[rgba(0,255,163,0.2)]">
              <CheckCircle className="w-5 h-5 text-[#00FFA3]" />
            </div>
            <span className="text-sm text-[#8B92A8]">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.completed} / {stats.totalReviews}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[rgba(255,184,0,0.2)]">
              <Clock className="w-5 h-5 text-[#FFB800]" />
            </div>
            <span className="text-sm text-[#8B92A8]">Time Spent</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.timeSpent}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[rgba(122,92,255,0.2)]">
              <TrendingUp className="w-5 h-5 text-[#7A5CFF]" />
            </div>
            <span className="text-sm text-[#8B92A8]">Avg. Score</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.avgScore}%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Recommendations */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#4F8CFF]" />
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
                      ? 'bg-[rgba(79,140,255,0.05)] border-[rgba(79,140,255,0.3)] hover:border-[rgba(79,140,255,0.5)]'
                      : 'bg-[rgba(0,255,163,0.05)] border-[rgba(0,255,163,0.3)] hover:border-[rgba(0,255,163,0.5)]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{rec.concept}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          rec.priority === 'critical' ? 'bg-[#FF4D6D] text-white' :
                          rec.priority === 'high' ? 'bg-[#FFB800] text-[#0B0F1A]' :
                          rec.priority === 'medium' ? 'bg-[#4F8CFF] text-white' :
                          'bg-[#00FFA3] text-[#0B0F1A]'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-[#8B92A8]">Current strength: {rec.strength}%</p>
                    </div>
                    <div className="text-right">
                      <Clock className="w-4 h-4 text-[#8B92A8] inline mr-1" />
                      <span className="text-sm text-[#8B92A8]">{rec.time}</span>
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
                      className="px-4 py-1 bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white text-sm rounded-md"
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
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#7A5CFF]" />
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
                        ? 'bg-gradient-to-br from-[rgba(79,140,255,0.2)] to-[rgba(122,92,255,0.2)] border-2 border-[#4F8CFF]'
                        : 'bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] hover:border-[rgba(79,140,255,0.4)]'
                      }
                    `}
                  >
                    <p className="text-xs md:text-sm text-[#8B92A8] mb-1 md:mb-2">{day.day}</p>
                    <p className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{day.sessions}</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-[#00FFA3]" />
                      ) : day.completed > 0 ? (
                        <AlertCircle className="w-4 h-4 text-[#FFB800]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#8B92A8]" />
                      )}
                    </div>
                    <p className="text-xs text-[#8B92A8]">{day.total} min</p>
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
          className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
            Milestones
          </h2>
          <div className="space-y-4">
            {upcomingMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white font-semibold text-sm">{milestone.title}</h4>
                  <span className="text-xs text-[#8B92A8]">{milestone.dueDate}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8B92A8]">Progress</span>
                    <span className="text-sm font-semibold text-[#4F8CFF]">{milestone.progress}%</span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.progress}%` }}
                      transition={{ delay: 1.0 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF]"
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
