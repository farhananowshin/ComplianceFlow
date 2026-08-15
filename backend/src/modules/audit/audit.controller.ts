import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import AuditLogModel from './audit.model.js';
import mongoose from 'mongoose';

export class AuditController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.query;
      
      const filter: any = {};
      if (companyId && mongoose.Types.ObjectId.isValid(companyId as string)) {
        filter.companyId = new mongoose.Types.ObjectId(companyId as string);
      } else if (req.user?.role !== 'SUPER_ADMIN') {
        filter.companyId = req.user?.companyId;
      }

      const logs = await AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email')
        .lean();

      const mappedLogs = logs.map((log: any) => ({
        id: log._id.toString(),
        timestamp: log.createdAt,
        userId: log.userId ? log.userId._id : '',
        userName: log.userId ? log.userId.name : (log.userEmail || 'System Auto'),
        userRole: log.userRole,
        companyId: log.companyId ? log.companyId.toString() : '',
        action: log.action,
        entityType: log.entity,
        entityId: log.entityId,
        details: log.details && typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || ''),
        ipAddress: log.ipAddress || '',
        status: 'success'
      }));

      res.status(200).json({
        success: true,
        status: 'success',
        statusCode: 200,
        message: 'Audit logs retrieved successfully',
        data: { auditLogs: mappedLogs },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        status: 'error',
        statusCode: 500,
        message: 'Failed to retrieve audit logs',
        error: error.message,
      });
    }
  }
}

export default AuditController;
