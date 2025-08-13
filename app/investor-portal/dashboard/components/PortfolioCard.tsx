import { Card, CardContent } from '@/components/ui/Card';

interface PortfolioCardProps {
  title: string;
  value: number;
  change?: number;
  currency?: string;
}

export default function PortfolioCard({ title, value, change, currency = 'USD' }: PortfolioCardProps) {
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isPositive = change !== undefined && change >= 0;

  return (
    <Card variant="glass" hover glow>
      <CardContent>
        <dt className="text-sm font-medium text-text-secondary truncate">
          {title}
        </dt>
        <dd className="mt-3">
          <span className="text-3xl font-bold text-text-primary">
            {formatValue(value)}
          </span>
        </dd>
        {change !== undefined && (
          <dd className="mt-3 flex items-center space-x-2">
            <span 
              className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${isPositive 
                  ? 'bg-success-500/20 text-success-400' 
                  : 'bg-error-500/20 text-error-400'
                }
              `}
            >
              <span className="mr-1">
                {isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-text-tertiary">
              vs last quarter
            </span>
          </dd>
        )}
      </CardContent>
    </Card>
  );
}