import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const styles: Record<RiskLevel, { bg: string; dot: string; label: string }> = {
    low: {
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      dot: 'bg-slate-400',
      label: 'Low Risk'
    },
    medium: {
      bg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      dot: 'bg-blue-500',
      label: 'Medium Risk'
    },
    high: {
      bg: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      dot: 'bg-amber-500',
      label: 'High Risk'
    },
    critical: {
      bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-semibold',
      dot: 'bg-rose-600 animate-pulse',
      label: 'Critical Risk'
    }
  };

  const current = styles[level] || styles.low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
