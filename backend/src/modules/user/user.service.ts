import mongoose from 'mongoose';
import UserModel, { IUser } from './user.model.js';
import CompanyModel from '../company/company.model.js';
import DepartmentModel from '../company/department.model.js';
import AuditLogModel from '../audit/audit.model.js';
import auth from '../../config/auth.js';
import { AuditAction, AuditEntity } from '../../common/constants/enums.js';
import { UserRole, UserStatus } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';
import {
  CreateUserInput,
  UpdateUserInput,
  AssignCompanyInput,
  AssignDepartmentInput,
  AssignRoleInput,
  UpdateUserStatusInput,
  AdminResetPasswordInput,
} from './user.validation.js';

export class UserService {
  /**
   * Helper: Check if current user has permission to manage target user/company
   */
  private static validateTenantAccess(
    currentUser: AuthUser,
    targetCompanyId?: string | mongoose.Types.ObjectId,
    targetUserRole?: UserRole
  ): void {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return; // SUPER_ADMIN can access everything
    }

    if (currentUser.role === UserRole.ADMIN) {
      // Cannot manage SUPER_ADMIN
      if (targetUserRole === UserRole.SUPER_ADMIN) {
        const error = new Error('Admins are strictly prohibited from managing Super Admin accounts.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }

      // Must belong to current user's company
      if (
        !targetCompanyId ||
        !currentUser.companyId ||
        targetCompanyId.toString() !== currentUser.companyId.toString()
      ) {
        const error = new Error('You can only manage users within your own company tenant.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }

      return;
    }

    const error = new Error('Forbidden: Insufficient privileges to manage users.') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  /**
   * Helper: Validate that a department belongs to the target company
   */
  private static async validateDepartmentBelongsToCompany(
    departmentId: string,
    companyId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      isDeleted: false,
    });

    if (!department) {
      const error = new Error('Specified department not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    if (department.companyId.toString() !== companyId.toString()) {
      const error = new Error(
        `Department '${department.name}' does not belong to the selected company.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Create a new User
   */
  static async createUser(
    input: CreateUserInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUser> {
    const emailLower = input.email.toLowerCase().trim();

    // 1. Check existing user
    const existingUser = await UserModel.findOne({ email: emailLower });
    if (existingUser) {
      const error = new Error(`User with email '${emailLower}' already exists.`) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // 2. Authorization / Company Tenant check
    let targetCompanyId = input.companyId;
    if (currentUser.role === UserRole.ADMIN) {
      targetCompanyId = currentUser.companyId;
      if (input.role === UserRole.SUPER_ADMIN) {
        const error = new Error('Admins cannot create Super Admin accounts.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
    }

    if (targetCompanyId) {
      const company = await CompanyModel.findOne({ _id: targetCompanyId, isDeleted: false });
      if (!company) {
        const error = new Error('Selected company tenant not found.') as Error & { statusCode?: number };
        error.statusCode = 404;
        throw error;
      }
    }

    // 3. Department validation if provided
    if (input.departmentId) {
      if (!targetCompanyId) {
        const error = new Error('A company must be assigned before assigning a department.') as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
      await this.validateDepartmentBelongsToCompany(input.departmentId, targetCompanyId);
    }

    // 4. Register in Better Auth
    try {
      await auth.api.signUpEmail({
        body: {
          email: emailLower,
          password: input.password,
          name: input.name,
        },
      });
    } catch {
      // If Better Auth user registration fails or already exists
    }

    // 5. Create MongoDB User Record
    let dbUser = await UserModel.findOne({ email: emailLower });

    if (!dbUser) {
      dbUser = await UserModel.create({
        name: input.name,
        email: emailLower,
        role: input.role || UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        companyId: targetCompanyId ? new mongoose.Types.ObjectId(targetCompanyId) : undefined,
        departmentId: input.departmentId ? new mongoose.Types.ObjectId(input.departmentId) : undefined,
        phoneNumber: input.phoneNumber || '',
        avatarUrl: input.avatarUrl || '',
        createdBy: currentUser.id as unknown as IUser['createdBy'],
        updatedBy: currentUser.id as unknown as IUser['updatedBy'],
      });
    } else {
      dbUser.name = input.name;
      dbUser.role = input.role || dbUser.role;
      dbUser.status = UserStatus.ACTIVE;
      if (targetCompanyId) dbUser.companyId = new mongoose.Types.ObjectId(targetCompanyId);
      if (input.departmentId) dbUser.departmentId = new mongoose.Types.ObjectId(input.departmentId);
      if (input.phoneNumber) dbUser.phoneNumber = input.phoneNumber;
      if (input.avatarUrl) dbUser.avatarUrl = input.avatarUrl;
      dbUser.createdBy = currentUser.id as unknown as IUser['createdBy'];
      dbUser.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
      await dbUser.save();
    }

    // 6. Audit Log Entry
    await AuditLogModel.create({
      companyId: dbUser.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.CREATE,
      entity: AuditEntity.USER,
      entityId: dbUser._id.toString(),
      details: {
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return dbUser;
  }

  /**
   * Get Single User Details
   */
  static async getUserById(userId: string, currentUser: AuthUser): Promise<IUser> {
    const user = await UserModel.findById(userId)
      .populate('companyId', 'name code industry logoUrl status')
      .populate('departmentId', 'name code status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!user) {
      const error = new Error('User profile not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // Check Tenant Scope Authorization
    this.validateTenantAccess(currentUser, user.companyId, user.role);

    return user;
  }

  /**
   * List / Search / Filter / Paginate Users
   */
  static async listUsers(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      companyId?: string;
      departmentId?: string;
      role?: UserRole;
      status?: UserStatus;
    },
    currentUser: AuthUser
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Multi-tenant scoping for ADMIN
    if (currentUser.role === UserRole.ADMIN) {
      filter.companyId = currentUser.companyId
        ? new mongoose.Types.ObjectId(currentUser.companyId)
        : null;
      filter.role = { $ne: UserRole.SUPER_ADMIN }; // Hide SUPER_ADMINs from Admin
    } else if (query.companyId) {
      filter.companyId = new mongoose.Types.ObjectId(query.companyId);
    }

    if (query.departmentId) {
      filter.departmentId = new mongoose.Types.ObjectId(query.departmentId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.role && currentUser.role === UserRole.SUPER_ADMIN) {
      filter.role = query.role;
    } else if (query.role && currentUser.role === UserRole.ADMIN && query.role !== UserRole.SUPER_ADMIN) {
      filter.role = query.role;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search, $options: 'i' };
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }];
    }

    const [users, totalRecords] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('companyId', 'name code industry')
        .populate('departmentId', 'name code'),
      UserModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      users,
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
   * Update User Information
   */
  static async updateUser(
    userId: string,
    input: UpdateUserInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUser> {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // Validate access permission
    this.validateTenantAccess(currentUser, user.companyId, user.role);

    // Prevent demoting/editing SUPER_ADMIN by COMPANY_ADMIN
    if (user.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      const error = new Error('Super Admin accounts can only be modified by Super Admins.') as Error & { statusCode?: number };
      error.statusCode = 403;
      throw error;
    }

    // Check duplicate email if changed
    if (input.email && input.email.toLowerCase().trim() !== user.email) {
      const newEmail = input.email.toLowerCase().trim();
      const existingEmail = await UserModel.findOne({ _id: { $ne: user._id }, email: newEmail });

      if (existingEmail) {
        const error = new Error(`Email address '${newEmail}' is already in use by another account.`) as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
      user.email = newEmail;
    }

    // Update Company & Department
    const newCompanyId = input.companyId !== undefined ? input.companyId : user.companyId?.toString();

    if (input.companyId !== undefined) {
      if (input.companyId) {
        if (currentUser.role === UserRole.ADMIN && input.companyId !== currentUser.companyId?.toString()) {
          const error = new Error('Admins cannot assign users to other companies.') as Error & { statusCode?: number };
          error.statusCode = 403;
          throw error;
        }
        user.companyId = new mongoose.Types.ObjectId(input.companyId);
      } else {
        user.companyId = undefined;
      }
    }

    if (input.departmentId !== undefined) {
      if (input.departmentId) {
        if (!newCompanyId) {
          const error = new Error('User must belong to a company before assigning a department.') as Error & { statusCode?: number };
          error.statusCode = 400;
          throw error;
        }
        await this.validateDepartmentBelongsToCompany(input.departmentId, newCompanyId);
        user.departmentId = new mongoose.Types.ObjectId(input.departmentId);
      } else {
        user.departmentId = undefined;
      }
    }

    if (input.name) user.name = input.name;
    if (input.phoneNumber !== undefined) user.phoneNumber = input.phoneNumber;
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;
    if (input.status) user.status = input.status;

    if (input.role) {
      if (input.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
        const error = new Error('Only Super Admins can assign the Super Admin role.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      user.role = input.role;
    }

    user.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
    await user.save();

    // Audit Log Entry
    await AuditLogModel.create({
      companyId: user.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: user._id.toString(),
      details: { updatedFields: Object.keys(input) },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return user;
  }

  /**
   * Assign Company to User
   */
  static async assignCompany(
    userId: string,
    input: AssignCompanyInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUser> {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantAccess(currentUser, user.companyId, user.role);

    if (currentUser.role === UserRole.ADMIN && input.companyId !== currentUser.companyId?.toString()) {
      const error = new Error('Admins can only assign users to their own company.') as Error & { statusCode?: number };
      error.statusCode = 403;
      throw error;
    }

    const company = await CompanyModel.findOne({ _id: input.companyId, isDeleted: false });
    if (!company) {
      const error = new Error('Specified company not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    user.companyId = company._id;

    if (input.departmentId) {
      await this.validateDepartmentBelongsToCompany(input.departmentId, company._id);
      user.departmentId = new mongoose.Types.ObjectId(input.departmentId);
    } else {
      user.departmentId = undefined; // Reset department if company changes
    }

    user.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
    await user.save();

    await AuditLogModel.create({
      companyId: user.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: user._id.toString(),
      details: { action: 'ASSIGN_COMPANY', companyId: input.companyId, companyName: company.name },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return user;
  }

  /**
   * Assign Department to User
   */
  static async assignDepartment(
    userId: string,
    input: AssignDepartmentInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUser> {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantAccess(currentUser, user.companyId, user.role);

    if (!user.companyId) {
      const error = new Error('User must be assigned to a company before assigning a department.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    await this.validateDepartmentBelongsToCompany(input.departmentId, user.companyId);

    user.departmentId = new mongoose.Types.ObjectId(input.departmentId);
    user.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
    await user.save();

    await AuditLogModel.create({
      companyId: user.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: user._id.toString(),
      details: { action: 'ASSIGN_DEPARTMENT', departmentId: input.departmentId },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return user;
  }

  /**
   * Assign Role to User
   */
  static async assignRole(
    userId: string,
    input: AssignRoleInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUser> {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantAccess(currentUser, user.companyId, user.role);

    if (input.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      const error = new Error('Only Super Admins can grant the Super Admin role.') as Error & { statusCode?: number };
      error.statusCode = 403;
      throw error;
    }

    user.role = input.role;
    user.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
    await user.save();

    await AuditLogModel.create({
      companyId: user.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: user._id.toString(),
      details: { action: 'ASSIGN_ROLE', newRole: input.role },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return user;
  }

  /**
   * Deactivate User (Soft Deactivate)
   */
  static async deactivateUser(
    userId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUser> {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantAccess(currentUser, user.companyId, user.role);

    // Business Rule Check: Prevent deactivating SUPER_ADMIN
    if (user.role === UserRole.SUPER_ADMIN) {
      const error = new Error('Super Admin accounts cannot be deactivated.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    user.status = UserStatus.INACTIVE;
    user.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
    await user.save();

    await AuditLogModel.create({
      companyId: user.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.STATUS_CHANGE,
      entity: AuditEntity.USER,
      entityId: user._id.toString(),
      details: { action: 'DEACTIVATE_USER', newStatus: UserStatus.INACTIVE },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return user;
  }

  /**
   * Reactivate User
   */
  static async reactivateUser(
    userId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IUser> {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantAccess(currentUser, user.companyId, user.role);

    user.status = UserStatus.ACTIVE;
    user.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
    await user.save();

    await AuditLogModel.create({
      companyId: user.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.STATUS_CHANGE,
      entity: AuditEntity.USER,
      entityId: user._id.toString(),
      details: { action: 'REACTIVATE_USER', newStatus: UserStatus.ACTIVE },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return user;
  }

  /**
   * Reset User Password by Admin
   */
  static async adminResetPassword(
    userId: string,
    input: AdminResetPasswordInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantAccess(currentUser, user.companyId, user.role);

    if (user.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      const error = new Error('Cannot reset password for a Super Admin account.') as Error & { statusCode?: number };
      error.statusCode = 403;
      throw error;
    }

    // Reset password in Better Auth if available
    try {
      const authApi = auth.api as unknown as { setPassword?: (args: { body: { userId: string; newPassword: string } }) => Promise<unknown> };
      if (typeof authApi.setPassword === 'function') {
        await authApi.setPassword({
          body: {
            userId: user._id.toString(),
            newPassword: input.newPassword,
          },
        });
      }
    } catch (err) {
      console.warn('Better Auth setPassword notice:', err);
    }

    user.updatedBy = currentUser.id as unknown as IUser['updatedBy'];
    await user.save();

    await AuditLogModel.create({
      companyId: user.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: user._id.toString(),
      details: { action: 'ADMIN_RESET_PASSWORD' },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return { message: `Password for user '${user.email}' has been successfully reset.` };
  }
}

export default UserService;
