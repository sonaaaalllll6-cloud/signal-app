import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  delta: string;
}

const StatCard = ({ label, value, trend, delta }: StatCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      <div className="flex items-center gap-1 mt-2">
        {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-600" />}
        {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
        {trend === 'neutral' && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className={`text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
        }`}>{delta}</span>
      </div>
    </div>
  );
};

export default StatCard;
