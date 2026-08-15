import React, { memo } from 'react';
import Card from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'blue',
}) => {
  const iconBg = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20',
  };

  const topBarBg = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400 dark:bg-slate-600',
  };

  return (
    <Card className="p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/40 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200/90 dark:border-slate-800">
      {/* Top subtle color indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${topBarBg[variant]} opacity-80 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight font-display">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className={`p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${iconBg[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Decorative Sparkline Graphic */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span className="flex items-center gap-1 font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Metrics
        </span>
        <svg className="w-16 h-4 text-slate-300 dark:text-slate-700 stroke-current fill-none" viewBox="0 0 60 16">
          <path d="M0 12 L10 10 L20 14 L30 6 L40 9 L50 2 L60 5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
