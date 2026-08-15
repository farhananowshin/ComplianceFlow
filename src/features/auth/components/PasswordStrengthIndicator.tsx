import React from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordStrengthIndicatorProps {
  password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
}) => {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One number (0-9)', met: /\d/.test(password) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  const getStrengthLabel = () => {
    if (!password) return { text: 'Empty', color: 'bg-slate-200 dark:bg-slate-700', textCol: 'text-slate-400' };
    if (score <= 2) return { text: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-500' };
    if (score <= 4) return { text: 'Medium', color: 'bg-amber-500', textCol: 'text-amber-500' };
    return { text: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-500' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-2 mt-2 select-none">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Password Strength:</span>
        <span className={`font-bold ${strength.textCol}`}>{strength.text}</span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= level ? strength.color : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span
              className={
                c.met
                  ? 'text-slate-700 dark:text-slate-300 font-medium'
                  : 'text-slate-400 dark:text-slate-500'
              }
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
