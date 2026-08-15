import mongoose from 'mongoose';
import DepartmentModel, { IDepartment } from './department.model.js';
import CompanyModel from './company.model.js';
import UserModel from '../user/user.model.js';
import AuditLogModel from '../audit/audit.model.js';
import { AuditAction, AuditEntity, DepartmentStatus } from '../../common/constants/enums.js';
import { UserStatus } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  AssignManagerInput,
  UpdateDepartmentStatusInput,
} from './department.validation.js';

export class DepartmentService {
  /**
   * Create a new Department in a Company
   */
  static async createDepartment(
    input: CreateDepartmentInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IDepartment> {
    // 1. Verify Company exists and is not deleted
    const company = await CompanyModel.findOne({ _id: input.companyId, isDeleted: false });
    if (!company) {
      const error = new Error('Associated company not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const companyObjectId = new mongoose.Types.ObjectId(input.companyId);
    const trimmedCode = input.code.trim().toUpperCase();
    const trimmedName = input.name.trim();

    // 2. Validate Duplicate Department Code within the same company
    const existingCode = await DepartmentModel.findOne({
      companyId: companyObjectId,
      code: trimmedCode,
      isDeleted: false,
    });

    if (existingCode) {
      const error = new Error(
        `Department code '${trimmedCode}' already exists within this company.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate Duplicate Department Name within the same company (case-insensitive)
    const existingName = await DepartmentModel.findOne({
      companyId: companyObjectId,
      name: { $regex: new RegExp(`^${trimmedName.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      isDeleted: false,
    });

    if (existingName) {
      const error = new Error(
        `Department with name '${trimmedName}' already exists within this company.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // 4. Validate Manager User if provided
    if (input.managerId) {
      const managerUser = await UserModel.findById(input.managerId);
      if (!managerUser) {
        const error = new Error('Designated manager user account not found.') as Error & { statusCode?: number };
        error.statusCode = 404;
        throw error;
      }
    }

    // 5. Create Department Record
    const department = await DepartmentModel.create({
      name: trimmedName,
      code: trimmedCode,
      companyId: companyObjectId,
      description: input.description || '',
      managerId: input.managerId ? new mongoose.Types.ObjectId(input.managerId) : undefined,
      status: DepartmentStatus.ACTIVE,
      createdBy: currentUser.id as unknown as IDepartment['createdBy'],
      updatedBy: currentUser.id as unknown as IDepartment['updatedBy'],
      isDeleted: false,
    });

    // 6. Audit Log Entry
    await AuditLogModel.create({
      companyId: companyObjectId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.CREATE,
      entity: AuditEntity.DEPARTMENT,
      entityId: department._id.toString(),
      details: {
        name: department.name,
        code: department.code,
        companyId: input.companyId,
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return department;
  }

  /**
   * Get Single Department Details
   */
  static async getDepartmentById(departmentId: string): Promise<IDepartment> {
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      isDeleted: false,
    })
      .populate('companyId', 'name code industry logoUrl status')
      .populate('managerId', 'name email role status avatarUrl phoneNumber');

    if (!department) {
      const error = new Error('Department not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    return department;
  }

  /**
   * List / Search / Filter / Paginate Departments
   */
  static async listDepartments(query: {
    page?: number;
    limit?: number;
    companyId?: string;
    search?: string;
    status?: DepartmentStatus;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isDeleted: false };

    if (query.companyId) {
      filter.companyId = new mongoose.Types.ObjectId(query.companyId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search, $options: 'i' };
      filter.$or = [{ name: searchRegex }, { code: searchRegex }, { description: searchRegex }];
    }

    const [departments, totalRecords] = await Promise.all([
      DepartmentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('companyId', 'name code industry')
        .populate('managerId', 'name email role avatarUrl'),
      DepartmentModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      departments,
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
   * Update Department Information
   */
  static async updateDepartment(
    departmentId: string,
    input: UpdateDepartmentInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IDepartment> {
    const department = await DepartmentModel.findOne({ _id: departmentId, isDeleted: false });

    if (!department) {
      const error = new Error('Department not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // 1. Check duplicate department name if changed
    if (input.name && input.name.trim().toLowerCase() !== department.name.toLowerCase()) {
      const trimmedName = input.name.trim();
      const existingName = await DepartmentModel.findOne({
        _id: { $ne: department._id },
        companyId: department.companyId,
        name: { $regex: new RegExp(`^${trimmedName.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
        isDeleted: false,
      });

      if (existingName) {
        const error = new Error(
          `Another department with name '${trimmedName}' already exists within this company.`
        ) as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
      department.name = trimmedName;
    }

    // 2. Check duplicate department code if changed
    if (input.code && input.code.trim().toUpperCase() !== department.code) {
      const trimmedCode = input.code.trim().toUpperCase();
      const existingCode = await DepartmentModel.findOne({
        _id: { $ne: department._id },
        companyId: department.companyId,
        code: trimmedCode,
        isDeleted: false,
      });

      if (existingCode) {
        const error = new Error(
          `Another department with code '${trimmedCode}' already exists within this company.`
        ) as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
      department.code = trimmedCode;
    }

    // 3. Update description
    if (input.description !== undefined) {
      department.description = input.description;
    }

    // 4. Update status if provided
    if (input.status) {
      department.status = input.status;
    }

    // 5. Update manager if provided
    if (input.managerId !== undefined) {
      if (input.managerId) {
        const managerUser = await UserModel.findById(input.managerId);
        if (!managerUser) {
          const error = new Error('Designated manager user account not found.') as Error & { statusCode?: number };
          error.statusCode = 404;
          throw error;
        }
        department.managerId = new mongoose.Types.ObjectId(input.managerId);
      } else {
        department.managerId = undefined;
      }
    }

    department.updatedBy = currentUser.id as unknown as IDepartment['updatedBy'];
    await department.save();

    // Audit Log Entry
    await AuditLogModel.create({
      companyId: department.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.DEPARTMENT,
      entityId: department._id.toString(),
      details: { updatedFields: Object.keys(input) },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return department;
  }

  /**
   * Assign or Reassign Department Manager
   */
  static async assignManager(
    departmentId: string,
    input: AssignManagerInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IDepartment> {
    const department = await DepartmentModel.findOne({ _id: departmentId, isDeleted: false });

    if (!department) {
      const error = new Error('Department not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const managerUser = await UserModel.findById(input.managerId);
    if (!managerUser) {
      const error = new Error('Designated manager user account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    department.managerId = new mongoose.Types.ObjectId(input.managerId);
    department.updatedBy = currentUser.id as unknown as IDepartment['updatedBy'];
    await department.save();

    // Optionally assign manager's department reference to this department
    if (!managerUser.departmentId || managerUser.departmentId.toString() !== department._id.toString()) {
      managerUser.departmentId = department._id;
      await managerUser.save();
    }

    // Audit Log Entry
    await AuditLogModel.create({
      companyId: department.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.DEPARTMENT,
      entityId: department._id.toString(),
      details: {
        action: 'ASSIGN_MANAGER',
        managerId: input.managerId,
        managerName: managerUser.name,
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return department;
  }

  /**
   * Activate / Deactivate Department Status
   */
  static async updateStatus(
    departmentId: string,
    input: UpdateDepartmentStatusInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IDepartment> {
    const department = await DepartmentModel.findOne({ _id: departmentId, isDeleted: false });

    if (!department) {
      const error = new Error('Department not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    department.status = input.status;
    department.updatedBy = currentUser.id as unknown as IDepartment['updatedBy'];
    await department.save();

    // Audit Log Entry
    await AuditLogModel.create({
      companyId: department.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.STATUS_CHANGE,
      entity: AuditEntity.DEPARTMENT,
      entityId: department._id.toString(),
      details: { action: 'UPDATE_DEPARTMENT_STATUS', status: input.status },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return department;
  }

  /**
   * Soft Delete Department
   */
  static async deleteDepartment(
    departmentId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const department = await DepartmentModel.findOne({ _id: departmentId, isDeleted: false });

    if (!department) {
      const error = new Error('Department not found or has already been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // Business Rule Check: Do not allow deleting a department if active users are assigned to it
    const activeUsersCount = await UserModel.countDocuments({
      departmentId: department._id,
      status: UserStatus.ACTIVE,
    });

    if (activeUsersCount > 0) {
      const error = new Error(
        `Cannot delete department '${department.name}' because ${activeUsersCount} active user(s) are assigned to it. Please reassign active users first.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    department.isDeleted = true;
    department.deletedAt = new Date();
    department.deletedBy = currentUser.id as unknown as IDepartment['deletedBy'];
    department.status = DepartmentStatus.INACTIVE;

    await department.save();

    // Audit Log Entry
    await AuditLogModel.create({
      companyId: department.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.DELETE,
      entity: AuditEntity.DEPARTMENT,
      entityId: department._id.toString(),
      details: { name: department.name, code: department.code },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return { message: `Department '${department.name}' has been soft deleted successfully.` };
  }
}

export default DepartmentService;
