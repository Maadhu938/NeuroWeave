import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { getAIInsights, type AIInsight } from '@/lib/api';

interface InsightDisplay extends AIInsight {
  icon: React.ReactNode;
}

export function AIInsightCards() {
  const [insights, setInsights] = useState<InsightDisplay[]>([]);

  useEffect(() => {
    getAIInsights()
      .then((data) => {
        const iconMap: Record<string, React.ReactNode> = {
          warning: <AlertCircle className="w-5 h-5" />,
          success: <TrendingUp className="w-5 h-5" />,
          suggestion: <Lightbulb className="w-5 h-5" />,
          info: <Target className="w-5 h-5" />,
        };
        setInsights(data.map((item) => ({ ...item, icon: iconMap[item.type] ?? iconMap.info })));
      })
      .catch(() => { /* API not available yet */ });
  }, []);

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'from-[rgba(255,77,109,0.05)] to-[rgba(255,77,109,0.1)]',
          border: 'border-[rgba(255,77,109,0.3)]',
          iconBg: 'bg-[rgba(255,77,109,0.2)]',
          iconColor: 'text-[#FF4D6D]',
        };
      case 'success':
        return {
          bg: 'from-[rgba(0,255,163,0.05)] to-[rgba(0,255,163,0.1)]',
          border: 'border-[rgba(0,255,163,0.3)]',
          iconBg: 'bg-[rgba(0,255,163,0.2)]',
          iconColor: 'text-[#00FFA3]',
        };
      case 'suggestion':
        return {
          bg: 'from-[rgba(122,92,255,0.05)] to-[rgba(122,92,255,0.1)]',
          border: 'border-[rgba(122,92,255,0.3)]',
          iconBg: 'bg-[rgba(122,92,255,0.2)]',
          iconColor: 'text-[#7A5CFF]',
        };
      default:
        return {
          bg: 'from-[rgba(79,140,255,0.05)] to-[rgba(79,140,255,0.1)]',
          border: 'border-[rgba(79,140,255,0.3)]',
          iconBg: 'bg-[rgba(79,140,255,0.2)]',
          iconColor: 'text-[#4F8CFF]',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight, index) => {
        const style = getCardStyle(insight.type);
        return (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`bg-gradient-to-br ${style.bg} border ${style.border} rounded-xl p-5 cursor-pointer`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 ${style.iconBg} rounded-lg flex-shrink-0`}>
                <div className={style.iconColor}>{insight.icon}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1.5 text-sm">{insight.title}</h3>
                <p className="text-[#8B92A8] text-xs leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
