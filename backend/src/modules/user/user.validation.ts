import { z } from 'zod';
import { UserStatus } from '../../common/types/role.types.js';
import { ROLES } from '../../constants/roles.js';

const ALLOWED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
] as const;

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Full name is required' })
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ message: 'Email address is required' })
      .email('Please provide a valid email address'),
    password: z
      .string({ message: 'Initial password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    role: z.enum(ALLOWED_ROLES, { message: 'Invalid user role specified' }).optional().default(ROLES.EMPLOYEE),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    phoneNumber: z.string().optional(),
    avatarUrl: z.string().url('Avatar URL must be a valid URL').optional().or(z.literal('')),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string({ message: 'User ID parameter is required' }),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    email: z.string().email('Please provide a valid email address').optional(),
    phoneNumber: z.string().optional(),
    avatarUrl: z.string().url('Avatar URL must be a valid URL').optional().or(z.literal('')),
    companyId: z.string().nullable().optional(),
    departmentId: z.string().nullable().optional(),
    role: z.enum(ALLOWED_ROLES).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const assignCompanySchema = z.object({
  params: z.object({
    id: z.string({ message: 'User ID parameter is required' }),
  }),
  body: z.object({
    companyId: z.string({ message: 'Company ID is required' }),
    departmentId: z.string().optional(),
  }),
});

export const assignDepartmentSchema = z.object({
  params: z.object({
    id: z.string({ message: 'User ID parameter is required' }),
  }),
  body: z.object({
    departmentId: z.string({ message: 'Department ID is required' }),
  }),
});

export const assignRoleSchema = z.object({
  params: z.object({
    id: z.string({ message: 'User ID parameter is required' }),
  }),
  body: z.object({
    role: z.enum(ALLOWED_ROLES, { message: 'Valid user role is required' }),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string({ message: 'User ID parameter is required' }),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus, { message: 'Valid user status (ACTIVE or INACTIVE) is required' }),
  }),
});

export const adminResetPasswordSchema = z.object({
  params: z.object({
    id: z.string({ message: 'User ID parameter is required' }),
  }),
  body: z.object({
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

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'User ID parameter is required' }),
  }),
});

export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    role: z.enum(ALLOWED_ROLES).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type AssignCompanyInput = z.infer<typeof assignCompanySchema>['body'];
export type AssignDepartmentInput = z.infer<typeof assignDepartmentSchema>['body'];
export type AssignRoleInput = z.infer<typeof assignRoleSchema>['body'];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>['body'];
