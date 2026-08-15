import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import CompanyService from './company.service.js';

export class CompanyController {
  /**
   * POST /api/v1/companies
   * Create a new company (SUPER_ADMIN or COMPANY_ADMIN)
   */
  static async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.createCompany(
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Company created successfully.',
        data: { company },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/companies/:id
   * Get single company details
   */
  static async getCompanyById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.getCompanyById(req.params.id);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Company details retrieved.',
        data: { company },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/companies
   * List / Paginate companies
   */
  static async listCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const status = req.query.status as any;
      const industry = req.query.industry as string | undefined;

      const result = await CompanyService.listCompanies({ page, limit, search, status, industry });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Companies list retrieved.',
        data: { companies: result.companies },
        meta: result.meta,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/companies/:id
   * Update company details
   */
  static async updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.updateCompany(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Company details updated successfully.',
        data: { company },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/companies/:id/logo
   * Upload / Update company logo
   */
  static async uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.uploadLogo(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Company logo updated successfully.',
        data: { company },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/companies/:id/settings
   * Update general company settings
   */
  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.updateSettings(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Company settings updated successfully.',
        data: { company },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/companies/:id/reminder-settings
   * Update company compliance reminder settings
   */
  static async updateReminderSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.updateReminderSettings(
        req.params.id,
        req.body,
        req.user!,
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Company reminder settings updated successfully.',
        data: { company },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/companies/:id
   * Soft delete company
   */
  static async deleteCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CompanyService.deleteCompany(
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

export default CompanyController;
