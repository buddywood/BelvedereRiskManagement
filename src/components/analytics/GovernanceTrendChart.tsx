"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './ChartContainer';
import { formatChartDate } from '@/lib/analytics/formatters';
import { CHART_COLORS } from '@/lib/analytics/formatters';
import type { GovernanceTrendPoint } from '@/lib/analytics/types';

interface GovernanceTrendChartProps {
  data: GovernanceTrendPoint[];
}

export function GovernanceTrendChart({ data }: GovernanceTrendChartProps) {
  if (data.length < 2) {
    return (
      <ChartContainer title="Governance Score Trend">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Complete more assessments to see trends
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Governance Score Trend">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        aria-label="Governance score trend over time"
      >
        <XAxis
          dataKey="date"
          tickFormatter={formatChartDate}
        />
        <YAxis
          domain={[0, 10]}
          label={{ value: 'Governance Score', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: any) => [typeof value === 'number' ? value.toFixed(1) : value, 'Score']}
          labelFormatter={(label: any) => typeof label === 'string' ? formatChartDate(label) : label}
        />
        <Line
          type="monotone"
          dataKey="overallScore"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}