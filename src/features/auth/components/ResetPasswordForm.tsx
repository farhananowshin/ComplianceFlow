import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, KeyRound, AlertCircle, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import apiClient from '../../../lib/api-client';
import toast from 'react-hot-toast';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  prefilledToken?: string;
  onNavigateLogin: () => void;
  onSuccess?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  prefilledToken,
  onNavigateLogin,
  onSuccess,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: prefilledToken || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('newPassword', '');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setErrorMessage(null);
      await apiClient.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      });

      setIsSuccess(true);
      toast.success('Your password has been successfully reset!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password. Token may be invalid or expired.';
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password Reset Complete!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your corporate account password has been updated securely. You can now log in with your new credentials.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={onNavigateLogin}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In with New Password
          </Button>
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
            <p className="font-semibold">Reset Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Token Input */}
        <div>
          <Input
            label="Reset Token"
            placeholder="Paste your reset token..."
            themeVariant="light"
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
            error={errors.token?.message}
            {...register('token')}
          />
        </div>

        {/* New Password & Confirm Password */}
        <div className="space-y-3">
          <div>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              themeVariant="light"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.newPassword?.message}
              showPasswordToggle
              {...register('newPassword')}
            />
          </div>

          <div>
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              themeVariant="light"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.confirmPassword?.message}
              showPasswordToggle
              {...register('confirmPassword')}
            />
          </div>

          {/* Password Strength Meter */}
          <PasswordStrengthIndicator password={currentPassword} />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          className="mt-2"
        >
          {isSubmitting ? 'Updating Password...' : 'Reset & Save Password'}
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

export default ResetPasswordForm;
