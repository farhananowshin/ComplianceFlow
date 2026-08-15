import { Router } from 'express';
import CalendarController from './calendar.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { calendarQuerySchema } from './calendar.validation.js';

const router = Router();

// Protect all calendar endpoints with authentication
router.use(authenticate);

// 1. Get Monthly Calendar Events
router.get('/', validateRequest(calendarQuerySchema), CalendarController.getCalendarEvents);

// 2. Get Upcoming Compliance & Renewal Events
router.get('/upcoming', CalendarController.getUpcomingEvents);

// 3. Get Monthly Calendar Summary
router.get('/summary', validateRequest(calendarQuerySchema), CalendarController.getMonthlySummary);

export default router;
