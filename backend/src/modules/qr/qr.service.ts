import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import mongoose from 'mongoose';
import ComplianceRecordModel, { IComplianceRecord } from '../compliance/compliance.model.js';
import CompanyModel from '../company/company.model.js';
import DepartmentModel from '../company/department.model.js';
import AuditLogModel from '../audit/audit.model.js';
import { AuditAction, AuditEntity, ComplianceStatus } from '../../common/constants/enums.js';
import { UserRole } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';
import { env } from '../../config/env.js';

export class QrService {
  /**
   * Generate UUID, generate QR Data URL, and save QR Code ID on Compliance Record
   */
  static async generateQrCode(complianceId: string, currentUser: AuthUser) {
    if (!mongoose.Types.ObjectId.isValid(complianceId)) {
      const error = new Error('Invalid compliance record ID format.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    const record = await ComplianceRecordModel.findOne({
      _id: complianceId,
      isDeleted: false,
    });

    if (!record) {
      const error = new Error('Compliance record not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // RBAC Multi-tenant check
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (!currentUser.companyId || record.companyId.toString() !== currentUser.companyId) {
        const error = new Error('Access Denied: You cannot generate QR codes for other tenant companies.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
    }

    // Generate or reuse UUID
    const qrCodeId = record.qrCodeId || uuidv4();
    record.qrCodeId = qrCodeId;
    record.updatedBy = new mongoose.Types.ObjectId(currentUser.id);
    await record.save();

    // Verification Link
    const baseUrl = env.CLIENT_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify/${qrCodeId}`;

    // Generate Base64 Data URL Image
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    // Create Audit Log
    await AuditLogModel.create({
      companyId: record.companyId,
      userId: new mongoose.Types.ObjectId(currentUser.id),
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: record._id.toString(),
      details: {
        action: 'GENERATE_QR_CODE',
        qrCodeId,
        documentName: record.documentName,
        licenseNumber: record.licenseNumber,
      },
    });

    return {
      complianceId: record._id,
      documentName: record.documentName,
      licenseNumber: record.licenseNumber,
      qrCodeId,
      verificationUrl,
      qrCodeDataUrl,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Public Verification API: Verify compliance status via QR Code ID or Document ID
   */
  static async verifyQrCode(qrParam: string, clientIp?: string, userAgent?: string) {
    if (!qrParam || typeof qrParam !== 'string') {
      const error = new Error('Verification QR token parameter is required.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    const trimmedParam = qrParam.trim();

    // Query by qrCodeId OR _id if valid Mongo ObjectId
    const queryConditions: Record<string, unknown>[] = [{ qrCodeId: trimmedParam }];
    if (mongoose.Types.ObjectId.isValid(trimmedParam)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(trimmedParam) });
    }

    const record = await ComplianceRecordModel.findOne({
      isDeleted: false,
      $or: queryConditions,
    }).populate('companyId').populate('departmentId');

    if (!record) {
      const error = new Error('Invalid or expired verification QR code. Record not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();
    const expiryDate = new Date(record.expiryDate);
    const diffTime = expiryDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate document compliance health score
    let complianceScore = 0;
    if (
      [
        ComplianceStatus.ACTIVE,
        ComplianceStatus.COMPLIANT,
        ComplianceStatus.RENEWED,
      ].includes(record.status)
    ) {
      if (remainingDays > 30) {
        complianceScore = 100;
      } else if (remainingDays > 0) {
        complianceScore = Math.max(60, Math.round((remainingDays / 30) * 100));
      } else {
        complianceScore = 0;
      }
    } else if (
      [
        ComplianceStatus.EXPIRING_SOON,
        ComplianceStatus.NEARING_EXPIRY,
      ].includes(record.status)
    ) {
      complianceScore = 60;
    } else {
      complianceScore = 0;
    }

    const companyObj = record.companyId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      code: string;
      contactEmail?: string;
      industry?: string;
      status?: string;
      logoUrl?: string;
    } | null;

    const departmentObj = record.departmentId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      code: string;
    } | null;

    const companyIdStr = companyObj ? companyObj._id.toString() : '';

    // Create Public Audit Log for verification scan
    await AuditLogModel.create({
      companyId: companyObj ? companyObj._id : undefined,
      userEmail: 'public@verifier',
      userRole: 'PUBLIC',
      action: AuditAction.VERIFY_QR,
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: record._id.toString(),
      details: {
        qrCodeId: record.qrCodeId || trimmedParam,
        documentName: record.documentName,
        licenseNumber: record.licenseNumber,
        status: record.status,
        remainingDays,
        complianceScore,
        verifiedAt: now.toISOString(),
      },
      ipAddress: clientIp || '',
      userAgent: userAgent || '',
    });

    // Re-generate QR Data URL for display on verification badge if needed
    const baseUrl = env.CLIENT_URL || 'http://localhost:3000';
    const activeQrId = record.qrCodeId || trimmedParam;
    const verificationUrl = `${baseUrl}/verify/${activeQrId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      width: 250,
      margin: 1,
    });

    return {
      verified: true,
      verifiedAt: now.toISOString(),
      company: {
        id: companyObj ? companyObj._id : null,
        name: companyObj ? companyObj.name : 'Unknown Company',
        code: companyObj ? companyObj.code : 'N/A',
        email: companyObj ? companyObj.contactEmail || '' : '',
        industry: companyObj ? companyObj.industry || '' : '',
        status: companyObj ? companyObj.status : 'ACTIVE',
        logoUrl: companyObj ? companyObj.logoUrl || '' : '',
      },
      document: {
        id: record._id,
        documentName: record.documentName,
        licenseNumber: record.licenseNumber,
        category: record.category,
        issuingAuthority: record.issuingAuthority,
        issueDate: record.issueDate,
        expiryDate: record.expiryDate,
        priority: record.priority,
        notes: record.notes || '',
        supportingAttachmentUrl: record.supportingAttachmentUrl || '',
        qrCodeId: activeQrId,
        departmentName: departmentObj ? departmentObj.name : '',
        departmentCode: departmentObj ? departmentObj.code : '',
        qrCodeDataUrl,
      },
      status: record.status,
      expiryDate: record.expiryDate,
      remainingDays,
      complianceScore,
    };
  }
}

export default QrService;
