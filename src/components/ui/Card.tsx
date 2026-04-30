import { cn } from './cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({
  children,
  className,
  interactive = false,
  onClick,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-border rounded-lg',
        paddingStyles[padding],
        interactive && 'cursor-pointer transition-all duration-200',
        interactive && 'hover:border-border-focus hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string;
  trend?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('animate-on-load', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-text-muted mt-1">{trend}</p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBgColor)}>
          <span className={cn('scale-110', iconColor)}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}