import { Router } from 'express';
import DepartmentController from './department.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../common/types/role.types.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  assignManagerSchema,
  updateDepartmentStatusSchema,
  departmentIdParamSchema,
  listDepartmentsQuerySchema,
} from './department.validation.js';

const router = Router();

// Require Authentication for all department endpoints
router.use(authenticate);

/**
 * Department Management Routes
 */

// 1. List / Search / Filter / Paginate Departments (All authenticated users)
router.get('/', validateRequest(listDepartmentsQuerySchema), DepartmentController.listDepartments);

// 2. Get Department Details (All authenticated users)
router.get('/:id', validateRequest(departmentIdParamSchema), DepartmentController.getDepartmentById);

// 3. Create Department (SUPER_ADMIN and ADMIN only)
router.post(
  '/',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(createDepartmentSchema),
  DepartmentController.createDepartment
);

// 4. Update Department Details (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(updateDepartmentSchema),
  DepartmentController.updateDepartment
);

// 5. Assign Department Manager (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/manager',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(assignManagerSchema),
  DepartmentController.assignManager
);

// 6. Activate / Deactivate Department (SUPER_ADMIN and ADMIN only)
router.patch(
  '/:id/status',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(updateDepartmentStatusSchema),
  DepartmentController.updateStatus
);

// 7. Soft Delete Department (SUPER_ADMIN and ADMIN only)
router.delete(
  '/:id',
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(departmentIdParamSchema),
  DepartmentController.deleteDepartment
);

export default router;
