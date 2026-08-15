import { z } from 'zod';

export const calendarQuerySchema = z.object({
  query: z.object({
    year: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : new Date().getFullYear())),
    month: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : new Date().getMonth() + 1)),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
    eventType: z.enum(['ALL', 'EXPIRY', 'RENEWAL']).optional().default('ALL'),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50)),
  }),
});

export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>['query'];
