import { Router } from 'express';
import NotificationController from './notification.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from './notification.validation.js';

const router = Router();

// Require authentication for all notification routes
router.use(authenticate);

// 1. List user notifications
router.get('/', validateRequest(listNotificationsQuerySchema), NotificationController.listUserNotifications);

// 2. Get unread notifications count
router.get('/unread-count', NotificationController.getUnreadCount);

// 3. Mark all notifications as read
router.patch('/read-all', NotificationController.markAllAsRead);

// 4. Mark single notification as read
router.patch('/:id/read', validateRequest(notificationIdParamSchema), NotificationController.markAsRead);

// 5. Delete notification
router.delete('/:id', validateRequest(notificationIdParamSchema), NotificationController.deleteNotification);

export default router;
