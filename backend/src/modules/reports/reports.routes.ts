import { Router } from 'express';
import ReportsController from './reports.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// CSV Export Endpoints
router.get('/summary-csv', ReportsController.exportSummaryCsv);
router.get('/expired-csv', ReportsController.exportExpiredCsv);
router.get('/renewals-csv', ReportsController.exportRenewalsCsv);

export default router;
