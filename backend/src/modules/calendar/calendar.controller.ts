import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import CalendarService from './calendar.service.js';

export class CalendarController {
  /**
   * GET /api/v1/calendar
   * Retrieve Monthly Calendar Events (Expiries & Renewals)
   */
  static async getCalendarEvents(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const eventType = (req.query.eventType as 'ALL' | 'EXPIRY' | 'RENEWAL') || 'ALL';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await CalendarService.getCalendarEvents(req.user!, {
        year,
        month,
        startDate,
        endDate,
        companyId,
        departmentId,
        eventType,
        limit,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Compliance calendar events retrieved successfully.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/calendar/upcoming
   * Retrieve Upcoming Expiry and Renewal Events
   */
  static async getUpcomingEvents(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await CalendarService.getUpcomingEvents(req.user!, {
        companyId,
        limit,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Upcoming compliance and renewal events retrieved.',
        data: {
          upcomingEvents: result.events.slice(0, limit),
          totalCount: result.events.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/calendar/summary
   * Retrieve Monthly Calendar Summary Metrics
   */
  static async getMonthlySummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const companyId = req.query.companyId as string | undefined;

      const result = await CalendarService.getCalendarEvents(req.user!, {
        year,
        month,
        companyId,
        eventType: 'ALL',
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Monthly calendar summary metrics calculated.',
        data: result.summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CalendarController;
