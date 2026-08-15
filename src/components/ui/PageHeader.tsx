import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  children,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight font-display">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {(action || children) && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {action}
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

