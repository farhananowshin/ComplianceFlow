import mongoose from 'mongoose';
import ComplianceRecordModel from '../compliance/compliance.model.js';
import RenewalRecordModel from '../renewal/renewal.model.js';
import { UserRole } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';
import { CalendarQueryInput } from './calendar.validation.js';

export interface CalendarEvent {
  id: string;
  eventType: 'EXPIRY' | 'RENEWAL';
  eventDate: Date;
  dateString: string; // YYYY-MM-DD
  title: string;
  licenseNumber?: string;
  category?: string;
  status: string;
  priority?: string;
  complianceId?: string;
  renewalId?: string;
  renewalCost?: number;
  currency?: string;
  company?: {
    id: string;
    name: string;
    code: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  daysRemaining: number;
}

export class CalendarService {
  /**
   * Helper: Multi-Tenant RBAC Scope Filter Resolution
   */
  private static getTenantFilter(currentUser: AuthUser, requestedCompanyId?: string): Record<string, unknown> {
    const filter: Record<string, unknown> = { isDeleted: false };

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (requestedCompanyId) {
        filter.companyId = new mongoose.Types.ObjectId(requestedCompanyId);
      }
    } else {
      if (!currentUser.companyId) {
        const error = new Error('Access Denied: User account is not associated with a company tenant.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      filter.companyId = new mongoose.Types.ObjectId(currentUser.companyId);
    }

    return filter;
  }

  /**
   * Main: Get Monthly Calendar Events via Aggregation Pipelines
   */
  static async getCalendarEvents(currentUser: AuthUser, query: CalendarQueryInput) {
    const baseFilter = this.getTenantFilter(currentUser, query.companyId);

    if (query.departmentId && mongoose.Types.ObjectId.isValid(query.departmentId)) {
      baseFilter.departmentId = new mongoose.Types.ObjectId(query.departmentId);
    }

    // Determine Date Range
    let startRange: Date;
    let endRange: Date;

    const year = query.year || new Date().getFullYear();
    const month = query.month || new Date().getMonth() + 1;

    if (query.startDate && query.endDate) {
      startRange = new Date(query.startDate);
      endRange = new Date(query.endDate);
      endRange.setHours(23, 59, 59, 999);
    } else {
      startRange = new Date(year, month - 1, 1, 0, 0, 0, 0);
      endRange = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
    }

    const now = new Date();

    // 1. Compliance Expiry Events Aggregation Pipeline
    const expiryEventsPipeline: any[] = [
      {
        $match: {
          ...baseFilter,
          expiryDate: { $gte: startRange, $lte: endRange },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      {
        $unwind: { path: '$company', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: { path: '$department', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          eventType: { $literal: 'EXPIRY' },
          eventDate: '$expiryDate',
          title: '$documentName',
          licenseNumber: '$licenseNumber',
          category: '$category',
          status: '$status',
          priority: '$priority',
          complianceId: '$_id',
          company: {
            id: '$company._id',
            name: '$company.name',
            code: '$company.code',
          },
          department: {
            id: '$department._id',
            name: '$department.name',
            code: '$department.code',
          },
        },
      },
    ];

    // 2. Renewal Events Aggregation Pipeline
    const renewalEventsPipeline: any[] = [
      {
        $match: {
          ...baseFilter,
          $or: [
            { newExpiryDate: { $gte: startRange, $lte: endRange } },
            { previousExpiryDate: { $gte: startRange, $lte: endRange } },
            { createdAt: { $gte: startRange, $lte: endRange } },
          ],
        },
      },
      {
        $lookup: {
          from: 'compliancerecords',
          localField: 'complianceId',
          foreignField: '_id',
          as: 'complianceDoc',
        },
      },
      {
        $unwind: { path: '$complianceDoc', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      {
        $unwind: { path: '$company', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: { path: '$department', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          eventType: { $literal: 'RENEWAL' },
          eventDate: { $ifNull: ['$newExpiryDate', '$createdAt'] },
          title: {
            $concat: [
              'Renewal: ',
              { $ifNull: ['$complianceDoc.documentName', '$renewalNumber'] },
            ],
          },
          licenseNumber: '$complianceDoc.licenseNumber',
          category: '$complianceDoc.category',
          status: '$status',
          priority: '$complianceDoc.priority',
          complianceId: '$complianceId',
          renewalId: '$_id',
          renewalCost: '$renewalCost',
          currency: '$currency',
          company: {
            id: '$company._id',
            name: '$company.name',
            code: '$company.code',
          },
          department: {
            id: '$department._id',
            name: '$department.name',
            code: '$department.code',
          },
        },
      },
    ];

    // Execute aggregation pipelines in parallel
    const [rawExpiryEvents, rawRenewalEvents] = await Promise.all([
      query.eventType === 'RENEWAL' ? [] : ComplianceRecordModel.aggregate(expiryEventsPipeline),
      query.eventType === 'EXPIRY' ? [] : RenewalRecordModel.aggregate(renewalEventsPipeline),
    ]);

    // Format & unify events
    const allEvents: CalendarEvent[] = [];

    rawExpiryEvents.forEach((item: any) => {
      const eDate = new Date(item.eventDate);
      const diffTime = eDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      allEvents.push({
        id: item._id.toString(),
        eventType: 'EXPIRY',
        eventDate: eDate,
        dateString: eDate.toISOString().split('T')[0],
        title: item.title,
        licenseNumber: item.licenseNumber,
        category: item.category,
        status: item.status,
        priority: item.priority || 'MEDIUM',
        complianceId: item.complianceId?.toString(),
        company: item.company?.id ? item.company : undefined,
        department: item.department?.id ? item.department : undefined,
        daysRemaining,
      });
    });

    rawRenewalEvents.forEach((item: any) => {
      const eDate = new Date(item.eventDate);
      const diffTime = eDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      allEvents.push({
        id: item._id.toString(),
        eventType: 'RENEWAL',
        eventDate: eDate,
        dateString: eDate.toISOString().split('T')[0],
        title: item.title,
        licenseNumber: item.licenseNumber,
        category: item.category,
        status: item.status,
        priority: item.priority || 'MEDIUM',
        complianceId: item.complianceId?.toString(),
        renewalId: item.renewalId?.toString(),
        renewalCost: item.renewalCost,
        currency: item.currency || 'BDT',
        company: item.company?.id ? item.company : undefined,
        department: item.department?.id ? item.department : undefined,
        daysRemaining,
      });
    });

    // Sort events chronologically
    allEvents.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

    // Group events by date (YYYY-MM-DD) for calendar grid view
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    allEvents.forEach((event) => {
      if (!eventsByDate[event.dateString]) {
        eventsByDate[event.dateString] = [];
      }
      eventsByDate[event.dateString].push(event);
    });

    // Summary Statistics
    const summary = {
      year,
      month,
      startDate: startRange.toISOString(),
      endDate: endRange.toISOString(),
      totalEvents: allEvents.length,
      expiryEventsCount: rawExpiryEvents.length,
      renewalEventsCount: rawRenewalEvents.length,
      criticalEventsCount: allEvents.filter(
        (e) => e.priority === 'CRITICAL' || e.priority === 'HIGH' || e.daysRemaining <= 7
      ).length,
      expiredCount: allEvents.filter((e) => e.status === 'EXPIRED').length,
    };

    return {
      summary,
      eventsByDate,
      events: allEvents,
    };
  }

  /**
   * Get Upcoming Events starting from present date
   */
  static async getUpcomingEvents(currentUser: AuthUser, query: { companyId?: string; limit?: number }) {
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 10;
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return this.getCalendarEvents(currentUser, {
      startDate: now.toISOString(),
      endDate: in90Days.toISOString(),
      companyId: query.companyId,
      eventType: 'ALL',
      limit,
    });
  }
}

export default CalendarService;
