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
        <div className="bg-[#131824] border border-[rgba(79,140,255,0.3)] rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">Day {data.day}</p>
          <p className="text-[#4F8CFF]">
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
      className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#FF4D6D]" />
            Memory Decay Curve
          </h2>
          <p className="text-sm text-[#8B92A8]">
            NAMA Algorithm prediction for: {concept}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={displayData}>
          <defs>
            <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,140,255,0.1)" />
          <XAxis 
            dataKey="day" 
            stroke="#8B92A8"
            label={{ value: 'Days Since Learning', position: 'insideBottom', offset: -5, fill: '#8B92A8' }}
          />
          <YAxis 
            stroke="#8B92A8"
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1.0]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            label={{ value: 'Memory Strength', angle: -90, position: 'insideLeft', fill: '#8B92A8' }}
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
            stroke="#4F8CFF"
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
              return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="#4F8CFF" />;
            }}
            activeDot={{ r: 8, fill: '#4F8CFF', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-[rgba(79,140,255,0.1)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3">
          <p className="text-xs text-[#8B92A8] mb-1">Current Strength</p>
          <p className="text-lg font-bold text-[#4F8CFF]">
            {displayData.length > 0 ? (displayData[displayData.length - 1].strength * 100).toFixed(1) : '--'}%
          </p>
        </div>
        <div className="bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.2)] rounded-lg p-3">
          <p className="text-xs text-[#8B92A8] mb-1">Projection</p>
          <p className="text-lg font-bold text-[#FFB800]">{displayData.length > 0 ? displayData.length - 1 : '--'} days</p>
        </div>
        <div className="bg-[rgba(0,255,163,0.1)] border border-[rgba(0,255,163,0.2)] rounded-lg p-3">
          <p className="text-xs text-[#8B92A8] mb-1">Reviews</p>
          <p className="text-lg font-bold text-[#00FFA3]">
            {displayData.filter(p => p.reviewed).length}
          </p>
        </div>
      </div>

      <div className="mt-4 bg-[rgba(79,140,255,0.05)] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#4F8CFF] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#8B92A8] leading-relaxed">
          <span className="text-[#4F8CFF] font-semibold">NAMA Algorithm:</span> Memory strength decays exponentially over time. 
          Green dots indicate review sessions that reset memory strength. Review before reaching the critical threshold (red line) 
          to prevent significant knowledge loss.
        </p>
      </div>
    </motion.div>
  );
}
