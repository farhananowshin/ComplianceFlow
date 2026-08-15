import { z } from 'zod';
import {
  ComplianceCategory,
  ComplianceStatus,
  PriorityLevel,
  RenewalFrequency,
} from '../../common/constants/enums.js';

export const createComplianceRecordSchema = z.object({
  body: z.object({
    documentName: z
      .string({ message: 'Document name is required' })
      .min(2, 'Document name must be at least 2 characters')
      .max(200, 'Document name cannot exceed 200 characters'),
    licenseNumber: z
      .string({ message: 'License or Certificate number is required' })
      .min(1, 'License or Certificate number is required')
      .max(100, 'License number cannot exceed 100 characters'),
    category: z.preprocess((val) => {
      if (typeof val !== 'string') return val;
      const mapping: Record<string, string> = {
        'Corporate & Legal': ComplianceCategory.LEGAL,
        'Tax & Financial': ComplianceCategory.FINANCIAL,
        'Environmental & Safety': ComplianceCategory.ENVIRONMENTAL,
        'Data Privacy & ISO': ComplianceCategory.IT_SECURITY,
        'HR & Labor': ComplianceCategory.HR,
        'Operational License': ComplianceCategory.OPERATIONAL,
        'Trade & Export': ComplianceCategory.OTHER,
        'Healthcare & FDA': ComplianceCategory.OTHER
      };
      return mapping[val] || val;
    }, z.nativeEnum(ComplianceCategory, { message: 'Valid compliance category is required' })),
    companyId: z.preprocess((val) => val === 'comp_01' ? '65b2a0c6d9f9a2b3c4d5e6f7' : val, z.string({ message: 'Company ID is required' }).optional()),
    departmentId: z.preprocess((val) => val === 'dept_01' ? '65b2a0c6d9f9a2b3c4d5e6f8' : val, z.string().optional()),
    responsiblePersonId: z.string().optional(),
    issuingAuthority: z
      .string({ message: 'Issuing authority is required' })
      .min(2, 'Issuing authority must be at least 2 characters')
      .max(150),
    issueDate: z.coerce.date({ message: 'Valid issue date is required' }),
    expiryDate: z.coerce.date({ message: 'Valid expiry date is required' }),
    renewalFrequency: z
      .nativeEnum(RenewalFrequency, { message: 'Valid renewal frequency is required' })
      .optional()
      .default(RenewalFrequency.ANNUAL),
    priority: z
      .nativeEnum(PriorityLevel, { message: 'Valid priority level is required' })
      .optional()
      .default(PriorityLevel.MEDIUM),
    status: z.nativeEnum(ComplianceStatus).optional(),
    notes: z.string().optional().default(''),
    autoRenewalEnabled: z.coerce.boolean().optional().default(false),
  }),
});

export const updateComplianceRecordSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Compliance record ID parameter is required' }),
  }),
  body: z.object({
    documentName: z.string().min(2).max(200).optional(),
    licenseNumber: z.string().min(1).max(100).optional(),
    category: z.preprocess((val) => {
      if (typeof val !== 'string') return val;
      const mapping: Record<string, string> = {
        'Corporate & Legal': ComplianceCategory.LEGAL,
        'Tax & Financial': ComplianceCategory.FINANCIAL,
        'Environmental & Safety': ComplianceCategory.ENVIRONMENTAL,
        'Data Privacy & ISO': ComplianceCategory.IT_SECURITY,
        'HR & Labor': ComplianceCategory.HR,
        'Operational License': ComplianceCategory.OPERATIONAL,
        'Trade & Export': ComplianceCategory.OTHER,
        'Healthcare & FDA': ComplianceCategory.OTHER
      };
      return mapping[val] || val;
    }, z.nativeEnum(ComplianceCategory).optional()),
    companyId: z.preprocess((val) => val === 'comp_01' ? '65b2a0c6d9f9a2b3c4d5e6f7' : val, z.string().optional()),
    departmentId: z.preprocess((val) => val === 'dept_01' ? '65b2a0c6d9f9a2b3c4d5e6f8' : val, z.string().optional()),
    responsiblePersonId: z.string().nullable().optional(),
    issuingAuthority: z.string().min(2).max(150).optional(),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
    renewalFrequency: z.nativeEnum(RenewalFrequency).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    status: z.nativeEnum(ComplianceStatus).optional(),
    notes: z.string().optional(),
    autoRenewalEnabled: z.coerce.boolean().optional(),
  }),
});

export const complianceIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Compliance record ID parameter is required' }),
  }),
});

export const listComplianceRecordsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    responsiblePersonId: z.string().optional(),
    category: z.nativeEnum(ComplianceCategory).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    status: z.nativeEnum(ComplianceStatus).optional(),
    sortBy: z.enum(['expiryDate', 'issueDate', 'documentName', 'createdAt']).optional().default('expiryDate'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const directRenewalSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Compliance record ID parameter is required' }),
  }),
  body: z.object({
    newIssueDate: z.string({ message: 'New issue date is required' }).or(z.date()),
    newExpiryDate: z.string({ message: 'New expiry date is required' }).or(z.date()),
    notes: z.string().optional().default(''),
  }),
});

export type CreateComplianceRecordInput = z.infer<typeof createComplianceRecordSchema>['body'];
export type UpdateComplianceRecordInput = z.infer<typeof updateComplianceRecordSchema>['body'];
export type DirectRenewalInput = z.infer<typeof directRenewalSchema>['body'];
