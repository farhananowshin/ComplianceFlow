import { Router } from 'express';
import CompanyController from './company.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../common/types/role.types.js';
import {
  createCompanySchema,
  updateCompanySchema,
  updateCompanySettingsSchema,
  updateReminderSettingsSchema,
  uploadCompanyLogoSchema,
  companyIdParamSchema,
  listCompaniesQuerySchema,
} from './company.validation.js';

const router = Router();

// Apply Authentication Middleware to all company endpoints
router.use(authenticate);

/**
 * Company Management Routes
 */

// 1. List / Paginate Companies
router.get('/', validateRequest(listCompaniesQuerySchema), CompanyController.listCompanies);

// 2. Get Company Details
router.get('/:id', validateRequest(companyIdParamSchema), CompanyController.getCompanyById);

// 3. Create Company (SUPER_ADMIN and ADMIN only)
router.post(
  '/',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(createCompanySchema),
  CompanyController.createCompany
);

// 4. Update Company Details (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(updateCompanySchema),
  CompanyController.updateCompany
);

// 5. Upload Company Logo (SUPER_ADMIN and ADMIN only)
router.post(
  '/:id/logo',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(uploadCompanyLogoSchema),
  CompanyController.uploadLogo
);

// 6. Update Company Settings (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/settings',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(updateCompanySettingsSchema),
  CompanyController.updateSettings
);

// 7. Update Reminder Settings (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/reminder-settings',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(updateReminderSettingsSchema),
  CompanyController.updateReminderSettings
);

// 8. Delete Company (Soft Delete - SUPER_ADMIN and ADMIN only)
router.delete(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(companyIdParamSchema),
  CompanyController.deleteCompany
);

export default router;
