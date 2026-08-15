import CompanyModel, { ICompany } from './company.model.js';
import AuditLogModel from '../audit/audit.model.js';
import { AuditAction, AuditEntity, CompanyStatus } from '../../common/constants/enums.js';
import { AuthUser } from '../../common/types/express.types.js';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  UpdateCompanySettingsInput,
  UpdateReminderSettingsInput,
  UploadCompanyLogoInput,
} from './company.validation.js';

export class CompanyService {
  /**
   * Create a new Company entry
   */
  static async createCompany(
    input: CreateCompanyInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ICompany> {
    // 1. Validate Duplicate Registration Number (active companies)
    const existingReg = await CompanyModel.findOne({
      registrationNumber: input.registrationNumber.trim(),
      isDeleted: false,
    });

    if (existingReg) {
      const error = new Error(
        `A company with registration number '${input.registrationNumber}' already exists.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate Duplicate Company Code
    const existingCode = await CompanyModel.findOne({
      code: input.code.trim().toUpperCase(),
      isDeleted: false,
    });

    if (existingCode) {
      const error = new Error(
        `A company with code identifier '${input.code}' already exists.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // 3. Create Company Record
    const company = await CompanyModel.create({
      ...input,
      code: input.code.trim().toUpperCase(),
      registrationNumber: input.registrationNumber.trim(),
      status: CompanyStatus.ACTIVE,
      isDeleted: false,
    });

    // 4. Audit Log Entry
    await AuditLogModel.create({
      companyId: company._id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.CREATE,
      entity: AuditEntity.COMPANY,
      entityId: company._id.toString(),
      details: {
        name: company.name,
        code: company.code,
        registrationNumber: company.registrationNumber,
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return company;
  }

  /**
   * Get single company by ID
   */
  static async getCompanyById(companyId: string): Promise<ICompany> {
    const company = await CompanyModel.findOne({
      _id: companyId,
      isDeleted: false,
    }).populate('parentCompanyId', 'name code industry');

    if (!company) {
      const error = new Error('Company not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    return company;
  }

  /**
   * List / Paginate Companies with filters
   */
  static async listCompanies(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CompanyStatus;
    industry?: string;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isDeleted: false };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.industry) {
      filter.industry = { $regex: query.industry, $options: 'i' };
    }

    if (query.search) {
      const searchRegex = { $regex: query.search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { registrationNumber: searchRegex },
        { contactEmail: searchRegex },
      ];
    }

    const [companies, totalRecords] = await Promise.all([
      CompanyModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('parentCompanyId', 'name code'),
      CompanyModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      companies,
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
   * Update Company General Information
   */
  static async updateCompany(
    companyId: string,
    input: UpdateCompanyInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ICompany> {
    const company = await CompanyModel.findOne({ _id: companyId, isDeleted: false });

    if (!company) {
      const error = new Error('Company not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // 1. Check duplicate registration number if changed
    if (input.registrationNumber && input.registrationNumber !== company.registrationNumber) {
      const existingReg = await CompanyModel.findOne({
        _id: { $ne: companyId },
        registrationNumber: input.registrationNumber.trim(),
        isDeleted: false,
      });

      if (existingReg) {
        const error = new Error(
          `Another company with registration number '${input.registrationNumber}' already exists.`
        ) as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
      company.registrationNumber = input.registrationNumber.trim();
    }

    // 2. Check duplicate company code if changed
    if (input.code && input.code.toUpperCase() !== company.code) {
      const existingCode = await CompanyModel.findOne({
        _id: { $ne: companyId },
        code: input.code.trim().toUpperCase(),
        isDeleted: false,
      });

      if (existingCode) {
        const error = new Error(
          `Another company with code identifier '${input.code}' already exists.`
        ) as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
      company.code = input.code.trim().toUpperCase();
    }

    // Update fields
    if (input.name) company.name = input.name;
    if (input.taxId !== undefined) company.taxId = input.taxId;
    if (input.industry) company.industry = input.industry;
    if (input.contactEmail) company.contactEmail = input.contactEmail;
    if (input.contactPhone !== undefined) company.contactPhone = input.contactPhone;
    if (input.logoUrl !== undefined) company.logoUrl = input.logoUrl;
    if (input.status) company.status = input.status;
    if (input.address) {
      company.address = { ...company.address, ...input.address };
    }
    if (input.parentCompanyId !== undefined) {
      company.parentCompanyId = input.parentCompanyId
        ? (input.parentCompanyId as unknown as ICompany['parentCompanyId'])
        : undefined;
    }

    await company.save();

    // Audit Log
    await AuditLogModel.create({
      companyId: company._id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPANY,
      entityId: company._id.toString(),
      details: { updatedFields: Object.keys(input) },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return company;
  }

  /**
   * Upload / Update Company Logo
   */
  static async uploadLogo(
    companyId: string,
    input: UploadCompanyLogoInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ICompany> {
    const company = await CompanyModel.findOne({ _id: companyId, isDeleted: false });

    if (!company) {
      const error = new Error('Company not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    company.logoUrl = input.logoUrl;
    await company.save();

    await AuditLogModel.create({
      companyId: company._id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPANY,
      entityId: company._id.toString(),
      details: { action: 'UPDATE_COMPANY_LOGO', logoUrl: input.logoUrl },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return company;
  }

  /**
   * Update Company General Settings
   */
  static async updateSettings(
    companyId: string,
    input: UpdateCompanySettingsInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ICompany> {
    const company = await CompanyModel.findOne({ _id: companyId, isDeleted: false });

    if (!company) {
      const error = new Error('Company not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    company.settings = { ...company.settings, ...input };
    await company.save();

    await AuditLogModel.create({
      companyId: company._id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPANY,
      entityId: company._id.toString(),
      details: { action: 'UPDATE_COMPANY_SETTINGS', settings: input },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return company;
  }

  /**
   * Update Compliance Reminder Settings
   */
  static async updateReminderSettings(
    companyId: string,
    input: UpdateReminderSettingsInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ICompany> {
    const company = await CompanyModel.findOne({ _id: companyId, isDeleted: false });

    if (!company) {
      const error = new Error('Company not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    company.reminderSettings = { ...company.reminderSettings, ...input };
    await company.save();

    await AuditLogModel.create({
      companyId: company._id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPANY,
      entityId: company._id.toString(),
      details: { action: 'UPDATE_REMINDER_SETTINGS', reminderSettings: input },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return company;
  }

  /**
   * Soft Delete Company
   */
  static async deleteCompany(
    companyId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const company = await CompanyModel.findOne({ _id: companyId, isDeleted: false });

    if (!company) {
      const error = new Error('Company not found or has already been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    company.isDeleted = true;
    company.deletedAt = new Date();
    company.deletedBy = currentUser.id as unknown as ICompany['deletedBy'];
    company.status = CompanyStatus.INACTIVE;

    await company.save();

    await AuditLogModel.create({
      companyId: company._id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.DELETE,
      entity: AuditEntity.COMPANY,
      entityId: company._id.toString(),
      details: { name: company.name, code: company.code },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return { message: `Company '${company.name}' has been soft deleted successfully.` };
  }
}

export default CompanyService;
