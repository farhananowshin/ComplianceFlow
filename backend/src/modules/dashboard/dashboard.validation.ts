import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  query: z.object({
    companyId: z.string().optional(),
    departmentId: z.string().optional(),
  }),
});

export const dashboardOverviewQuerySchema = dashboardQuerySchema;
export const dashboardChartsQuerySchema = dashboardQuerySchema;

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>['query'];

