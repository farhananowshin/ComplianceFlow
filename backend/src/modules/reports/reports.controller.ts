import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import ComplianceModel from '../compliance/compliance.model.js';
import RenewalModel from '../renewal/renewal.model.js';
import AuditLogModel from '../audit/audit.model.js';
import mongoose from 'mongoose';

export class ReportsController {
  
  static async exportSummaryCsv(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.query;
      const filter: any = {};
      if (companyId && mongoose.Types.ObjectId.isValid(companyId as string)) {
        filter.companyId = new mongoose.Types.ObjectId(companyId as string);
      } else if (req.user?.role !== 'SUPER_ADMIN') {
        filter.companyId = req.user?.companyId;
      }

      const records = await ComplianceModel.find(filter).lean();

      // Build CSV
      const headers = ['Title,Code,Category,Department,Status,Priority,Expiry Date,Cost'];
      const rows = records.map((r: any) => {
        return `"${r.title || ''}","${r.code || ''}","${r.category || ''}","${r.department || ''}","${r.status || ''}","${r.priority || r.riskLevel || ''}","${r.expiryDate ? new Date(r.expiryDate).toISOString().split('T')[0] : ''}","${r.estimatedCost || 0}"`;
      });

      const csvString = [headers.join(','), ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="compliance-summary.csv"');
      res.status(200).send(csvString);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to generate CSV', error: error.message });
    }
  }

  static async exportExpiredCsv(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.query;
      const filter: any = { status: 'EXPIRED' }; // Only expired
      if (companyId && mongoose.Types.ObjectId.isValid(companyId as string)) {
        filter.companyId = new mongoose.Types.ObjectId(companyId as string);
      } else if (req.user?.role !== 'SUPER_ADMIN') {
        filter.companyId = req.user?.companyId;
      }

      const records = await ComplianceModel.find(filter).lean();

      const headers = ['Title,Code,Category,Issuing Authority,Expiry Date,Days Overdue,Assigned User'];
      const now = Date.now();
      const rows = records.map((r: any) => {
        const exp = new Date(r.expiryDate).getTime();
        const daysOverdue = Math.floor((now - exp) / (1000 * 60 * 60 * 24));
        return `"${r.title || ''}","${r.code || ''}","${r.category || ''}","${r.issuingAuthority || ''}","${r.expiryDate ? new Date(r.expiryDate).toISOString().split('T')[0] : ''}","${daysOverdue}","${r.assignedUserName || ''}"`;
      });

      const csvString = [headers.join(','), ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="expired-documents.csv"');
      res.status(200).send(csvString);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to generate CSV', error: error.message });
    }
  }

  static async exportRenewalsCsv(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.query;
      const filter: any = {};
      if (companyId && mongoose.Types.ObjectId.isValid(companyId as string)) {
        filter.companyId = new mongoose.Types.ObjectId(companyId as string);
      } else if (req.user?.role !== 'SUPER_ADMIN') {
        filter.companyId = req.user?.companyId;
      }

      const renewals = await RenewalModel.find(filter).lean();

      const headers = ['Renewal Number,Document Name,Status,Cost,Requested By,Reviewer,Created At'];
      const rows = renewals.map((r: any) => {
        return `"${r.renewalNumber || ''}","${r.complianceDocumentName || ''}","${r.status || ''}","${r.renewalCost || 0}","${r.requestedByName || ''}","${r.assignedReviewerName || ''}","${r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : ''}"`;
      });

      const csvString = [headers.join(','), ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="renewal-logs.csv"');
      res.status(200).send(csvString);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to generate CSV', error: error.message });
    }
  }
}

export default ReportsController;
