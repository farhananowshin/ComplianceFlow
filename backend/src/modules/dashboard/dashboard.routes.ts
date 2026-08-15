import { Router } from 'express';
import DashboardController from './dashboard.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import {
  dashboardOverviewQuerySchema,
  dashboardChartsQuerySchema,
} from './dashboard.validation.js';

const router = Router();

// Require authentication for all dashboard routes
router.use(authenticate);

/**
 * GET /api/v1/dashboard/overview
 * Dashboard Overview API (Cards, Health Score, Risk, Forecast, High Risk Docs, Recent Activity)
 */
router.get(
  '/overview',
  validateRequest(dashboardOverviewQuerySchema),
  DashboardController.getOverview
);

/**
 * GET /api/v1/dashboard/charts
 * Dashboard Charts API (Category breakdown, Monthly renewal trend, Department compliance)
 */
router.get(
  '/charts',
  validateRequest(dashboardChartsQuerySchema),
  DashboardController.getCharts
);

/**
 * GET /api/v1/dashboard/metrics
 * Dashboard Metrics API (used by Workspace shell)
 */
router.get(
  '/metrics',
  validateRequest(dashboardOverviewQuerySchema),
  DashboardController.getMetrics
);

export default router;

