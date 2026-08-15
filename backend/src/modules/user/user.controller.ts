import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import UserService from './user.service.js';

export class UserController {
  /**
   * POST /api/v1/users
   * Create a new user (SUPER_ADMIN or COMPANY_ADMIN)
   */
  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.createUser(
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'User created successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/profile
   * View current user profile details
   */
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getUserById(req.user!.id, req.user!);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'User profile retrieved successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   * Get single user details
   */
  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id, req.user!);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'User details retrieved.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users
   * List / Search / Filter / Paginate users
   */
  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const role = req.query.role as any;
      const status = req.query.status as any;

      const result = await UserService.listUsers(
        { page, limit, search, companyId, departmentId, role, status },
        req.user!
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Users list retrieved.',
        data: { users: result.users },
        meta: result.meta,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id
   * Update user information
   */
  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateUser(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'User updated successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id/company
   * Assign company to user
   */
  static async assignCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.assignCompany(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Company assigned to user successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id/department
   * Assign department to user
   */
  static async assignDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.assignDepartment(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Department assigned to user successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id/role
   * Assign role to user
   */
  static async assignRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.assignRole(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'User role updated successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id/deactivate
   * Deactivate user (Soft deactivate)
   */
  static async deactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.deactivateUser(
        req.params.id,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'User account deactivated successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id/reactivate
   * Reactivate user account
   */
  static async reactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.reactivateUser(
        req.params.id,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'User account reactivated successfully.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users/:id/reset-password
   * Admin Reset User Password
   */
  static async adminResetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await UserService.adminResetPassword(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
