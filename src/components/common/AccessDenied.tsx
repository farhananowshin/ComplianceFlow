import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  requiredRole?: string;
  onReturnHome?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = '403 — Access Denied',
  message = 'You do not have the required role permissions to view this section or perform this action.',
  requiredRole,
  onReturnHome,
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl flex flex-col items-center"
      >
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-800 text-rose-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-white font-display tracking-tight mb-2">
          {title}
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          {message}
          {requiredRole && (
            <span className="block mt-2 font-medium text-amber-400">
              Required access level: {requiredRole}
            </span>
          )}
        </p>

        {onReturnHome && (
          <Button
            variant="primary"
            size="sm"
            onClick={onReturnHome}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Return to Dashboard
          </Button>
        )}
      </motion.div>
    </div>
  );
};
