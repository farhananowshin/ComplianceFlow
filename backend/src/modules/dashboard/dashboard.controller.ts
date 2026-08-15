import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import DashboardService from './dashboard.service.js';

export class DashboardController {
  /**
   * GET /api/v1/dashboard/overview
   * Get comprehensive dashboard metrics, health score, risk summary, forecast & activity logs
   */
  static async getOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;

      const dashboardData = await DashboardService.getOverview(
        req.user!,
        companyId,
        departmentId
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Dashboard analytics fetched successfully',
        data: dashboardData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/charts
   * Get dashboard charts analytics (category distribution, department compliance, monthly renewal trend)
   */
  static async getCharts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;

      const chartsData = await DashboardService.getCharts(
        req.user!,
        companyId,
        departmentId
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Dashboard chart analytics fetched successfully',
        data: chartsData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/metrics
   * Provides aggregate metrics for the Workspace layout
   */
  static async getMetrics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;

      const dashboardData = await DashboardService.getOverview(
        req.user!,
        companyId,
        departmentId
      );

      const metrics = {
        totalRecords: dashboardData.cards.totalDocuments,
        compliantCount: dashboardData.cards.activeDocuments,
        warningCount: dashboardData.cards.expiringSoonDocuments,
        expiredCount: dashboardData.cards.expiredDocuments,
        inProgressCount: dashboardData.cards.pendingRenewals,
        overallComplianceScore: dashboardData.healthSummary.score,
        expiringIn30Days: dashboardData.expiryForecast.next30Days,
        expiringIn60Days: dashboardData.expiryForecast.next60Days,
        expiringIn90Days: dashboardData.expiryForecast.next90Days,
        totalEstimatedRenewalCost: 0,
      };

      res.status(200).json({
        success: true,
        metrics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;

