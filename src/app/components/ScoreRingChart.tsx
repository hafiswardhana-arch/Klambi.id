'use client';
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface ScoreRingChartProps {
  score: number;
  size?: number;
}

export default function ScoreRingChart({ score, size = 80 }: ScoreRingChartProps) {
  const color =
    score >= 80 ? 'var(--primary)' :
    score >= 60 ? 'var(--accent)' :
    score >= 40 ? 'var(--warning)' : 'var(--danger)';

  const data = [{ value: score, fill: color }];

  return (
    <div style={{ width: size, height: size }} className="flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
          barSize={6}
        >
          <RadialBar
            background={{ fill: 'var(--muted)' }}
            dataKey="value"
            cornerRadius={4}
            max={100}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}