import React from 'react';
import { ComplianceStatus } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplianceStatus | 'renewed' | 'active' | 'expiring' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold'
  };

  const config: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    compliant: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900/60',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      label: 'Active'
    },
    active: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900/60',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      label: 'Active'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900/60',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      label: 'Expiring Soon'
    },
    expiring: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900/60',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      label: 'Expiring Soon'
    },
    expired: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-900/60',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
      label: 'Expired'
    },
    renewed: {
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-900/60',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
      label: 'Renewed'
    }
  };

  const item = config[status] || config.compliant;

  return (
    <span className={`inline-flex items-center rounded-full border ${item.bg} ${item.text} ${item.border} ${sizeClasses[size]}`}>
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};
