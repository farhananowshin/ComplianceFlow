import { z } from 'zod';
import { RenewalStatus } from '../../common/constants/enums.js';

export const createRenewalRequestSchema = z.object({
  body: z.object({
    complianceId: z
      .string({ message: 'Compliance Record ID is required' })
      .min(1, 'Compliance Record ID is required'),
    newExpiryDate: z
      .string({ message: 'New target expiry date is required' })
      .or(z.date()),
    nextRenewalDate: z.string().or(z.date()).optional(),
    newIssueDate: z.string().or(z.date()).optional(),
    newLicenseNumber: z.string().optional(),
    renewalCost: z
      .number({ message: 'Renewal cost must be a number' })
      .min(0, 'Renewal cost cannot be negative')
      .optional()
      .default(0),
    currency: z.string().optional().default('BDT'),
    assignedTo: z.string().optional(),
    notes: z.string().optional().default(''),
  }),
});

export const updateRenewalSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Renewal record ID parameter is required' }),
  }),
  body: z.object({
    newExpiryDate: z.string().or(z.date()).optional(),
    nextRenewalDate: z.string().or(z.date()).optional(),
    newIssueDate: z.string().or(z.date()).optional(),
    newLicenseNumber: z.string().optional(),
    renewalCost: z.number().min(0).optional(),
    currency: z.string().optional(),
    assignedTo: z.string().nullable().optional(),
    notes: z.string().optional(),
  }),
});

export const changeRenewalStatusSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Renewal record ID parameter is required' }),
  }),
  body: z.object({
    status: z.nativeEnum(RenewalStatus, { message: 'Valid renewal status is required' }),
    comment: z.string().optional().default(''),
    rejectionReason: z.string().optional().default(''),
    newExpiryDate: z.string().or(z.date()).optional(),
    nextRenewalDate: z.string().or(z.date()).optional(),
    newIssueDate: z.string().or(z.date()).optional(),
    newLicenseNumber: z.string().optional(),
  }),
});

export const renewalIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Renewal record ID parameter is required' }),
  }),
});

export const listRenewalsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    complianceId: z.string().optional(),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    status: z.nativeEnum(RenewalStatus).optional(),
    minCost: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxCost: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['newExpiryDate', 'createdAt', 'renewalCost', 'renewalNumber']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateRenewalInput = z.infer<typeof createRenewalRequestSchema>['body'];
export type UpdateRenewalInput = z.infer<typeof updateRenewalSchema>['body'];
export type ChangeRenewalStatusInput = z.infer<typeof changeRenewalStatusSchema>['body'];
