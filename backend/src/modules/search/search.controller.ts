import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import SearchService from './search.service.js';

export class SearchController {
  /**
   * GET /api/v1/search
   * Execute Global Search across Compliance, Company, Department, User, Renewal, and Notification
   */
  static async search(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const searchTerm = (req.query.q as string) || (req.query.query as string) || '';
      
      let entities: string[] | undefined;
      if (req.query.entities) {
        entities = (req.query.entities as string).split(',').map((e) => e.trim().toLowerCase());
      } else if (req.query.type) {
        entities = (req.query.type as string).split(',').map((e) => e.trim().toLowerCase());
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      const status = req.query.status as string | undefined;
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const searchResult = await SearchService.search(req.user!, {
        searchTerm,
        entities,
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        companyId,
        departmentId,
        startDate,
        endDate,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Global search completed successfully.',
        data: searchResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SearchController;
