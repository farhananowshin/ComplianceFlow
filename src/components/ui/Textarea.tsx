import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string | { message?: string };
  successMessage?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, successMessage, className = '', id, required, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight"
            >
              {label}
              {required && <span className="text-rose-500 font-bold ml-1" title="Required field">*</span>}
            </label>
            {required && (
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Required
              </span>
            )}
          </div>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          aria-invalid={!!errorMessage}
          aria-describedby={
            errorMessage
              ? `${textareaId}-error`
              : successMessage
              ? `${textareaId}-success`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          className={`w-full rounded-lg text-xs sm:text-sm bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 shadow-2xs transition-all duration-150 focus:outline-none focus-visible:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800/60 disabled:text-slate-400 disabled:cursor-not-allowed px-3.5 py-2.5 ${
            errorMessage
              ? 'border-rose-500/80 dark:border-rose-500/80 focus:border-rose-500 focus-visible:ring-rose-500/30 bg-rose-50/10'
              : successMessage
              ? 'border-emerald-500/80 dark:border-emerald-500/80 focus:border-emerald-500 focus-visible:ring-emerald-500/30'
              : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus-visible:ring-blue-500/30'
          } ${className}`}
          {...props}
        />

        {errorMessage ? (
          <div id={`${textareaId}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        ) : successMessage ? (
          <div id={`${textareaId}-success`} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
