import { z } from 'zod';
import { CompanyStatus } from '../../common/constants/enums.js';

export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

export const companySettingsSchema = z.object({
  defaultCurrency: z.string().min(2).max(5).toUpperCase().optional(),
  fiscalYearStartMonth: z.number().min(1).max(12).optional(),
  autoArchiving: z.boolean().optional(),
  allowManagerApprovals: z.boolean().optional(),
  timezone: z.string().optional(),
});

export const reminderSettingsSchema = z.object({
  defaultReminderDays: z.array(z.number().positive()).optional(),
  notifyDepartmentManagers: z.boolean().optional(),
  notifyComplianceOfficers: z.boolean().optional(),
  emailEscalationDays: z.number().min(0).max(30).optional(),
  digestFrequency: z.enum(['DAILY', 'WEEKLY']).optional(),
});

export const createCompanySchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Company name is required' })
      .min(2, 'Name must be at least 2 characters long')
      .max(150, 'Name cannot exceed 150 characters'),
    code: z
      .string({ message: 'Company code is required' })
      .min(2, 'Company code must be at least 2 characters')
      .max(20, 'Company code cannot exceed 20 characters')
      .toUpperCase(),
    registrationNumber: z
      .string({ message: 'Registration number is required' })
      .min(2, 'Registration number must be at least 2 characters'),
    taxId: z.string().optional(),
    industry: z.string().min(2, 'Industry must be at least 2 characters').default('General'),
    contactEmail: z
      .string({ message: 'Contact email is required' })
      .email('Please provide a valid email address'),
    contactPhone: z.string().optional(),
    logoUrl: z.string().url('Logo URL must be a valid URL').optional().or(z.literal('')),
    address: addressSchema.optional(),
    parentCompanyId: z.string().optional(),
    settings: companySettingsSchema.optional(),
    reminderSettings: reminderSettingsSchema.optional(),
  }),
});

export const updateCompanySchema = z.object({
  params: z.object({
    id: z.string({ message: 'Company ID parameter is required' }),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    code: z.string().min(2).max(20).toUpperCase().optional(),
    registrationNumber: z.string().min(2).optional(),
    taxId: z.string().optional(),
    industry: z.string().min(2).optional(),
    contactEmail: z.string().email('Invalid email format').optional(),
    contactPhone: z.string().optional(),
    logoUrl: z.string().url('Invalid logo URL format').optional().or(z.literal('')),
    status: z.nativeEnum(CompanyStatus).optional(),
    address: addressSchema.optional(),
    parentCompanyId: z.string().nullable().optional(),
  }),
});

export const updateCompanySettingsSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Company ID parameter is required' }),
  }),
  body: companySettingsSchema,
});

export const updateReminderSettingsSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Company ID parameter is required' }),
  }),
  body: reminderSettingsSchema,
});

export const uploadCompanyLogoSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Company ID parameter is required' }),
  }),
  body: z.object({
    logoUrl: z.string({ message: 'Logo URL is required' }).url('Logo URL must be a valid URL'),
  }),
});

export const companyIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Company ID parameter is required' }),
  }),
});

export const listCompaniesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(CompanyStatus).optional(),
    industry: z.string().optional(),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>['body'];
export type UpdateCompanySettingsInput = z.infer<typeof updateCompanySettingsSchema>['body'];
export type UpdateReminderSettingsInput = z.infer<typeof updateReminderSettingsSchema>['body'];
export type UploadCompanyLogoInput = z.infer<typeof uploadCompanyLogoSchema>['body'];
