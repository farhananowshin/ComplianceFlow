import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | { message?: string };
  successMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floatingLabel?: boolean;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  themeVariant?: 'default' | 'light';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      successMessage,
      leftIcon,
      rightIcon,
      floatingLabel = false,
      showPasswordToggle,
      clearable = false,
      onClear,
      themeVariant = 'default',
      className = '',
      id,
      type = 'text',
      required,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    // Normalize error message (supports string or Zod FieldError object)
    const errorMessage = typeof error === 'string' ? error : error?.message;

    const isPasswordType = type === 'password';
    const actualType = isPasswordType && showPassword ? 'text' : type;
    const shouldShowPasswordToggle = showPasswordToggle ?? isPasswordType;

    const hasValue = value !== undefined && value !== '' && value !== null;

    return (
      <div className="w-full space-y-1.5">
        {/* Standard Label */}
        {label && !floatingLabel && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className={`block text-xs font-bold tracking-tight ${
                themeVariant === 'light'
                  ? 'text-slate-900'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {label}
              {required && <span className="text-rose-500 font-bold ml-1" title="Required field">*</span>}
            </label>
            {required && (
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Required
              </span>
            )}
          </div>
        )}

        <div className="relative flex items-center group">
          {/* Left Icon */}
          {leftIcon && (
            <span className="absolute left-3 text-slate-500 dark:text-slate-400 pointer-events-none group-focus-within:text-slate-700 dark:group-focus-within:text-slate-300 transition-colors" aria-hidden="true">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            type={actualType}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            aria-invalid={!!errorMessage}
            aria-describedby={
              errorMessage
                ? `${inputId}-error`
                : successMessage
                ? `${inputId}-success`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={`w-full rounded-lg text-xs sm:text-sm bg-white border text-slate-900 ${
              themeVariant === 'light'
                ? 'placeholder-slate-400 border-slate-300'
                : 'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500'
            } transition-colors duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed ${
              errorMessage
                ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20'
                : successMessage
                ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/20'
                : 'border-slate-300 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-400 focus:ring-slate-900/10 dark:focus:ring-slate-100/10'
            } ${leftIcon ? 'pl-9' : 'pl-3.5'} ${
              shouldShowPasswordToggle || rightIcon || clearable ? 'pr-10' : 'pr-3.5'
            } py-2 ${floatingLabel ? 'pt-5 pb-1.5' : ''} ${className}`}
            {...props}
          />

          {/* Floating Label */}
          {label && floatingLabel && (
            <label
              htmlFor={inputId}
              className={`absolute left-3.5 transition-all duration-150 pointer-events-none text-xs ${
                hasValue || leftIcon
                  ? 'top-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300'
                  : 'top-2.5 text-slate-500 dark:text-slate-400'
              }`}
            >
              {label}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
          )}

          {/* Right Action Icons (Password Toggle, Clear, RightIcon) */}
          <div className="absolute right-3 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            {clearable && hasValue && onClear && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear text input"
                className="p-0.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                title="Clear input"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {shouldShowPasswordToggle ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 hover:text-slate-800 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            ) : (
              rightIcon
            )}
          </div>
        </div>

        {/* Validation & Helper Messages */}
        {errorMessage ? (
          <div id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        ) : successMessage ? (
          <div id={`${inputId}-success`} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

