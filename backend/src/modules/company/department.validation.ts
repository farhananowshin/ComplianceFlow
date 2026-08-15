import { z } from 'zod';
import { DepartmentStatus } from '../../common/constants/enums.js';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Department name is required' })
      .min(2, 'Department name must be at least 2 characters long')
      .max(100, 'Department name cannot exceed 100 characters'),
    code: z
      .string({ message: 'Department code is required' })
      .min(2, 'Department code must be at least 2 characters')
      .max(20, 'Department code cannot exceed 20 characters')
      .toUpperCase(),
    companyId: z.string({ message: 'Company ID is required' }),
    description: z.string().optional(),
    managerId: z.string().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Department ID parameter is required' }),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(2).max(20).toUpperCase().optional(),
    description: z.string().optional(),
    managerId: z.string().nullable().optional(),
    status: z.nativeEnum(DepartmentStatus).optional(),
  }),
});

export const assignManagerSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Department ID parameter is required' }),
  }),
  body: z.object({
    managerId: z.string({ message: 'Manager ID is required' }),
  }),
});

export const updateDepartmentStatusSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Department ID parameter is required' }),
  }),
  body: z.object({
    status: z.nativeEnum(DepartmentStatus, {
      message: 'Status must be ACTIVE or INACTIVE',
    }),
  }),
});

export const departmentIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Department ID parameter is required' }),
  }),
});

export const listDepartmentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    companyId: z.string().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(DepartmentStatus).optional(),
  }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>['body'];
export type AssignManagerInput = z.infer<typeof assignManagerSchema>['body'];
export type UpdateDepartmentStatusInput = z.infer<typeof updateDepartmentStatusSchema>['body'];
