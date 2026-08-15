import { Router } from 'express';
import AuditController from './audit.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// 1. Get Audit Logs
router.get('/', AuditController.getAuditLogs);

export default router;
