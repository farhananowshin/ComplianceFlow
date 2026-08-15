import mongoose from 'mongoose';
import { NotificationModel, INotification } from './notification.model.js';
import { AuthUser } from '../../common/types/express.types.js';
import { NotificationType, PriorityLevel } from '../../common/constants/enums.js';

export class NotificationService {
  /**
   * List Notifications for the Current Authenticated User
   */
  static async listUserNotifications(
    currentUser: AuthUser,
    query: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
      priority?: PriorityLevel;
    }
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      recipientId: new mongoose.Types.ObjectId(currentUser.id),
    };

    if (query.unreadOnly) {
      filter.isRead = false;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    const [notifications, totalRecords, unreadCount] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('relatedComplianceId', 'documentName licenseNumber expiryDate category status'),
      NotificationModel.countDocuments(filter),
      NotificationModel.countDocuments({
        recipientId: new mongoose.Types.ObjectId(currentUser.id),
        isRead: false,
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      notifications,
      unreadCount,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get Unread Count for Current User
   */
  static async getUnreadCount(currentUser: AuthUser): Promise<number> {
    return NotificationModel.countDocuments({
      recipientId: new mongoose.Types.ObjectId(currentUser.id),
      isRead: false,
    });
  }

  /**
   * Mark Single Notification as Read
   */
  static async markAsRead(notificationId: string, currentUser: AuthUser): Promise<INotification> {
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipientId: currentUser.id,
    });

    if (!notification) {
      const error = new Error('Notification record not found or access denied.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark All Notifications as Read for Current User
   */
  static async markAllAsRead(currentUser: AuthUser): Promise<{ modifiedCount: number }> {
    const result = await NotificationModel.updateMany(
      { recipientId: currentUser.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Delete Single Notification
   */
  static async deleteNotification(notificationId: string, currentUser: AuthUser): Promise<{ message: string }> {
    const notification = await NotificationModel.findOneAndDelete({
      _id: notificationId,
      recipientId: currentUser.id,
    });

    if (!notification) {
      const error = new Error('Notification not found or access denied.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Notification deleted successfully.' };
  }
}

export default NotificationService;
