"use client";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatChartDate } from "@/lib/analytics/formatters";
import type { FamilyHistoricalAssessment } from "@/lib/family/types";

interface ScoreTrendChartProps {
  historicalAssessments: FamilyHistoricalAssessment[];
  advisorEmphasis: string[];
}

export function ScoreTrendChart({ historicalAssessments, advisorEmphasis }: ScoreTrendChartProps) {
  if (historicalAssessments.length < 2) {
    return (
      <div className="rounded-[1.5rem] border section-divider bg-background/55 px-6 py-10 text-center">
        <p className="text-sm leading-7 text-muted-foreground">
          Complete another annual assessment to see your improvement trends
        </p>
      </div>
    );
  }

  // Map assessments to chart data (reverse to show chronological order)
  const chartData = historicalAssessments
    .slice()
    .reverse()
    .map((assessment) => ({
      date: formatChartDate(assessment.completedAt),
      overallScore: assessment.overallScore,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}/10`, 'Score']}
          labelFormatter={(label) => `Assessment: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="overallScore"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}