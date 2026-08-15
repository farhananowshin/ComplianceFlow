import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import ComplianceService from './compliance.service.js';
import ComplianceRecordModel from './compliance.model.js';

export class ComplianceController {
  /**
   * POST /api/v1/compliance
   * Create a new compliance record (SUPER_ADMIN, COMPANY_ADMIN, COMPLIANCE_OFFICER, MANAGER)
   */
  static async createComplianceRecord(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const fileBuffer = req.file ? req.file.buffer : undefined;
      const fileName = req.file ? req.file.originalname : undefined;

      const record = await ComplianceService.createComplianceRecord(
        req.body,
        req.user!,
        fileBuffer,
        fileName,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        success: true,
        status: 'success',
        statusCode: 201,
        message: 'Compliance record created successfully.',
        data: { record },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance/:id
   * Get single compliance record details
   */
  static async getComplianceRecordById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await ComplianceService.getComplianceRecordById(req.params.id, req.user!);

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Compliance record details retrieved.',
        data: { record },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance
   * List / Search / Filter / Paginate / Sort compliance records
   */
  static async listComplianceRecords(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const responsiblePersonId = req.query.responsiblePersonId as string | undefined;
      const category = req.query.category as any;
      const priority = req.query.priority as any;
      const status = req.query.status as any;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      const result = await ComplianceService.listComplianceRecords(
        {
          page,
          limit,
          search,
          companyId,
          departmentId,
          responsiblePersonId,
          category,
          priority,
          status,
          sortBy,
          sortOrder,
        },
        req.user!
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Compliance records retrieved.',
        data: { records: result.records },
        meta: result.meta,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/compliance/:id
   * Update compliance record details
   */
  static async updateComplianceRecord(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await ComplianceRecordModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!record) {
        res.status(404).json({
          success: false,
          message: 'Compliance record not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Compliance record updated successfully.',
        data: { record },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/compliance/:id/attachment
   * Upload or replace supporting attachment (PDF/Image)
   */
  static async uploadAttachment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        const error = new Error('No attachment file uploaded. Please upload a PDF or image file.') as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }

      const record = await ComplianceService.uploadAttachment(
        req.params.id,
        req.file.buffer,
        req.file.originalname,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Supporting attachment uploaded successfully.',
        data: { record },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/compliance/:id/attachment
   * Remove supporting attachment from record
   */
  static async removeAttachment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await ComplianceService.removeAttachment(
        req.params.id,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Supporting attachment removed successfully.',
        data: { record },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/compliance/:id
   * Soft delete compliance record
   */
  static async deleteComplianceRecord(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ComplianceService.deleteComplianceRecord(
        req.params.id,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: result.message,
        data: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance/:id/history
   * View compliance record change audit history
   */
  static async getRecordHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ComplianceService.getRecordHistory(req.params.id, req.user!);

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Compliance record audit history retrieved.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/compliance/:id/renew
   * Direct Renewal Process
   */
  static async directRenew(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const fileBuffer = req.file ? req.file.buffer : undefined;
      const fileName = req.file ? req.file.originalname : undefined;

      const record = await ComplianceService.directRenew(
        req.params.id,
        req.body,
        req.user!,
        fileBuffer,
        fileName,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Document renewed successfully.',
        data: { record },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ComplianceController;
