import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
  error?: string | { message?: string };
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, required, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="space-y-1">
        <label htmlFor={checkboxId} className="flex items-start gap-2.5 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              required={required}
              aria-invalid={!!errorMessage}
              className={`peer appearance-none w-4 h-4 rounded-md bg-white dark:bg-slate-900 border transition-all duration-150 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                errorMessage
                  ? 'border-rose-500 dark:border-rose-500/80'
                  : 'border-slate-300 dark:border-slate-700 group-hover:border-slate-400'
              } ${className}`}
              {...props}
            />
            <Check className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>

          <div className="text-xs">
            {label && (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {label}
                {required && <span className="text-rose-500 font-bold ml-1">*</span>}
              </span>
            )}
            {description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                {description}
              </p>
            )}
          </div>
        </label>

        {errorMessage && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 pl-6 animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
