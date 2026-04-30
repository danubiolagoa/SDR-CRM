import { cn } from './cn';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'etapa';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  etapaName?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-600',
  etapa: '', // Dynamic based on etapaName
};

const etapaColors: Record<string, string> = {
  'Base': 'bg-slate-100 text-slate-700',
  'Lead Mapeado': 'bg-blue-100 text-blue-700',
  'Tentando Contato': 'bg-amber-100 text-amber-700',
  'Conexão Iniciada': 'bg-violet-100 text-violet-700',
  'Desqualificado': 'bg-red-100 text-red-700',
  'Qualificado': 'bg-emerald-100 text-emerald-700',
  'Reunião Agendada': 'bg-cyan-100 text-cyan-700',
};

export function Badge({ children, variant = 'default', etapaName, className }: BadgeProps) {
  const etapaStyle = variant === 'etapa' && etapaName ? etapaColors[etapaName] || 'bg-gray-100 text-gray-600' : '';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'etapa' ? etapaStyle : variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export interface CountBadgeProps {
  count: number;
  className?: string;
}

export function CountBadge({ count, className }: CountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full',
        'bg-background-tertiary text-text-secondary text-xs font-medium',
        className
      )}
    >
      {count}
    </span>
  );
}