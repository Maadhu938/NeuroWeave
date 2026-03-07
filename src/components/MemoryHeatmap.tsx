import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { getMemoryHeatmap, type TopicStrength } from '@/lib/api';

export function MemoryHeatmap() {
  const [topicStrengths, setTopicStrengths] = useState<TopicStrength[]>([]);

  useEffect(() => {
    getMemoryHeatmap()
      .then(setTopicStrengths)
      .catch(() => { /* API not available yet */ });
  }, []);

  const getColorClass = (strength: number) => {
    if (strength >= 85) return 'from-[#00FFA3] to-[#00CC82]'; // Green - strong
    if (strength >= 70) return 'from-[#FFB800] to-[#FF8C00]'; // Yellow - moderate
    if (strength >= 60) return 'from-[#FF8C00] to-[#FF4D6D]'; // Orange - weak
    return 'from-[#FF4D6D] to-[#CC0033]'; // Red - critical
  };

  const getIcon = (strength: number) => {
    if (strength >= 85) return <CheckCircle className="w-4 h-4 text-[#00FFA3]" />;
    if (strength >= 70) return <TrendingUp className="w-4 h-4 text-[#FFB800]" />;
    return <AlertTriangle className="w-4 h-4 text-[#FF4D6D]" />;
  };

  const getCategoryStats = (category: string) => {
    return topicStrengths.filter(t => t.category === category).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#4F8CFF]" />
          Memory Strength Heatmap
        </h2>
        <p className="text-sm text-[#8B92A8]">NAMA Algorithm Output - Topic Mastery Levels</p>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
        <div className="bg-[rgba(0,255,163,0.1)] border border-[rgba(0,255,163,0.2)] rounded-lg p-3">
          <p className="text-xs text-[#8B92A8] mb-1">Strong (85%+)</p>
          <p className="text-2xl font-bold text-[#00FFA3]">{getCategoryStats('strong')}</p>
        </div>
        <div className="bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.2)] rounded-lg p-3">
          <p className="text-xs text-[#8B92A8] mb-1">Moderate (70-84%)</p>
          <p className="text-2xl font-bold text-[#FFB800]">{getCategoryStats('moderate')}</p>
        </div>
        <div className="bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.2)] rounded-lg p-3">
          <p className="text-xs text-[#8B92A8] mb-1">Weak (60-69%)</p>
          <p className="text-2xl font-bold text-[#FF4D6D]">{getCategoryStats('weak')}</p>
        </div>
        <div className="bg-[rgba(204,0,51,0.1)] border border-[rgba(204,0,51,0.2)] rounded-lg p-3">
          <p className="text-xs text-[#8B92A8] mb-1">Critical (&lt;60%)</p>
          <p className="text-2xl font-bold text-[#CC0033]">{getCategoryStats('critical')}</p>
        </div>
      </div>

      {/* Topic Strength Bars */}
      <div className="space-y-3">
        {topicStrengths.map((topic, index) => (
          <motion.div
            key={topic.topic}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {getIcon(topic.strength)}
                <span className="text-sm text-white font-medium">{topic.topic}</span>
              </div>
              <span className="text-sm font-bold" style={{
                color: topic.strength >= 85 ? '#00FFA3' : 
                       topic.strength >= 70 ? '#FFB800' : 
                       topic.strength >= 60 ? '#FF8C00' : '#FF4D6D'
              }}>
                {topic.strength}%
              </span>
            </div>
            
            <div className="relative h-8 bg-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${topic.strength}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.8, ease: 'easeOut' }}
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColorClass(topic.strength)} group-hover:shadow-lg transition-shadow`}
                style={{
                  boxShadow: `0 0 20px ${topic.strength >= 85 ? '#00FFA3' : 
                                         topic.strength >= 70 ? '#FFB800' : 
                                         topic.strength >= 60 ? '#FF8C00' : '#FF4D6D'}40`
                }}
              />
              
              {/* Percentage markers */}
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <div className="w-full flex justify-between text-[10px] text-[#8B92A8] font-mono">
                  <span className={topic.strength > 10 ? 'opacity-0' : ''}>0</span>
                  <span className={topic.strength < 20 || topic.strength > 30 ? 'opacity-0' : ''}>25</span>
                  <span className={topic.strength < 45 || topic.strength > 55 ? 'opacity-0' : ''}>50</span>
                  <span className={topic.strength < 70 || topic.strength > 80 ? 'opacity-0' : ''}>75</span>
                  <span className={topic.strength < 95 ? 'opacity-0' : ''}>100</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-[rgba(79,140,255,0.2)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00FFA3]" />
          <span className="text-[#8B92A8]">Strong Memory</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FFB800]" />
          <span className="text-[#8B92A8]">Good Retention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF8C00]" />
          <span className="text-[#8B92A8]">Needs Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF4D6D]" />
          <span className="text-[#8B92A8]">Critical</span>
        </div>
      </div>
    </motion.div>
  );
}
