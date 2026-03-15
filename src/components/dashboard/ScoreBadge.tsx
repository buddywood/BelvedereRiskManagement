interface ScoreBadgeProps {
  score: number | null;
  riskLevel: string | null;
}

export function ScoreBadge({ score, riskLevel }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span className="text-sm text-muted-foreground">
        No assessment
      </span>
    );
  }

  const getRiskColorClasses = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30';
      default:
        return 'text-muted-foreground bg-muted/50';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${getRiskColorClasses(riskLevel || '')}`} />
      <span className="text-sm font-medium">
        {score.toFixed(1)}
      </span>
    </div>
  );
}