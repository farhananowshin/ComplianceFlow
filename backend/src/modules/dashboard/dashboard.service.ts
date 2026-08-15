import mongoose from 'mongoose';
import ComplianceRecordModel from '../compliance/compliance.model.js';
import RenewalRecordModel from '../renewal/renewal.model.js';
import DepartmentModel from '../company/department.model.js';
import AuditLogModel from '../audit/audit.model.js';
import {
  ComplianceStatus,
  PriorityLevel,
  RenewalStatus,
} from '../../common/constants/enums.js';
import { UserRole } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';

export class DashboardService {
  /**
   * Helper: Validate multi-tenant access control and resolve company/employee scope
   */
  private static getCompanyFilter(currentUser: AuthUser, requestedCompanyId?: string): Record<string, unknown> {
    const filter: Record<string, unknown> = { isDeleted: false };

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (requestedCompanyId) {
        filter.companyId = new mongoose.Types.ObjectId(requestedCompanyId);
      }
    } else {
      if (!currentUser.companyId) {
        const error = new Error('Access Denied: User is not associated with any company tenant.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      filter.companyId = new mongoose.Types.ObjectId(currentUser.companyId);
    }

    // Role Restriction for EMPLOYEE role
    if (currentUser.role === UserRole.EMPLOYEE) {
      const employeeConditions: Record<string, unknown>[] = [
        { responsiblePersonId: new mongoose.Types.ObjectId(currentUser.id) },
      ];
      if (currentUser.departmentId) {
        employeeConditions.push({ departmentId: new mongoose.Types.ObjectId(currentUser.departmentId) });
      }
      filter.$or = employeeConditions;
    }

    return filter;
  }

  /**
   * Get Complete Dashboard Overview
   * Includes: Summary Cards, Health Score, Expiry Forecast, Risk Summary, High Risk Docs & Recent Activities
   */
  static async getOverview(currentUser: AuthUser, requestedCompanyId?: string, requestedDepartmentId?: string) {
    const baseFilter = this.getCompanyFilter(currentUser, requestedCompanyId);

    if (requestedDepartmentId) {
      baseFilter.departmentId = new mongoose.Types.ObjectId(requestedDepartmentId);
    }

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Single DB Roundtrip using MongoDB $facet pipeline
    const facetResults = await ComplianceRecordModel.aggregate([
      { $match: baseFilter },
      {
        $facet: {
          cards: [
            {
              $group: {
                _id: null,
                totalDocuments: { $sum: 1 },
                activeDocuments: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', [ComplianceStatus.ACTIVE, ComplianceStatus.COMPLIANT]] },
                      1,
                      0,
                    ],
                  },
                },
                expiringSoonDocuments: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ['$status', ComplianceStatus.EXPIRING_SOON] },
                          { $eq: ['$status', ComplianceStatus.NEARING_EXPIRY] },
                          {
                            $and: [
                              { $gt: ['$expiryDate', now] },
                              { $lte: ['$expiryDate', in30Days] },
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                expiredDocuments: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ['$status', ComplianceStatus.EXPIRED] },
                          { $eq: ['$status', ComplianceStatus.NON_COMPLIANT] },
                          { $lte: ['$expiryDate', now] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pendingRenewals: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', [ComplianceStatus.PENDING_RENEWAL, ComplianceStatus.PROCESSING, ComplianceStatus.PENDING]] },
                      1,
                      0,
                    ],
                  },
                },
                renewedDocuments: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', ComplianceStatus.RENEWED] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          forecast: [
            {
              $group: {
                _id: null,
                next30Days: {
                  $sum: {
                    $cond: [
                      { $and: [{ $gt: ['$expiryDate', now] }, { $lte: ['$expiryDate', in30Days] }] },
                      1,
                      0,
                    ],
                  },
                },
                next60Days: {
                  $sum: {
                    $cond: [
                      { $and: [{ $gt: ['$expiryDate', in30Days] }, { $lte: ['$expiryDate', in60Days] }] },
                      1,
                      0,
                    ],
                  },
                },
                next90Days: {
                  $sum: {
                    $cond: [
                      { $and: [{ $gt: ['$expiryDate', in60Days] }, { $lte: ['$expiryDate', in90Days] }] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          risk: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const facet = facetResults[0] || {};
    const cardData = facet.cards?.[0] || {
      totalDocuments: 0,
      activeDocuments: 0,
      expiringSoonDocuments: 0,
      expiredDocuments: 0,
      pendingRenewals: 0,
      renewedDocuments: 0,
    };

    const forecastData = facet.forecast?.[0] || {
      next30Days: 0,
      next60Days: 0,
      next90Days: 0,
    };

    // Additional check for total renewed in RenewalRecordModel
    const renewalFilter: Record<string, unknown> = { isDeleted: false };
    if (baseFilter.companyId) renewalFilter.companyId = baseFilter.companyId;
    if (baseFilter.departmentId) renewalFilter.departmentId = baseFilter.departmentId;

    const renewedRecordsCount = await RenewalRecordModel.countDocuments({
      ...renewalFilter,
      status: { $in: [RenewalStatus.RENEWED, RenewalStatus.APPROVED, RenewalStatus.COMPLETED] },
    });

    const totalRenewedCount = Math.max(cardData.renewedDocuments || 0, renewedRecordsCount);

    const cards = {
      totalDocuments: cardData.totalDocuments || 0,
      activeDocuments: cardData.activeDocuments || 0,
      expiringSoonDocuments: cardData.expiringSoonDocuments || 0,
      expiredDocuments: cardData.expiredDocuments || 0,
      pendingRenewals: cardData.pendingRenewals || 0,
      renewedDocuments: totalRenewedCount,
    };

    // 2. Compliance Health Score Calculation
    // Formula: (Active + Renewed Documents) / Total Documents * 100
    const activePlusRenewed = cards.activeDocuments + cards.renewedDocuments;
    const totalDocs = cards.totalDocuments;

    let rawScore = 100;
    if (totalDocs > 0) {
      rawScore = (activePlusRenewed / totalDocs) * 100;
    }
    const healthScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

    let healthRating: 'Excellent' | 'Good' | 'Fair' | 'Critical' = 'Critical';
    if (healthScore >= 90) healthRating = 'Excellent';
    else if (healthScore >= 75) healthRating = 'Good';
    else if (healthScore >= 50) healthRating = 'Fair';
    else healthRating = 'Critical';

    const healthSummary = {
      score: healthScore,
      rating: healthRating,
      activePlusRenewed,
      totalDocuments: totalDocs,
      formula: '(Active + Renewed Documents) / Total Documents * 100',
    };

    // 3. Risk Summary & Distribution
    const riskMap: Record<string, number> = {
      [PriorityLevel.HIGH]: 0,
      [PriorityLevel.MEDIUM]: 0,
      [PriorityLevel.LOW]: 0,
      [PriorityLevel.CRITICAL]: 0,
    };

    const riskRaw = facet.risk || [];
    riskRaw.forEach((item: { _id: string; count: number }) => {
      if (item._id) {
        riskMap[item._id] = item.count;
      }
    });

    const riskSummary = {
      low: riskMap[PriorityLevel.LOW] || 0,
      medium: riskMap[PriorityLevel.MEDIUM] || 0,
      high: (riskMap[PriorityLevel.HIGH] || 0) + (riskMap[PriorityLevel.CRITICAL] || 0),
      critical: riskMap[PriorityLevel.CRITICAL] || 0,
    };

    // 4. Expiry Forecast
    const expiryForecast = {
      next30Days: forecastData.next30Days || 0,
      next60Days: forecastData.next60Days || 0,
      next90Days: forecastData.next90Days || 0,
    };

    // 5. Top High-Risk Documents requiring immediate action
    const highRiskDocuments = await ComplianceRecordModel.find({
      ...baseFilter,
      $or: [
        { priority: { $in: [PriorityLevel.HIGH, PriorityLevel.CRITICAL] } },
        { status: { $in: [ComplianceStatus.EXPIRED, ComplianceStatus.NON_COMPLIANT] } },
        { expiryDate: { $lte: in30Days } },
      ],
    })
      .sort({ expiryDate: 1, priority: -1 })
      .limit(10)
      .populate('departmentId', 'name code')
      .populate('responsiblePersonId', 'name email avatarUrl');

    // 6. Recent Activities Widget (Last 10 audit logs)
    const auditFilter: Record<string, unknown> = {};
    if (baseFilter.companyId) {
      auditFilter.companyId = baseFilter.companyId;
    }
    if (currentUser.role === UserRole.EMPLOYEE) {
      auditFilter.userId = new mongoose.Types.ObjectId(currentUser.id);
    }

    const recentActivities = await AuditLogModel.find(auditFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email avatarUrl role');

    return {
      cards,
      healthSummary,
      riskSummary,
      expiryForecast,
      highRiskDocuments,
      recentActivities,
    };
  }

  /**
   * Get Dashboard Charts Analytics
   * Includes: Category Distribution, Department Compliance, Monthly Renewal Trend
   */
  static async getCharts(currentUser: AuthUser, requestedCompanyId?: string, requestedDepartmentId?: string) {
    const baseFilter = this.getCompanyFilter(currentUser, requestedCompanyId);

    if (requestedDepartmentId) {
      baseFilter.departmentId = new mongoose.Types.ObjectId(requestedDepartmentId);
    }

    const now = new Date();

    // 1. Chart Data - Category Distribution
    const categoryPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 as const } },
    ];

    const categoryRaw = await ComplianceRecordModel.aggregate(categoryPipeline);
    const totalDocs = await ComplianceRecordModel.countDocuments(baseFilter);
    const safeTotal = totalDocs || 1;

    const categoryDistribution = categoryRaw.map((item) => ({
      category: item._id || 'Uncategorized',
      count: item.count,
      percentage: Math.round((item.count / safeTotal) * 1000) / 10,
    }));

    // 2. Chart Data - Department-wise Compliance
    const deptCompanyFilter = baseFilter.companyId ? { companyId: baseFilter.companyId, isDeleted: false } : { isDeleted: false };
    const departments = await DepartmentModel.find(deptCompanyFilter).select('name code');

    const departmentCompliancePipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                { $in: ['$status', [ComplianceStatus.ACTIVE, ComplianceStatus.COMPLIANT, ComplianceStatus.RENEWED]] },
                1,
                0,
              ],
            },
          },
          expiringSoon: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', ComplianceStatus.EXPIRING_SOON] },
                    { $eq: ['$status', ComplianceStatus.NEARING_EXPIRY] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          expired: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', ComplianceStatus.EXPIRED] },
                    { $eq: ['$status', ComplianceStatus.NON_COMPLIANT] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const deptStatsRaw = await ComplianceRecordModel.aggregate(departmentCompliancePipeline);
    const deptStatsMap = new Map<string, { total: number; active: number; expiringSoon: number; expired: number }>();
    deptStatsRaw.forEach((d) => {
      if (d._id) {
        deptStatsMap.set(d._id.toString(), {
          total: d.total,
          active: d.active,
          expiringSoon: d.expiringSoon,
          expired: d.expired,
        });
      }
    });

    const departmentCompliance = departments.map((dept) => {
      const stats = deptStatsMap.get(dept._id.toString()) || { total: 0, active: 0, expiringSoon: 0, expired: 0 };
      const rate = stats.total > 0 ? Math.round((stats.active / stats.total) * 1000) / 10 : 100;
      return {
        departmentId: dept._id,
        departmentName: dept.name,
        departmentCode: dept.code,
        totalDocuments: stats.total,
        activeDocuments: stats.active,
        expiringSoonDocuments: stats.expiringSoon,
        expiredDocuments: stats.expired,
        complianceRate: rate,
      };
    });

    // 3. Chart Data - Monthly Renewal Trend (Current Year)
    const renewalFilter: Record<string, unknown> = { isDeleted: false };
    if (baseFilter.companyId) renewalFilter.companyId = baseFilter.companyId;
    if (baseFilter.departmentId) renewalFilter.departmentId = baseFilter.departmentId;

    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyTrendPipeline = [
      {
        $match: {
          ...renewalFilter,
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, status: '$status' },
          count: { $sum: 1 },
          totalCost: { $sum: '$renewalCost' },
        },
      },
    ];

    const monthlyTrendRaw = await RenewalRecordModel.aggregate(monthlyTrendPipeline);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyTrendMap = new Map<number, { renewed: number; pending: number; totalCost: number }>();
    for (let m = 1; m <= 12; m++) {
      monthlyTrendMap.set(m, { renewed: 0, pending: 0, totalCost: 0 });
    }

    monthlyTrendRaw.forEach((item) => {
      const m = item._id.month;
      const status = item._id.status;
      const entry = monthlyTrendMap.get(m);
      if (entry) {
        if ([RenewalStatus.RENEWED, RenewalStatus.APPROVED, RenewalStatus.COMPLETED].includes(status)) {
          entry.renewed += item.count;
        } else {
          entry.pending += item.count;
        }
        entry.totalCost += item.totalCost || 0;
      }
    });

    const monthlyRenewalTrend = Array.from(monthlyTrendMap.entries()).map(([monthNum, data]) => ({
      month: monthNames[monthNum - 1],
      monthNumber: monthNum,
      renewed: data.renewed,
      pending: data.pending,
      totalCost: Math.round(data.totalCost * 100) / 100,
    }));

    return {
      categoryDistribution,
      departmentCompliance,
      monthlyRenewalTrend,
    };
  }
}

export default DashboardService;

