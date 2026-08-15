import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorTheme?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = 'indigo',
  onClick
}) => {
  const themes = {
    indigo: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
      accent: 'text-blue-600 dark:text-blue-400'
    },
    emerald: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    amber: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
      accent: 'text-amber-600 dark:text-amber-400'
    },
    rose: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
      accent: 'text-rose-600 dark:text-rose-400'
    },
    blue: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
      accent: 'text-blue-600 dark:text-blue-400'
    },
    slate: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      accent: 'text-slate-700 dark:text-slate-300'
    }
  };

  const t = themes[colorTheme] || themes.indigo;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-lg border ${t.bg} ${t.border} shadow-sm transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </span>
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${t.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
