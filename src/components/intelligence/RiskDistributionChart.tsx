"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer } from "@/components/analytics/ChartContainer";
import { CATEGORY_LABELS } from "@/lib/analytics/formatters";

interface RiskDistributionChartProps {
  risksByCategory: Record<string, number>;
}

export function RiskDistributionChart({ risksByCategory }: RiskDistributionChartProps) {
  // Convert the record to chart data format
  const chartData = Object.entries(risksByCategory).map(([categorySlug, count]) => ({
    category: CATEGORY_LABELS[categorySlug] || categorySlug,
    count,
  })).filter(item => item.count > 0); // Only show categories with risks

  // Check if all counts are 0
  const totalRisks = Object.values(risksByCategory).reduce((sum, count) => sum + count, 0);

  if (totalRisks === 0 || chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No risks to display</p>
      </div>
    );
  }

  // Sort by count descending
  chartData.sort((a, b) => b.count - a.count);

  // Color the bars based on risk count intensity
  const getBarColor = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#ef4444'; // Red for high risk counts
    if (intensity > 0.4) return '#f97316'; // Orange for moderate risk counts
    return '#3b82f6'; // Blue for low risk counts
  };

  const maxCount = Math.max(...chartData.map(d => d.count));

  // Create data with colors
  const dataWithColors = chartData.map(item => ({
    ...item,
    fill: getBarColor(item.count, maxCount)
  }));

  return (
    <ChartContainer title="Risk by Category">
      <BarChart
        data={dataWithColors}
        layout="horizontal"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="category"
          width={70}
          fontSize={12}
        />
        <Tooltip
          labelFormatter={(label) => `${label}`}
          formatter={(value, name) => [`${value} risks`, 'Count']}
        />
        <Bar
          dataKey="count"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}