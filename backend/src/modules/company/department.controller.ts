import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import DepartmentService from './department.service.js';

export class DepartmentController {
  /**
   * POST /api/v1/departments
   * Create a new department (SUPER_ADMIN or COMPANY_ADMIN)
   */
  static async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.createDepartment(
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Department created successfully.',
        data: { department },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/departments/:id
   * Get department details by ID
   */
  static async getDepartmentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Department details retrieved.',
        data: { department },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/departments
   * List / Search / Filter / Paginate departments
   */
  static async listDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const companyId = req.query.companyId as string | undefined;
      const search = req.query.search as string | undefined;
      const status = req.query.status as any;

      const result = await DepartmentService.listDepartments({
        page,
        limit,
        companyId,
        search,
        status,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Departments list retrieved.',
        data: { departments: result.departments },
        meta: result.meta,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/departments/:id
   * Update department details
   */
  static async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.updateDepartment(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Department details updated successfully.',
        data: { department },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/departments/:id/manager
   * Assign or reassign department manager
   */
  static async assignManager(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.assignManager(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Department manager assigned successfully.',
        data: { department },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/departments/:id/status
   * Activate or deactivate department
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await DepartmentService.updateStatus(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Department status updated successfully.',
        data: { department },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/departments/:id
   * Soft delete department
   */
  static async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await DepartmentService.deleteDepartment(
        req.params.id,
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

export default DepartmentController;
