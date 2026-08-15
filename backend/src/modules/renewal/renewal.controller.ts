import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import RenewalService from './renewal.service.js';

export class RenewalController {
  /**
   * POST /api/v1/renewals
   * Create a new renewal request
   */
  static async createRenewalRequest(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const fileBuffer = req.file ? req.file.buffer : undefined;
      const fileName = req.file ? req.file.originalname : undefined;

      const renewal = await RenewalService.createRenewalRequest(
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
        message: 'Renewal request created successfully.',
        data: { renewal },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/renewals/:id
   * Get single renewal request details
   */
  static async getRenewalById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const renewal = await RenewalService.getRenewalById(req.params.id, req.user!);

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Renewal request details retrieved.',
        data: { renewal },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/renewals
   * List / Search / Filter / Paginate / Sort renewal requests
   */
  static async listRenewals(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const complianceId = req.query.complianceId as string | undefined;
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const status = req.query.status as any;
      const minCost = req.query.minCost ? parseFloat(req.query.minCost as string) : undefined;
      const maxCost = req.query.maxCost ? parseFloat(req.query.maxCost as string) : undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      const result = await RenewalService.listRenewals(
        {
          page,
          limit,
          search,
          complianceId,
          companyId,
          departmentId,
          status,
          minCost,
          maxCost,
          startDate,
          endDate,
          sortBy,
          sortOrder,
        },
        req.user!
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Renewal requests retrieved successfully.',
        data: { renewals: result.renewals },
        meta: result.meta,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/renewals/:id
   * Update renewal request details
   */
  static async updateRenewal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const renewal = await RenewalService.updateRenewal(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Renewal request updated successfully.',
        data: { renewal },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/renewals/:id/status
   * Change renewal status / workflow transition
   */
  static async changeRenewalStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const renewal = await RenewalService.changeRenewalStatus(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: `Renewal status successfully transitioned to ${renewal.status}.`,
        data: { renewal },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/renewals/:id/attachment
   * Upload or replace attachment for renewal record
   */
  static async uploadAttachment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        const error = new Error('No file uploaded. Please select a PDF or image file.') as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }

      const renewal = await RenewalService.uploadAttachment(
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
        data: { renewal },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/renewals/:id/attachment
   * Remove attachment from renewal record
   */
  static async removeAttachment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const renewal = await RenewalService.removeAttachment(
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
        data: { renewal },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/renewals/:id
   * Soft delete renewal request
   */
  static async deleteRenewal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await RenewalService.deleteRenewal(
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
   * GET /api/v1/renewals/:id/history
   * Get renewal workflow history & status timeline
   */
  static async getRenewalHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await RenewalService.getRenewalHistory(req.params.id, req.user!);

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Renewal workflow history retrieved.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RenewalController;
