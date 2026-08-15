import { Router } from 'express';
import UserController from './user.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../common/types/role.types.js';
import {
  createUserSchema,
  updateUserSchema,
  assignCompanySchema,
  assignDepartmentSchema,
  assignRoleSchema,
  adminResetPasswordSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from './user.validation.js';

const router = Router();

// Require Authentication for all user management endpoints
router.use(authenticate);

/**
 * User Profile Route (Current Authenticated User)
 */
router.get('/profile', UserController.getProfile);

/**
 * User Management Routes
 */

// 1. List / Search / Filter / Paginate Users
router.get('/', validateRequest(listUsersQuerySchema), UserController.listUsers);

// 2. Get Single User Details
router.get('/:id', validateRequest(userIdParamSchema), UserController.getUserById);

// 3. Create New User (SUPER_ADMIN and ADMIN only)
router.post(
  '/',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(createUserSchema),
  UserController.createUser
);

// 4. Update User Details (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(updateUserSchema),
  UserController.updateUser
);

// 5. Assign Company to User (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/company',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(assignCompanySchema),
  UserController.assignCompany
);

// 6. Assign Department to User (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/department',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(assignDepartmentSchema),
  UserController.assignDepartment
);

// 7. Assign Role to User (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/role',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(assignRoleSchema),
  UserController.assignRole
);

// 8. Soft Deactivate User Account (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/deactivate',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(userIdParamSchema),
  UserController.deactivateUser
);

// 9. Reactivate User Account (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/reactivate',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(userIdParamSchema),
  UserController.reactivateUser
);

// 10. Admin Reset User Password (SUPER_ADMIN and ADMIN only)
router.post(
  '/:id/reset-password',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(adminResetPasswordSchema),
  UserController.adminResetPassword
);

export default router;
