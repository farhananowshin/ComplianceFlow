import { Router } from 'express';
import multer from 'multer';
import ComplianceController from './compliance.controller.js';
import QrController from '../qr/qr.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../common/types/role.types.js';
import {
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
  complianceIdParamSchema,
  listComplianceRecordsQuerySchema,
  directRenewalSchema,
} from './compliance.validation.js';

// Configure Multer for in-memory file uploads (PDF & Images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPEG, PNG, and WEBP attachments are permitted.'));
    }
  },
});

const handleFileUpload = (req: any, res: any, next: any) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: 'error', message: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ status: 'error', message: err.message || 'Unknown file upload error' });
    }
    next();
  });
};

const router = Router();

// Public QR Verification Endpoint (No Auth required)
router.get('/verify/:qr', QrController.verifyQrCode);

// Require Authentication for all protected compliance endpoints
router.use(authenticate);

/**
 * Compliance Record Routes
 */

// 1. List / Search / Filter / Paginate / Sort Compliance Records
router.get('/', validateRequest(listComplianceRecordsQuerySchema), ComplianceController.listComplianceRecords);

// 2. Get Compliance Record Details
router.get('/:id', validateRequest(complianceIdParamSchema), ComplianceController.getComplianceRecordById);

// 3. View Compliance Record Audit History
router.get('/:id/history', validateRequest(complianceIdParamSchema), ComplianceController.getRecordHistory);

// 4. Create Compliance Record with optional attachment
router.post(
  '/',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  handleFileUpload,
  validateRequest(createComplianceRecordSchema),
  ComplianceController.createComplianceRecord
);

// 5. Update Compliance Record (PATCH and PUT for compatibility)
router.patch(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateComplianceRecordSchema),
  ComplianceController.updateComplianceRecord
);

router.put(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateComplianceRecordSchema),
  ComplianceController.updateComplianceRecord
);

// 6. Upload / Replace Supporting Attachment
router.post(
  '/:id/attachment',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  handleFileUpload,
  validateRequest(complianceIdParamSchema),
  ComplianceController.uploadAttachment
);

// 7. Remove Supporting Attachment
router.delete(
  '/:id/attachment',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(complianceIdParamSchema),
  ComplianceController.removeAttachment
);

// 8. Generate QR Verification Code for Document
router.post(
  '/:id/generate-qr',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(complianceIdParamSchema),
  QrController.generateQrCode
);

// 9. Soft Delete Compliance Record
router.delete(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(complianceIdParamSchema),
  ComplianceController.deleteComplianceRecord
);

// 10. Direct Document Renewal
router.patch(
  '/:id/renew',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  handleFileUpload,
  validateRequest(directRenewalSchema),
  ComplianceController.directRenew
);

export default router;
