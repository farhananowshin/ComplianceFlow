import { Router } from 'express';
import multer from 'multer';
import RenewalController from './renewal.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../common/types/role.types.js';
import {
  createRenewalRequestSchema,
  updateRenewalSchema,
  changeRenewalStatusSchema,
  renewalIdParamSchema,
  listRenewalsQuerySchema,
} from './renewal.validation.js';

// Configure Multer for in-memory uploads (PDF & Images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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

const router = Router();

// Require authentication for all renewal routes
router.use(authenticate);

/**
 * Renewal Management Routes
 */

// 1. List / Search / Filter / Paginate / Sort Renewal Requests
router.get('/', validateRequest(listRenewalsQuerySchema), RenewalController.listRenewals);

// 2. Get Renewal Details
router.get('/:id', validateRequest(renewalIdParamSchema), RenewalController.getRenewalById);

// 3. View Renewal Workflow & Audit History
router.get('/:id/history', validateRequest(renewalIdParamSchema), RenewalController.getRenewalHistory);

// 4. Create Renewal Request with optional attachment
router.post(
  '/',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  upload.single('file'),
  validateRequest(createRenewalRequestSchema),
  RenewalController.createRenewalRequest
);

// 5. Update Renewal Details
router.patch(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateRenewalSchema),
  RenewalController.updateRenewal
);

// 6. Change Renewal Status / Transition Workflow State
router.patch(
  '/:id/status',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(changeRenewalStatusSchema),
  RenewalController.changeRenewalStatus
);

// 7. Upload / Replace Supporting Attachment
router.post(
  '/:id/attachment',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  upload.single('file'),
  validateRequest(renewalIdParamSchema),
  RenewalController.uploadAttachment
);

// 8. Remove Supporting Attachment
router.delete(
  '/:id/attachment',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(renewalIdParamSchema),
  RenewalController.removeAttachment
);

// 9. Soft Delete Renewal Request
router.delete(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(renewalIdParamSchema),
  RenewalController.deleteRenewal
);

export default router;
