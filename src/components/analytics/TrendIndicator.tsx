import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrendIndicatorProps {
  direction: 'improving' | 'declining' | 'stable' | 'new';
  scoreDelta?: number;
}

export function TrendIndicator({ direction, scoreDelta }: TrendIndicatorProps) {
  const getVariant = () => {
    switch (direction) {
      case 'improving':
        return 'success' as const;
      case 'declining':
        return 'warning' as const;
      case 'stable':
      case 'new':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getIcon = () => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="h-3 w-3" />;
      case 'declining':
        return <TrendingDown className="h-3 w-3" />;
      case 'stable':
        return <Minus className="h-3 w-3" />;
      case 'new':
        return null;
      default:
        return null;
    }
  };

  const getText = () => {
    switch (direction) {
      case 'improving':
        return scoreDelta ? `+${scoreDelta.toFixed(1)}` : 'Improving';
      case 'declining':
        return scoreDelta ? `-${Math.abs(scoreDelta).toFixed(1)}` : 'Declining';
      case 'stable':
        return 'No change';
      case 'new':
        return 'First assessment';
      default:
        return '';
    }
  };

  const getCustomClasses = () => {
    switch (direction) {
      case 'improving':
        return 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30';
      case 'declining':
        return 'text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/30';
      case 'new':
        return 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/30';
      default:
        return '';
    }
  };

  if (direction === 'improving' || direction === 'declining' || direction === 'new') {
    return (
      <Badge className={`inline-flex items-center gap-1 ${getCustomClasses()}`}>
        {getIcon()}
        {getText()}
      </Badge>
    );
  }

  return (
    <Badge variant={getVariant()} className="inline-flex items-center gap-1">
      {getIcon()}
      {getText()}
    </Badge>
  );
}