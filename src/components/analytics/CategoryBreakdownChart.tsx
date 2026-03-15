"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from './ChartContainer';
import type { CategoryBreakdownPoint } from '@/lib/analytics/types';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownPoint[];
  title?: string;
}

export function CategoryBreakdownChart({ data, title = "Governance Category Breakdown" }: CategoryBreakdownChartProps) {
  const getBarColor = (score: number): string => {
    if (score >= 7) return '#22c55e'; // green
    if (score >= 5) return '#f59e0b'; // amber
    if (score >= 3) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <ChartContainer title={title}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
      >
        <XAxis
          dataKey="categoryName"
          angle={-35}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis
          domain={[0, 10]}
          label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: any) => [typeof value === 'number' ? value.toFixed(1) : value, 'Score']}
          labelFormatter={(label: any) => label}
        />
        <Bar dataKey="score">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}