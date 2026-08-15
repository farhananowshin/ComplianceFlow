import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import NotificationService from './notification.service.js';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * List authenticated user's notifications
   */
  static async listUserNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const unreadOnly = req.query.unreadOnly === 'true';
      const type = req.query.type as any;
      const priority = req.query.priority as any;

      const result = await NotificationService.listUserNotifications(req.user!, {
        page,
        limit,
        unreadOnly,
        type,
        priority,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Notifications retrieved successfully.',
        data: {
          notifications: result.notifications,
          unreadCount: result.unreadCount,
        },
        meta: result.meta,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/unread-count
   * Get unread notifications badge count
   */
  static async getUnreadCount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const unreadCount = await NotificationService.getUnreadCount(req.user!);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Unread notification count retrieved.',
        data: { unreadCount },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark single notification as read
   */
  static async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user!);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Notification marked as read.',
        data: { notification },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all notifications as read
   */
  static async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await NotificationService.markAllAsRead(req.user!);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: `${result.modifiedCount} notification(s) marked as read.`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/:id
   * Delete single notification
   */
  static async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await NotificationService.deleteNotification(req.params.id, req.user!);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
