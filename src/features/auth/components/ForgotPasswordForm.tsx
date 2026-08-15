import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import apiClient from '../../../lib/api-client';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid work email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  onNavigateLogin: () => void;
  onNavigateResetPassword: (prefilledToken?: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onNavigateLogin,
  onNavigateResetPassword,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setErrorMessage(null);
      const res: any = await apiClient.post('/auth/forgot-password', { email: data.email });

      setIsSuccess(true);
      if (res && res.data && res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
      toast.success('Password reset instructions dispatched.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to request password reset.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check Your Inbox</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            We sent password reset instructions to <span className="font-semibold text-slate-800 dark:text-slate-200">{getValues('email')}</span>.
          </p>
        </div>

        {resetToken && (
          <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              <KeyRound className="w-4 h-4" />
              <span>Development Reset Token</span>
            </div>
            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-blue-100 dark:border-blue-900 break-all select-all">
              {resetToken}
            </p>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={() => onNavigateResetPassword(resetToken || undefined)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Reset Password
          </Button>

          <button
            type="button"
            onClick={onNavigateLogin}
            className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-semibold">Reset Request Failed</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Work Email Address"
            type="email"
            placeholder="admin@bengalmanufacturing.com.bd"
            themeVariant="light"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          className="mt-2"
        >
          {isSubmitting ? 'Sending Request...' : 'Send Password Reset Link'}
        </Button>
      </form>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Sign In
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
