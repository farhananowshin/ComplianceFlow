import { z } from 'zod';
import { UserRole } from '../../common/types/role.types.js';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Full name is required' })
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ message: 'Email address is required' })
      .email('Please provide a valid email address'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    role: z.nativeEnum(UserRole).optional().default(UserRole.EMPLOYEE),
    // Legacy ObjectId-based fields (kept for backward compat)
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    phoneNumber: z.string().optional(),
    // Frontend registration form fields
    companyName: z.string().optional(),   // 'create' mode: new company name
    companyCode: z.string().optional(),   // 'join' mode: existing company code
    industry: z.string().optional(),      // 'create' mode: company industry/info
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email address is required' })
      .email('Please provide a valid email address'),
    password: z.string({ message: 'Password is required' }).min(1, 'Password cannot be empty'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email address is required' })
      .email('Please provide a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string({ message: 'Reset token is required' }).min(1, 'Reset token cannot be empty'),
    newPassword: z
      .string({ message: 'New password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ message: 'Current password is required' })
      .min(1, 'Current password cannot be empty'),
    newPassword: z
      .string({ message: 'New password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    phoneNumber: z.string().optional(),
    avatarUrl: z.string().url('Avatar URL must be a valid URL').optional().or(z.literal('')),
    departmentId: z.string().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
