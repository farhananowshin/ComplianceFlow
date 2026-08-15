import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Building2, Key, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import apiClient from '../../../lib/api-client';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    mode: z.enum(['create', 'join']),
    name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Work email is required')
      .email('Please enter a valid work email address'),
    companyName: z.string().optional(),
    companyCode: z.string().optional(),
    companyInfo: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service to proceed',
    }),
  })
  .refine(
    (data) => {
      if (data.mode === 'create' && (!data.companyName || data.companyName.trim().length < 2)) {
        return false;
      }
      return true;
    },
    {
      message: 'Company name is required to create a new company',
      path: ['companyName'],
    }
  )
  .refine(
    (data) => {
      if (data.mode === 'join' && (!data.companyCode || data.companyCode.trim().length < 2)) {
        return false;
      }
      return true;
    },
    {
      message: 'Company Code is required to join an existing company',
      path: ['companyCode'],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onNavigateLogin?: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateLogin, onSuccess }) => {
  const { login } = useAuth();
  const [regMode, setRegMode] = useState<'create' | 'join'>('create');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      mode: 'create',
      name: '',
      email: '',
      companyName: '',
      companyCode: '',
      companyInfo: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const currentPassword = watch('password', '');

  const handleModeSwitch = (mode: 'create' | 'join') => {
    setRegMode(mode);
    setValue('mode', mode);
    setErrorMessage(null);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null);

      // Determine company name based on mode
      const companyIdentifier =
        data.mode === 'create'
          ? data.companyName!
          : data.companyCode!;

      // Automatically assign role based on action:
      // Create new company -> Admin
      // Join existing company -> Employee
      const assignedRole = data.mode === 'create' ? 'ADMIN' : 'EMPLOYEE';

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: assignedRole,
        companyName: companyIdentifier,
        companyCode: data.mode === 'join' ? data.companyCode : undefined,
        department: data.companyInfo || undefined,
      };

      const res: any = await apiClient.post('/auth/register', payload);

      if (res && (res.status === 201 || res.data)) {
        await login(data.email, data.password);
        if (data.mode === 'create') {
          toast.success(`Company registered! Welcome Admin ${data.name}.`);
        } else {
          toast.success(`Joined ${companyIdentifier}! Welcome, ${data.name}.`);
        }
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleModeSwitch('create')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            regMode === 'create'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Create New Company</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeSwitch('join')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            regMode === 'join'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Join Existing Company</span>
        </button>
      </div>

      {/* Role explanation indicator based on selection */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        {regMode === 'create' ? (
          <>
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Organization Admin setup:</span> Registering a new company assigns you as the Organization Admin with full workspace controls.
            </div>
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Employee onboarding:</span> Joining with your company code registers you as an Employee.
            </div>
          </>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-medium text-rose-800 dark:text-rose-200">Registration error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name & Work Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Full Name"
              placeholder="Md. Arif Hossain"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div>
            <Input
              label="Work Email"
              type="email"
              placeholder="admin@bengalmanufacturing.com.bd"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </div>

        {/* Dynamic fields based on registration mode */}
        {regMode === 'create' ? (
          <div className="space-y-4">
            <div>
              <Input
                label="Company Name"
                placeholder="e.g. Bengal Manufacturing Ltd."
                leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                error={errors.companyName?.message}
                {...register('companyName')}
              />
            </div>
            <div>
              <Input
                label="Company Information / Industry"
                placeholder="e.g. Manufacturing, Textiles, Pharmaceuticals"
                leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                error={errors.companyInfo?.message}
                {...register('companyInfo')}
              />
            </div>
          </div>
        ) : (
          <div>
            <Input
              label="Company Code or Organization Name"
              placeholder="e.g. BENGAL or Rahman Textiles"
              leftIcon={<Key className="w-4 h-4 text-slate-400" />}
              error={errors.companyCode?.message}
              {...register('companyCode')}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Ask your Company Administrator for your organization&apos;s registration code.
            </p>
          </div>
        )}

        {/* Password & Confirm Password */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.password?.message}
              showPasswordToggle
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.confirmPassword?.message}
              showPasswordToggle
              {...register('confirmPassword')}
            />
          </div>

          {/* Password Strength Indicator */}
          <PasswordStrengthIndicator password={currentPassword} />
        </div>

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 select-none cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              {...register('agreeTerms')}
            />
            <span>
              I agree to the <span className="font-medium text-blue-600 dark:text-blue-400">Terms of Service</span> and <span className="font-medium text-blue-600 dark:text-blue-400">Privacy Policy</span>.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.agreeTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          className="mt-2 py-2.5"
        >
          {isSubmitting
            ? 'Processing...'
            : regMode === 'create'
            ? 'Create Company & Admin Account'
            : 'Join Company as Employee'}
        </Button>
      </form>

      {/* Already registered link */}
      {onNavigateLogin && (
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
