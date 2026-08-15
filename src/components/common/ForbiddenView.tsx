import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../lib/permissions';

export interface ForbiddenViewProps {
  title?: string;
  description?: string;
  requiredRole?: string;
  onReturnDashboard?: () => void;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({
  title = '403 — Access Denied',
  description = 'You do not have the necessary role permissions to access this administrative page. If you require access, please contact your company administrator.',
  requiredRole = 'Administrator',
  onReturnDashboard,
}) => {
  const { user } = useAuth();
  const userRoleLabel = getRoleLabel(user?.role);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-lg text-center space-y-6">
        {/* Shield Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>

        {/* Role Comparison Badge Card */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-3 text-xs text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Your Current Role
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              {userRoleLabel}
            </span>
          </div>

          <div className="space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Required Role
            </span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              {requiredRole}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onReturnDashboard && (
            <Button
              variant="primary"
              onClick={onReturnDashboard}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Security Audit Ref: RBAC-403-DENIED</span>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenView;
