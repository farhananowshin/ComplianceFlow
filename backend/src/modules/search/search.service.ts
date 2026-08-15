import mongoose from 'mongoose';
import ComplianceRecordModel from '../compliance/compliance.model.js';
import CompanyModel from '../company/company.model.js';
import DepartmentModel from '../company/department.model.js';
import UserModel from '../user/user.model.js';
import RenewalRecordModel from '../renewal/renewal.model.js';
import { NotificationModel } from '../notification/notification.model.js';
import { UserRole } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';

export interface SearchResultItem {
  id: string;
  entityType: 'compliance' | 'company' | 'department' | 'user' | 'renewal' | 'notification';
  title: string;
  subtitle?: string;
  status?: string;
  companyId?: string;
  departmentId?: string;
  createdAt: Date;
  details: Record<string, unknown>;
}

export class SearchService {
  /**
   * Helper function to escape special regex characters safely
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * Execute Global Search with Multi-Tenant RBAC, Pagination, and Filters
   */
  static async search(
    currentUser: AuthUser,
    queryParams: {
      searchTerm?: string;
      entities?: string[];
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: string;
      companyId?: string;
      departmentId?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const searchTerm = (queryParams.searchTerm || '').trim();
    const page = queryParams.page && queryParams.page > 0 ? queryParams.page : 1;
    const limit = queryParams.limit && queryParams.limit > 0 ? Math.min(queryParams.limit, 100) : 10;
    const sortDir = queryParams.sortOrder === 'asc' ? 1 : -1;
    const sortField = queryParams.sortBy || 'createdAt';

    const targetEntities = queryParams.entities && queryParams.entities.length > 0
      ? queryParams.entities
      : ['compliance', 'company', 'department', 'user', 'renewal', 'notification'];

    // Multi-tenant company filter
    let tenantCompanyId: mongoose.Types.ObjectId | undefined;

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (queryParams.companyId && mongoose.Types.ObjectId.isValid(queryParams.companyId)) {
        tenantCompanyId = new mongoose.Types.ObjectId(queryParams.companyId);
      }
    } else {
      if (!currentUser.companyId) {
        const error = new Error('Access Denied: User is not associated with a valid tenant company.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      tenantCompanyId = new mongoose.Types.ObjectId(currentUser.companyId);
    }

    // Prepare regex condition
    const searchRegex = searchTerm ? new RegExp(this.escapeRegex(searchTerm), 'i') : null;

    // Date Range Filter
    const dateFilter: Record<string, unknown> = {};
    if (queryParams.startDate || queryParams.endDate) {
      dateFilter.createdAt = {};
      if (queryParams.startDate) {
        (dateFilter.createdAt as Record<string, unknown>).$gte = new Date(queryParams.startDate);
      }
      if (queryParams.endDate) {
        const eDate = new Date(queryParams.endDate);
        eDate.setHours(23, 59, 59, 999);
        (dateFilter.createdAt as Record<string, unknown>).$lte = eDate;
      }
    }

    // Results container
    const entityResults: Record<string, { items: SearchResultItem[]; total: number }> = {
      compliance: { items: [], total: 0 },
      company: { items: [], total: 0 },
      department: { items: [], total: 0 },
      user: { items: [], total: 0 },
      renewal: { items: [], total: 0 },
      notification: { items: [], total: 0 },
    };

    const searchPromises: Promise<void>[] = [];

    // 1. Search Compliance Records
    if (targetEntities.includes('compliance')) {
      searchPromises.push(
        (async () => {
          const filter: Record<string, unknown> = { isDeleted: false, ...dateFilter };
          if (tenantCompanyId) filter.companyId = tenantCompanyId;
          if (queryParams.departmentId && mongoose.Types.ObjectId.isValid(queryParams.departmentId)) {
            filter.departmentId = new mongoose.Types.ObjectId(queryParams.departmentId);
          }
          if (queryParams.status) filter.status = queryParams.status;

          if (searchRegex) {
            filter.$or = [
              { documentName: searchRegex },
              { licenseNumber: searchRegex },
              { category: searchRegex },
              { issuingAuthority: searchRegex },
              { notes: searchRegex },
            ];
          }

          const sortObj: Record<string, 1 | -1> = {};
          if (sortField === 'documentName' || sortField === 'name') sortObj.documentName = sortDir;
          else sortObj.createdAt = sortDir;

          const [docs, count] = await Promise.all([
            ComplianceRecordModel.find(filter)
              .sort(sortObj)
              .skip((page - 1) * limit)
              .limit(limit)
              .populate('companyId', 'name code')
              .populate('departmentId', 'name code'),
            ComplianceRecordModel.countDocuments(filter),
          ]);

          entityResults.compliance = {
            total: count,
            items: docs.map((doc) => ({
              id: doc._id.toString(),
              entityType: 'compliance',
              title: doc.documentName,
              subtitle: `License: ${doc.licenseNumber || 'N/A'} | Category: ${doc.category}`,
              status: doc.status,
              companyId: doc.companyId ? (doc.companyId as any)._id?.toString() || doc.companyId.toString() : undefined,
              departmentId: doc.departmentId ? (doc.departmentId as any)._id?.toString() || doc.departmentId.toString() : undefined,
              createdAt: doc.createdAt,
              details: {
                licenseNumber: doc.licenseNumber,
                category: doc.category,
                issuingAuthority: doc.issuingAuthority,
                expiryDate: doc.expiryDate,
                companyName: (doc.companyId as any)?.name,
                departmentName: (doc.departmentId as any)?.name,
              },
            })),
          };
        })()
      );
    }

    // 2. Search Companies
    if (targetEntities.includes('company')) {
      searchPromises.push(
        (async () => {
          const filter: Record<string, unknown> = { ...dateFilter };
          if (tenantCompanyId) {
            filter._id = tenantCompanyId;
          }
          if (queryParams.status) filter.status = queryParams.status;

          if (searchRegex) {
            filter.$or = [
              { name: searchRegex },
              { code: searchRegex },
              { registrationNumber: searchRegex },
              { taxId: searchRegex },
              { industry: searchRegex },
              { contactEmail: searchRegex },
            ];
          }

          const [companies, count] = await Promise.all([
            CompanyModel.find(filter)
              .sort({ createdAt: sortDir })
              .skip((page - 1) * limit)
              .limit(limit),
            CompanyModel.countDocuments(filter),
          ]);

          entityResults.company = {
            total: count,
            items: companies.map((comp) => ({
              id: comp._id.toString(),
              entityType: 'company',
              title: comp.name,
              subtitle: `Code: ${comp.code} | Industry: ${comp.industry}`,
              status: comp.status,
              companyId: comp._id.toString(),
              createdAt: comp.createdAt,
              details: {
                code: comp.code,
                registrationNumber: comp.registrationNumber,
                industry: comp.industry,
                contactEmail: comp.contactEmail,
              },
            })),
          };
        })()
      );
    }

    // 3. Search Departments
    if (targetEntities.includes('department')) {
      searchPromises.push(
        (async () => {
          const filter: Record<string, unknown> = { isDeleted: false, ...dateFilter };
          if (tenantCompanyId) filter.companyId = tenantCompanyId;
          if (queryParams.status) filter.status = queryParams.status;

          if (searchRegex) {
            filter.$or = [
              { name: searchRegex },
              { code: searchRegex },
              { description: searchRegex },
            ];
          }

          const [depts, count] = await Promise.all([
            DepartmentModel.find(filter)
              .sort({ createdAt: sortDir })
              .skip((page - 1) * limit)
              .limit(limit)
              .populate('companyId', 'name code'),
            DepartmentModel.countDocuments(filter),
          ]);

          entityResults.department = {
            total: count,
            items: depts.map((dept) => ({
              id: dept._id.toString(),
              entityType: 'department',
              title: dept.name,
              subtitle: `Code: ${dept.code} | ${dept.description || 'Department'}`,
              status: dept.status,
              companyId: dept.companyId ? (dept.companyId as any)._id?.toString() || dept.companyId.toString() : undefined,
              createdAt: dept.createdAt,
              details: {
                code: dept.code,
                description: dept.description,
                companyName: (dept.companyId as any)?.name,
              },
            })),
          };
        })()
      );
    }

    // 4. Search Users
    if (targetEntities.includes('user')) {
      searchPromises.push(
        (async () => {
          const filter: Record<string, unknown> = { ...dateFilter };
          if (tenantCompanyId) filter.companyId = tenantCompanyId;
          if (queryParams.departmentId && mongoose.Types.ObjectId.isValid(queryParams.departmentId)) {
            filter.departmentId = new mongoose.Types.ObjectId(queryParams.departmentId);
          }
          if (queryParams.status) filter.status = queryParams.status;

          if (searchRegex) {
            filter.$or = [
              { name: searchRegex },
              { email: searchRegex },
              { phoneNumber: searchRegex },
              { role: searchRegex },
            ];
          }

          const [users, count] = await Promise.all([
            UserModel.find(filter)
              .sort({ createdAt: sortDir })
              .skip((page - 1) * limit)
              .limit(limit)
              .select('-password')
              .populate('companyId', 'name code')
              .populate('departmentId', 'name code'),
            UserModel.countDocuments(filter),
          ]);

          entityResults.user = {
            total: count,
            items: users.map((u) => ({
              id: u._id.toString(),
              entityType: 'user',
              title: u.name,
              subtitle: `${u.role} | Email: ${u.email}`,
              status: u.status,
              companyId: u.companyId ? (u.companyId as any)._id?.toString() || u.companyId.toString() : undefined,
              departmentId: u.departmentId ? (u.departmentId as any)._id?.toString() || u.departmentId.toString() : undefined,
              createdAt: u.createdAt,
              details: {
                email: u.email,
                role: u.role,
                phoneNumber: u.phoneNumber,
                companyName: (u.companyId as any)?.name,
                departmentName: (u.departmentId as any)?.name,
              },
            })),
          };
        })()
      );
    }

    // 5. Search Renewals
    if (targetEntities.includes('renewal')) {
      searchPromises.push(
        (async () => {
          const filter: Record<string, unknown> = { isDeleted: false, ...dateFilter };
          if (tenantCompanyId) filter.companyId = tenantCompanyId;
          if (queryParams.departmentId && mongoose.Types.ObjectId.isValid(queryParams.departmentId)) {
            filter.departmentId = new mongoose.Types.ObjectId(queryParams.departmentId);
          }
          if (queryParams.status) filter.status = queryParams.status;

          if (searchRegex) {
            filter.$or = [
              { renewalNumber: searchRegex },
              { newLicenseNumber: searchRegex },
              { notes: searchRegex },
              { rejectionReason: searchRegex },
            ];
          }

          const [renewals, count] = await Promise.all([
            RenewalRecordModel.find(filter)
              .sort({ createdAt: sortDir })
              .skip((page - 1) * limit)
              .limit(limit)
              .populate('complianceId', 'documentName licenseNumber')
              .populate('companyId', 'name code'),
            RenewalRecordModel.countDocuments(filter),
          ]);

          entityResults.renewal = {
            total: count,
            items: renewals.map((r) => ({
              id: r._id.toString(),
              entityType: 'renewal',
              title: `Renewal ${r.renewalNumber}`,
              subtitle: `Doc: ${(r.complianceId as any)?.documentName || 'Compliance'} | Cost: ${r.currency} ${r.renewalCost}`,
              status: r.status,
              companyId: r.companyId ? (r.companyId as any)._id?.toString() || r.companyId.toString() : undefined,
              createdAt: r.createdAt,
              details: {
                renewalNumber: r.renewalNumber,
                complianceId: r.complianceId ? (r.complianceId as any)._id?.toString() || r.complianceId.toString() : undefined,
                documentName: (r.complianceId as any)?.documentName,
                renewalCost: r.renewalCost,
                currency: r.currency,
                newExpiryDate: r.newExpiryDate,
              },
            })),
          };
        })()
      );
    }

    // 6. Search Notifications
    if (targetEntities.includes('notification')) {
      searchPromises.push(
        (async () => {
          const filter: Record<string, unknown> = { ...dateFilter };
          if (tenantCompanyId) filter.companyId = tenantCompanyId;

          // Non-admin users only see notifications sent to them
          if (!([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER] as UserRole[]).includes(currentUser.role as UserRole)) {
            filter.recipientId = new mongoose.Types.ObjectId(currentUser.id);
          }

          if (searchRegex) {
            filter.$or = [
              { title: searchRegex },
              { message: searchRegex },
            ];
          }

          const [notifications, count] = await Promise.all([
            NotificationModel.find(filter)
              .sort({ createdAt: sortDir })
              .skip((page - 1) * limit)
              .limit(limit)
              .populate('companyId', 'name code'),
            NotificationModel.countDocuments(filter),
          ]);

          entityResults.notification = {
            total: count,
            items: notifications.map((n) => ({
              id: n._id.toString(),
              entityType: 'notification',
              title: n.title,
              subtitle: n.message,
              status: n.isRead ? 'READ' : 'UNREAD',
              companyId: n.companyId ? (n.companyId as any)._id?.toString() || n.companyId.toString() : undefined,
              createdAt: n.createdAt,
              details: {
                type: n.type,
                priority: n.priority,
                isRead: n.isRead,
                relatedComplianceId: n.relatedComplianceId,
              },
            })),
          };
        })()
      );
    }

    // Await all parallel queries
    await Promise.all(searchPromises);

    // Combine all matching items into a single unified list
    const combinedList: SearchResultItem[] = [];
    let totalResultsCount = 0;

    Object.keys(entityResults).forEach((key) => {
      const res = entityResults[key as keyof typeof entityResults];
      combinedList.push(...res.items);
      totalResultsCount += res.total;
    });

    // Sort combined list by createdAt
    combinedList.sort((a, b) => (sortDir === 1 ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()));

    return {
      query: searchTerm,
      entitiesSearched: targetEntities,
      summaryCounts: {
        compliance: entityResults.compliance.total,
        company: entityResults.company.total,
        department: entityResults.department.total,
        user: entityResults.user.total,
        renewal: entityResults.renewal.total,
        notification: entityResults.notification.total,
        total: totalResultsCount,
      },
      resultsByEntity: entityResults,
      flatResults: combinedList.slice(0, limit),
      meta: {
        page,
        limit,
        totalResults: totalResultsCount,
        totalPages: Math.ceil(totalResultsCount / limit) || 1,
      },
    };
  }
}

export default SearchService;
