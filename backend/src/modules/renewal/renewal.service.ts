import mongoose from 'mongoose';
import RenewalRecordModel, { IRenewalRecord } from './renewal.model.js';
import ComplianceRecordModel from '../compliance/compliance.model.js';
import UserModel from '../user/user.model.js';
import AuditLogModel from '../audit/audit.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import {
  AuditAction,
  AuditEntity,
  ComplianceStatus,
  RenewalStatus,
} from '../../common/constants/enums.js';
import { UserRole } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';
import {
  CreateRenewalInput,
  UpdateRenewalInput,
  ChangeRenewalStatusInput,
} from './renewal.validation.js';

export class RenewalService {
  /**
   * Helper: Validate multi-tenant company scope
   */
  private static validateTenantScope(currentUser: AuthUser, companyId: string | mongoose.Types.ObjectId): void {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.MANAGER ||
      currentUser.role === UserRole.EMPLOYEE
    ) {
      if (!currentUser.companyId || companyId.toString() !== currentUser.companyId.toString()) {
        const error = new Error('Access Denied: You cannot view or modify renewal requests outside your company tenant.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      return;
    }

    const error = new Error('Forbidden: Insufficient permissions.') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  /**
   * Helper: Generate unique renewal reference number
   */
  private static generateRenewalNumber(): string {
    const year = new Date().getFullYear();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    return `REN-${year}-${randomCode}`;
  }

  /**
   * Create Renewal Request
   */
  static async createRenewalRequest(
    input: CreateRenewalInput,
    currentUser: AuthUser,
    fileBuffer?: Buffer,
    fileName?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IRenewalRecord> {
    // 1. Fetch Compliance Record
    const complianceRecord = await ComplianceRecordModel.findOne({
      _id: input.complianceId,
      isDeleted: false,
    });

    if (!complianceRecord) {
      const error = new Error('Compliance record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // 2. Validate Tenant Scope
    this.validateTenantScope(currentUser, complianceRecord.companyId);

    // 3. Validate Assigned Person if provided
    if (input.assignedTo) {
      const assignedUser = await UserModel.findById(input.assignedTo);
      if (!assignedUser) {
        const error = new Error('Designated assigned person user account not found.') as Error & { statusCode?: number };
        error.statusCode = 404;
        throw error;
      }
      if (
        assignedUser.companyId &&
        assignedUser.companyId.toString() !== complianceRecord.companyId.toString()
      ) {
        const error = new Error('Assigned person does not belong to the same company tenant.') as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Handle Attachment Upload if File Provided
    let attachmentUrl = '';
    let attachmentPublicId = '';

    if (fileBuffer && fileName) {
      const uploadResult = await uploadToCloudinary(
        fileBuffer,
        fileName,
        `company_${complianceRecord.companyId}/renewals`
      );
      attachmentUrl = uploadResult.url;
      attachmentPublicId = uploadResult.publicId;
    }

    // 5. Build Renewal Object
    const renewalNumber = this.generateRenewalNumber();
    const newExpiryDate = new Date(input.newExpiryDate);
    const newIssueDate = input.newIssueDate ? new Date(input.newIssueDate) : undefined;
    const nextRenewalDate = input.nextRenewalDate ? new Date(input.nextRenewalDate) : undefined;
    const initialStatus = RenewalStatus.CREATED;

    const initialStatusHistory = [
      {
        status: initialStatus,
        changedBy: new mongoose.Types.ObjectId(currentUser.id),
        comment: 'Renewal request initiated.',
        changedAt: new Date(),
      },
    ];

    const renewal = await RenewalRecordModel.create({
      complianceId: complianceRecord._id,
      companyId: complianceRecord.companyId,
      departmentId: complianceRecord.departmentId,
      renewalNumber,
      requestedBy: new mongoose.Types.ObjectId(currentUser.id),
      assignedTo: input.assignedTo ? new mongoose.Types.ObjectId(input.assignedTo) : undefined,
      previousExpiryDate: complianceRecord.expiryDate,
      newExpiryDate,
      nextRenewalDate,
      newIssueDate,
      newLicenseNumber: input.newLicenseNumber ? input.newLicenseNumber.trim() : undefined,
      renewalCost: input.renewalCost || 0,
      currency: (input.currency || 'BDT').toUpperCase(),
      status: initialStatus,
      attachmentUrl,
      attachmentPublicId,
      receiptUrl: attachmentUrl,
      notes: input.notes || '',
      statusHistory: initialStatusHistory,
      isDeleted: false,
      createdBy: new mongoose.Types.ObjectId(currentUser.id),
      updatedBy: new mongoose.Types.ObjectId(currentUser.id),
    });

    // Update Compliance Record Status to PENDING_RENEWAL
    complianceRecord.status = ComplianceStatus.PENDING_RENEWAL;
    await complianceRecord.save();

    // 6. Write Audit Log
    await AuditLogModel.create({
      companyId: complianceRecord.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.CREATE,
      entity: AuditEntity.RENEWAL_RECORD,
      entityId: renewal._id.toString(),
      details: {
        renewalNumber: renewal.renewalNumber,
        complianceId: complianceRecord._id.toString(),
        documentName: complianceRecord.documentName,
        renewalCost: renewal.renewalCost,
        status: renewal.status,
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return renewal;
  }

  /**
   * Get Renewal Record Details
   */
  static async getRenewalById(
    renewalId: string,
    currentUser: AuthUser
  ): Promise<IRenewalRecord> {
    const renewal = await RenewalRecordModel.findOne({
      _id: renewalId,
      isDeleted: false,
    })
      .populate('complianceId', 'documentName licenseNumber category status expiryDate issuingAuthority')
      .populate('companyId', 'name code industry')
      .populate('departmentId', 'name code')
      .populate('requestedBy', 'name email role avatarUrl')
      .populate('assignedTo', 'name email role avatarUrl')
      .populate('approvedBy', 'name email role avatarUrl')
      .populate('statusHistory.changedBy', 'name email role')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!renewal) {
      const error = new Error('Renewal record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, renewal.companyId);

    return renewal;
  }

  /**
   * List / Search / Filter / Paginate / Sort Renewal Requests
   */
  static async listRenewals(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      complianceId?: string;
      companyId?: string;
      departmentId?: string;
      status?: RenewalStatus;
      minCost?: number;
      maxCost?: number;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    currentUser: AuthUser
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isDeleted: false };

    // Tenant Isolation
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (currentUser.companyId) {
        filter.companyId = new mongoose.Types.ObjectId(currentUser.companyId);
      }
    } else if (query.companyId) {
      filter.companyId = new mongoose.Types.ObjectId(query.companyId);
    }

    if (query.complianceId) {
      filter.complianceId = new mongoose.Types.ObjectId(query.complianceId);
    }

    if (query.departmentId) {
      filter.departmentId = new mongoose.Types.ObjectId(query.departmentId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.minCost !== undefined || query.maxCost !== undefined) {
      const costFilter: Record<string, number> = {};
      if (query.minCost !== undefined) costFilter.$gte = query.minCost;
      if (query.maxCost !== undefined) costFilter.$lte = query.maxCost;
      filter.renewalCost = costFilter;
    }

    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter.$gte = new Date(query.startDate);
      if (query.endDate) dateFilter.$lte = new Date(query.endDate);
      filter.newExpiryDate = dateFilter;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search, $options: 'i' };
      filter.$or = [
        { renewalNumber: searchRegex },
        { notes: searchRegex },
        { newLicenseNumber: searchRegex },
      ];
    }

    // Sort options
    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [renewals, totalRecords] = await Promise.all([
      RenewalRecordModel.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('complianceId', 'documentName licenseNumber category status expiryDate')
        .populate('companyId', 'name code')
        .populate('departmentId', 'name code')
        .populate('requestedBy', 'name email')
        .populate('assignedTo', 'name email'),
      RenewalRecordModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      renewals,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update Renewal Request Details
   */
  static async updateRenewal(
    renewalId: string,
    input: UpdateRenewalInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IRenewalRecord> {
    const renewal = await RenewalRecordModel.findOne({ _id: renewalId, isDeleted: false });

    if (!renewal) {
      const error = new Error('Renewal record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, renewal.companyId);

    if (input.assignedTo !== undefined) {
      if (input.assignedTo) {
        const user = await UserModel.findById(input.assignedTo);
        if (!user) {
          const error = new Error('Designated assigned user not found.') as Error & { statusCode?: number };
          error.statusCode = 404;
          throw error;
        }
        renewal.assignedTo = new mongoose.Types.ObjectId(input.assignedTo);
      } else {
        renewal.assignedTo = undefined;
      }
    }

    if (input.newExpiryDate) renewal.newExpiryDate = new Date(input.newExpiryDate);
    if (input.nextRenewalDate) renewal.nextRenewalDate = new Date(input.nextRenewalDate);
    if (input.newIssueDate) renewal.newIssueDate = new Date(input.newIssueDate);
    if (input.newLicenseNumber !== undefined) renewal.newLicenseNumber = input.newLicenseNumber.trim();
    if (input.renewalCost !== undefined) renewal.renewalCost = input.renewalCost;
    if (input.currency) renewal.currency = input.currency.toUpperCase();
    if (input.notes !== undefined) renewal.notes = input.notes;

    renewal.updatedBy = new mongoose.Types.ObjectId(currentUser.id);
    await renewal.save();

    // Write Audit Log
    await AuditLogModel.create({
      companyId: renewal.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.RENEWAL_RECORD,
      entityId: renewal._id.toString(),
      details: { updatedFields: Object.keys(input), renewalNumber: renewal.renewalNumber },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return renewal;
  }

  /**
   * Change Renewal Status & Workflow State Transition
   */
  static async changeRenewalStatus(
    renewalId: string,
    input: ChangeRenewalStatusInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IRenewalRecord> {
    const renewal = await RenewalRecordModel.findOne({ _id: renewalId, isDeleted: false });

    if (!renewal) {
      const error = new Error('Renewal record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, renewal.companyId);

    const oldStatus = renewal.status;
    const targetStatus = input.status;

    if (oldStatus === targetStatus) {
      return renewal;
    }

    // Apply optional override inputs if supplied during status change
    if (input.newExpiryDate) renewal.newExpiryDate = new Date(input.newExpiryDate);
    if (input.nextRenewalDate) renewal.nextRenewalDate = new Date(input.nextRenewalDate);
    if (input.newIssueDate) renewal.newIssueDate = new Date(input.newIssueDate);
    if (input.newLicenseNumber) renewal.newLicenseNumber = input.newLicenseNumber.trim();

    renewal.status = targetStatus;

    if (input.rejectionReason) {
      renewal.rejectionReason = input.rejectionReason;
    }

    // Append to status history
    renewal.statusHistory.push({
      status: targetStatus,
      changedBy: new mongoose.Types.ObjectId(currentUser.id),
      comment: input.comment || `Status changed from ${oldStatus} to ${targetStatus}`,
      changedAt: new Date(),
    });

    // Handle Workflow Outcomes
    const complianceRecord = await ComplianceRecordModel.findOne({
      _id: renewal.complianceId,
      isDeleted: false,
    });

    if (targetStatus === RenewalStatus.RENEWED || targetStatus === RenewalStatus.COMPLETED) {
      renewal.approvedBy = new mongoose.Types.ObjectId(currentUser.id);
      renewal.completedAt = new Date();

      if (complianceRecord) {
        complianceRecord.expiryDate = renewal.newExpiryDate;
        if (renewal.newIssueDate) {
          complianceRecord.issueDate = renewal.newIssueDate;
        }
        if (renewal.newLicenseNumber) {
          complianceRecord.licenseNumber = renewal.newLicenseNumber;
        }
        complianceRecord.status = ComplianceStatus.ACTIVE;
        complianceRecord.updatedBy = new mongoose.Types.ObjectId(currentUser.id);
        await complianceRecord.save();
      }
    } else if (targetStatus === RenewalStatus.PROCESSING) {
      if (complianceRecord) {
        complianceRecord.status = ComplianceStatus.PROCESSING;
        await complianceRecord.save();
      }
    } else if (targetStatus === RenewalStatus.PENDING_RENEWAL) {
      if (complianceRecord) {
        complianceRecord.status = ComplianceStatus.PENDING_RENEWAL;
        await complianceRecord.save();
      }
    } else if (targetStatus === RenewalStatus.REJECTED || targetStatus === RenewalStatus.CANCELLED) {
      if (complianceRecord) {
        // Reset status back to EXPIRED or EXPIRING_SOON / ACTIVE
        const now = new Date();
        const diffTime = complianceRecord.expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          complianceRecord.status = ComplianceStatus.EXPIRED;
        } else if (daysRemaining <= 30) {
          complianceRecord.status = ComplianceStatus.EXPIRING_SOON;
        } else {
          complianceRecord.status = ComplianceStatus.ACTIVE;
        }
        await complianceRecord.save();
      }
    }

    renewal.updatedBy = new mongoose.Types.ObjectId(currentUser.id);
    await renewal.save();

    // Write Audit Log
    await AuditLogModel.create({
      companyId: renewal.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.STATUS_CHANGE,
      entity: AuditEntity.RENEWAL_RECORD,
      entityId: renewal._id.toString(),
      details: {
        renewalNumber: renewal.renewalNumber,
        oldStatus,
        newStatus: targetStatus,
        comment: input.comment || '',
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return renewal;
  }

  /**
   * Upload / Replace Attachment for Renewal
   */
  static async uploadAttachment(
    renewalId: string,
    fileBuffer: Buffer,
    fileName: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IRenewalRecord> {
    const renewal = await RenewalRecordModel.findOne({ _id: renewalId, isDeleted: false });

    if (!renewal) {
      const error = new Error('Renewal record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, renewal.companyId);

    if (renewal.attachmentPublicId) {
      await deleteFromCloudinary(renewal.attachmentPublicId);
    }

    const uploadResult = await uploadToCloudinary(
      fileBuffer,
      fileName,
      `company_${renewal.companyId}/renewals`
    );

    renewal.attachmentUrl = uploadResult.url;
    renewal.attachmentPublicId = uploadResult.publicId;
    renewal.receiptUrl = uploadResult.url;
    renewal.updatedBy = new mongoose.Types.ObjectId(currentUser.id);

    await renewal.save();

    await AuditLogModel.create({
      companyId: renewal.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.RENEWAL_RECORD,
      entityId: renewal._id.toString(),
      details: { action: 'ATTACHMENT_UPLOADED', fileName, attachmentUrl: renewal.attachmentUrl },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return renewal;
  }

  /**
   * Remove Attachment from Renewal Record
   */
  static async removeAttachment(
    renewalId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IRenewalRecord> {
    const renewal = await RenewalRecordModel.findOne({ _id: renewalId, isDeleted: false });

    if (!renewal) {
      const error = new Error('Renewal record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, renewal.companyId);

    if (renewal.attachmentPublicId) {
      await deleteFromCloudinary(renewal.attachmentPublicId);
    }

    renewal.attachmentUrl = '';
    renewal.attachmentPublicId = '';
    renewal.receiptUrl = '';
    renewal.updatedBy = new mongoose.Types.ObjectId(currentUser.id);

    await renewal.save();

    await AuditLogModel.create({
      companyId: renewal.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.RENEWAL_RECORD,
      entityId: renewal._id.toString(),
      details: { action: 'ATTACHMENT_REMOVED' },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return renewal;
  }

  /**
   * Soft Delete Renewal Request
   */
  static async deleteRenewal(
    renewalId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const renewal = await RenewalRecordModel.findOne({ _id: renewalId, isDeleted: false });

    if (!renewal) {
      const error = new Error('Renewal record not found or has already been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, renewal.companyId);

    renewal.isDeleted = true;
    renewal.deletedAt = new Date();
    renewal.deletedBy = new mongoose.Types.ObjectId(currentUser.id);

    await renewal.save();

    await AuditLogModel.create({
      companyId: renewal.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.DELETE,
      entity: AuditEntity.RENEWAL_RECORD,
      entityId: renewal._id.toString(),
      details: { renewalNumber: renewal.renewalNumber },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return { message: `Renewal request '${renewal.renewalNumber}' soft deleted successfully.` };
  }

  /**
   * Get Renewal Workflow History
   */
  static async getRenewalHistory(
    renewalId: string,
    currentUser: AuthUser
  ) {
    const renewal = await RenewalRecordModel.findOne({ _id: renewalId, isDeleted: false })
      .populate('statusHistory.changedBy', 'name email role avatarUrl')
      .populate('complianceId', 'documentName licenseNumber');

    if (!renewal) {
      const error = new Error('Renewal record not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, renewal.companyId);

    const auditLogs = await AuditLogModel.find({
      entity: AuditEntity.RENEWAL_RECORD,
      entityId: renewalId,
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role');

    return {
      renewalId: renewal._id,
      renewalNumber: renewal.renewalNumber,
      compliance: renewal.complianceId,
      currentStatus: renewal.status,
      statusHistory: renewal.statusHistory,
      auditHistory: auditLogs,
    };
  }
}

export default RenewalService;
