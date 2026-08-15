import { z } from 'zod';

export const globalSearchQuerySchema = z.object({
  query: z.object({
    q: z.string().optional().default(''),
    query: z.string().optional(),
    entities: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val === 'all' || val === '*') return ['compliance', 'company', 'department', 'user', 'renewal', 'notification'];
        return val.split(',').map((e) => e.trim().toLowerCase());
      }),
    type: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'title', 'documentName']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    status: z.string().optional(),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export type GlobalSearchQueryInput = z.infer<typeof globalSearchQuerySchema>['query'];
