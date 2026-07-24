import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { type AIInsight } from '@/lib/api';

interface InsightDisplay extends AIInsight {
  icon: React.ReactNode;
}

interface AIInsightCardsProps {
  insights?: AIInsight[];
}

const iconMap: Record<string, React.ReactNode> = {
  warning: <AlertCircle className="w-5 h-5" />,
  success: <TrendingUp className="w-5 h-5" />,
  suggestion: <Lightbulb className="w-5 h-5" />,
  info: <Target className="w-5 h-5" />,
};

export function AIInsightCards({ insights: propInsights }: AIInsightCardsProps = {}) {
  const [insights, setInsights] = useState<InsightDisplay[]>([]);

  useEffect(() => {
    if (propInsights) {
      setInsights(propInsights.map((item) => ({ ...item, icon: iconMap[item.type] ?? iconMap.info })));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { getAIInsights } = await import('@/lib/api');
        const data = await getAIInsights();
        if (cancelled) return;
        setInsights(data.map((item) => ({ ...item, icon: iconMap[item.type] ?? iconMap.info })));
      } catch {
        // ignore
      }
    })();

    return () => { cancelled = true; };
  }, [propInsights]);

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'from-[rgba(255,77,109,0.05)] to-[rgba(255,77,109,0.1)]',
          border: 'border-[rgba(255,77,109,0.3)]',
          iconBg: 'bg-[rgba(255,77,109,0.2)]',
          iconColor: 'text-destructive',
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
          bg: 'from-accent/5 to-accent/10',
          border: 'border-accent/25',
          iconBg: 'bg-accent/15',
          iconColor: 'text-accent',
        };
      default:
        return {
          bg: 'from-primary/5 to-primary/10',
          border: 'border-primary/25',
          iconBg: 'bg-primary/15',
          iconColor: 'text-primary',
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
                <h3 className="text-foreground font-semibold mb-1.5 text-sm">{insight.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
