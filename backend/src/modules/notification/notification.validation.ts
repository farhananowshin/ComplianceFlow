import { z } from 'zod';
import { NotificationType, PriorityLevel } from '../../common/constants/enums.js';

export const listNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    unreadOnly: z.string().optional().transform((val) => val === 'true'),
    type: z.nativeEnum(NotificationType).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string({ message: 'Notification ID parameter is required' }),
  }),
});
