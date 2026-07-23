import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, Info } from 'lucide-react';
import { getMemoryDecay, type DecayDataPoint } from '@/lib/api';

interface MemoryDecayChartProps {
  concept?: string;
}

export function MemoryDecayChart({ concept = 'Selected Concept' }: MemoryDecayChartProps) {
  const [decayData, setDecayData] = useState<DecayDataPoint[]>([]);

  useEffect(() => {
    if (!concept || concept === 'Selected Concept') return;
    getMemoryDecay(concept)
      .then(setDecayData)
      .catch(() => { /* API not available – keep empty */ });
  }, [concept]);

  // Use backend-provided decay curve directly (already NAMA-aligned)
  const displayData = decayData.map((point) => ({
    ...point,
    strength: Math.max(0.0, Math.min(1.0, point.strength)),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-semibold">Day {data.day}</p>
          <p className="text-primary">
            Memory Strength: {(data.strength * 100).toFixed(1)}%
          </p>
          {data.reviewed && (
            <p className="text-[#00FFA3] text-xs mt-1">✓ Reviewed</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="soft-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            Memory Decay Curve
          </h2>
          <p className="text-sm text-muted-foreground">
            NAMA Algorithm prediction for: {concept}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={displayData}>
          <defs>
            <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="day" 
            stroke="var(--muted-foreground)"
            label={{ value: 'Days Since Learning', position: 'insideBottom', offset: -5, fill: 'var(--muted-foreground)' }}
          />
          <YAxis 
            stroke="var(--muted-foreground)"
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1.0]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            label={{ value: 'Memory Strength', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Critical threshold line */}
          <ReferenceLine 
            y={0.3} 
            stroke="#FF4D6D" 
            strokeDasharray="5 5"
            label={{ value: 'Critical Review Needed', position: 'right', fill: '#FF4D6D', fontSize: 12 }}
          />
          
          <Line
            type="monotone"
            dataKey="strength"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload, index } = props;
              if (payload.reviewed) {
                return (
                  <g key={`dot-${index}`}>
                    <circle cx={cx} cy={cy} r={6} fill="#00FFA3" stroke="#00FFA3" strokeWidth={2} />
                    <circle cx={cx} cy={cy} r={10} fill="none" stroke="#00FFA3" strokeWidth={1} opacity={0.3} />
                  </g>
                );
              }
              return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="var(--primary)" />;
            }}
            activeDot={{ r: 8, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-primary/10 border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Current Strength</p>
          <p className="text-lg font-bold text-primary">
            {displayData.length > 0 ? (displayData[displayData.length - 1].strength * 100).toFixed(1) : '--'}%
          </p>
        </div>
        <div className="bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.2)] rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Projection</p>
          <p className="text-lg font-bold text-[#FFB800]">{displayData.length > 0 ? displayData.length - 1 : '--'} days</p>
        </div>
        <div className="bg-[rgba(0,255,163,0.1)] border border-[rgba(0,255,163,0.2)] rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Reviews</p>
          <p className="text-lg font-bold text-[#00FFA3]">
            {displayData.filter(p => p.reviewed).length}
          </p>
        </div>
      </div>

      <div className="mt-4 bg-primary/5 border border-border rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-primary font-semibold">NAMA Algorithm:</span> Memory strength decays exponentially over time. 
          Green dots indicate review sessions that reset memory strength. Review before reaching the critical threshold (red line) 
          to prevent significant knowledge loss.
        </p>
      </div>
    </motion.div>
  );
}
