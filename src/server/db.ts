import { Company, User, ComplianceRecord, AuditLog, NotificationItem, DashboardMetrics, DepartmentItem, RenewalRecord, RenewalStatus } from '../types/index.js';

// Seed Initial Departments
let departments: DepartmentItem[] = [
  {
    id: 'dept_01',
    name: 'Legal, Tax & Regulatory Affairs',
    code: 'LEGAL',
    description: 'Trade license, e-TIN, VAT/BIN, and RJSC compliance in Bangladesh.',
    companyId: 'comp_01',
    companyName: 'Dhaka Tech & Enterprise Ltd.',
    managerId: 'usr_compliance',
    managerName: 'Tanvir Ahmed',
    managerEmail: 'tanvir.ahmed@dhakatech.com.bd',
    status: 'ACTIVE',
    memberCount: 8,
    complianceRecordCount: 0,
    createdAt: '2023-01-10',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dept_02',
    name: 'Environment, Health & Safety (EHS)',
    code: 'EHS',
    description: 'Fire license, Department of Environment clearance, and DIFE safety compliance.',
    companyId: 'comp_02',
    companyName: 'Bengal Pharma & Healthcare Ltd.',
    managerId: 'usr_company_admin',
    managerName: 'Rahim Chowdhury',
    managerEmail: 'rahim@bengalpharma.com.bd',
    status: 'ACTIVE',
    memberCount: 12,
    complianceRecordCount: 0,
    createdAt: '2022-06-15',
    updatedAt: new Date().toISOString()
  }
];

// Seed Initial Enterprise Companies
let companies: Company[] = [
  {
    id: 'comp_01',
    name: 'Dhaka Tech & Enterprise Ltd.',
    registrationNumber: 'RJSC-C-198210',
    taxId: 'TIN-8839201928',
    industry: 'Information Technology & Software',
    country: 'Bangladesh',
    status: 'active',
    complianceScore: 100,
    contactEmail: 'contact@dhakatech.com.bd',
    contactPhone: '+880 1711 000000',
    address: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
    createdDate: '2024-01-15'
  },
  {
    id: 'comp_02',
    name: 'Bengal Pharma & Healthcare Ltd.',
    registrationNumber: 'RJSC-C-204120',
    taxId: 'TIN-1120492812',
    industry: 'Pharmaceuticals & Healthcare',
    country: 'Bangladesh',
    status: 'active',
    complianceScore: 100,
    contactEmail: 'regulatory@bengalpharma.com.bd',
    contactPhone: '+880 1819 111222',
    address: 'Plot 15, Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
    createdDate: '2023-06-10'
  }
];

// Seed Initial Enterprise Users
let users: User[] = [
  {
    id: 'usr_admin',
    name: 'Adrita Chakraborty',
    email: 'admin@compliance.com.bd',
    phone: '+880 1711 234567',
    role: 'super_admin',
    companyId: 'comp_01',
    companyName: 'Dhaka Tech & Enterprise Ltd.',
    department: 'Legal, Tax & Regulatory Affairs',
    avatar: '',
    status: 'active',
    lastLogin: new Date().toISOString(),
    mfaEnabled: true,
    createdAt: '2022-01-15T08:30:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'usr_compliance',
    name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@dhakatech.com.bd',
    phone: '+880 1819 876543',
    role: 'compliance_officer',
    companyId: 'comp_01',
    companyName: 'Dhaka Tech & Enterprise Ltd.',
    department: 'Legal, Tax & Regulatory Affairs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    mfaEnabled: true,
    createdAt: '2023-01-10T09:15:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'usr_company_admin',
    name: 'Rahim Chowdhury',
    email: 'rahim@bengalpharma.com.bd',
    phone: '+880 1912 345678',
    role: 'company_admin',
    companyId: 'comp_02',
    companyName: 'Bengal Pharma & Healthcare Ltd.',
    department: 'Environment, Health & Safety (EHS)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'active',
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    mfaEnabled: true,
    createdAt: '2022-06-15T14:20:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

// Helper date strings relative to today
const today = new Date();
const formatDate = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Seed Initial Compliance Records
let records: ComplianceRecord[] = [];

// Seed Initial Renewal Requests
let renewals: RenewalRecord[] = [];

// Seed Initial Audit Logs
let auditLogs: AuditLog[] = [
  {
    id: 'audit_1001',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    userId: 'usr_compliance',
    userName: 'Farhana Nowshin',
    userRole: 'compliance_officer',
    companyId: 'comp_01',
    action: 'INITIATED_RENEWAL',
    entityType: 'ComplianceRecord',
    entityId: 'rec_101',
    details: 'Initiated stage 2 renewal workflow for ISO 27001 Certification.',
    ipAddress: '192.168.1.104',
    status: 'success'
  },
  {
    id: 'audit_1002',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    userId: 'usr_admin',
    userName: 'Sarah Chowdhury',
    userRole: 'super_admin',
    companyId: 'comp_01',
    action: 'UPDATED_RECORD',
    entityType: 'ComplianceRecord',
    entityId: 'rec_105',
    details: 'Updated renewal cost estimate from ৳8,000 to ৳9,500 BDT.',
    ipAddress: '10.0.4.12',
    status: 'success'
  },
  {
    id: 'audit_1003',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    userId: 'usr_company_admin',
    userName: 'Rahim Chowdhury',
    userRole: 'company_admin',
    companyId: 'comp_02',
    action: 'DOCUMENT_UPLOAD',
    entityType: 'ComplianceRecord',
    entityId: 'rec_103',
    details: 'Uploaded updated proof of payment for FDA Facility Registration.',
    ipAddress: '172.16.0.88',
    status: 'success'
  },
  {
    id: 'audit_1004',
    timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
    userId: 'usr_auditor',
    userName: 'Adrita Chakraborty',
    userRole: 'auditor',
    companyId: 'comp_02',
    action: 'EXPORTED_REPORT',
    entityType: 'System',
    entityId: 'sys_reports',
    details: 'Exported quarterly compliance & risk exposure audit summary in CSV.',
    ipAddress: '198.51.100.42',
    status: 'success'
  }
];

// Seed Initial Notifications
let notifications: NotificationItem[] = [];

// Database Methods API
export const DbStore = {
  // Departments
  getDepartments: (filter?: { companyId?: string; search?: string; status?: string }) => {
    let result = [...departments];
    if (filter?.companyId && filter.companyId !== 'all') {
      result = result.filter(d => d.companyId === filter.companyId);
    }
    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter(d => d.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          (d.managerName && d.managerName.toLowerCase().includes(q))
      );
    }
    return result;
  },
  getDepartmentById: (id: string) => departments.find(d => d.id === id),
  addDepartment: (data: Partial<DepartmentItem>) => {
    const comp = companies.find(c => c.id === data.companyId) || companies[0];
    let mgrName = null;
    let mgrEmail = null;
    if (data.managerId) {
      const u = users.find(usr => usr.id === data.managerId);
      if (u) {
        mgrName = u.name;
        mgrEmail = u.email;
      }
    }

    const newDept: DepartmentItem = {
      id: 'dept_' + Math.random().toString(36).substring(2, 9),
      name: data.name || 'New Department',
      code: (data.code || 'DEPT').toUpperCase(),
      description: data.description || '',
      companyId: comp.id,
      companyName: comp.name,
      managerId: data.managerId || null,
      managerName: mgrName,
      managerEmail: mgrEmail,
      status: (data.status as any) || 'ACTIVE',
      memberCount: data.memberCount ?? 1,
      complianceRecordCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };
    departments.unshift(newDept);
    DbStore.logAudit({
      userId: 'usr_admin',
      userName: 'System Admin',
      userRole: 'super_admin',
      companyId: newDept.companyId,
      action: 'CREATED_DEPARTMENT',
      entityType: 'System',
      entityId: newDept.id,
      details: `Created department ${newDept.name} (${newDept.code}).`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });
    return newDept;
  },
  updateDepartment: (id: string, updates: Partial<DepartmentItem>) => {
    const idx = departments.findIndex(d => d.id === id);
    if (idx !== -1) {
      if (updates.managerId !== undefined) {
        if (updates.managerId) {
          const mgr = users.find(u => u.id === updates.managerId);
          updates.managerName = mgr ? mgr.name : null;
          updates.managerEmail = mgr ? mgr.email : null;
        } else {
          updates.managerName = null;
          updates.managerEmail = null;
        }
      }
      departments[idx] = { ...departments[idx], ...updates, updatedAt: new Date().toISOString() };
      return departments[idx];
    }
    return null;
  },
  deleteDepartment: (id: string) => {
    const idx = departments.findIndex(d => d.id === id);
    if (idx !== -1) {
      const removed = departments[idx];
      departments.splice(idx, 1);
      return removed;
    }
    return null;
  },

  // Companies
  getCompanies: () => companies,
  getCompanyById: (id: string) => companies.find(c => c.id === id),
  addCompany: (compData: Omit<Company, 'id' | 'createdDate' | 'complianceScore'>) => {
    const newComp: Company = {
      ...compData,
      id: 'comp_' + Math.random().toString(36).substr(2, 9),
      createdDate: new Date().toISOString().split('T')[0],
      complianceScore: 100
    };
    companies.push(newComp);
    DbStore.logAudit({
      userId: 'usr_admin',
      userName: 'System Admin',
      userRole: 'super_admin',
      companyId: newComp.id,
      action: 'CREATED_COMPANY',
      entityType: 'Company',
      entityId: newComp.id,
      details: `Registered company ${newComp.name} (${newComp.registrationNumber}).`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });
    return newComp;
  },
  updateCompany: (id: string, updates: Partial<Company>) => {
    const idx = companies.findIndex(c => c.id === id);
    if (idx !== -1) {
      companies[idx] = { ...companies[idx], ...updates };
      return companies[idx];
    }
    return null;
  },

  // Users
  getUsers: (filters?: {
    companyId?: string;
    department?: string;
    role?: string;
    status?: string;
    search?: string;
    sortBy?: 'name' | 'createdAt' | 'lastLogin';
    sortOrder?: 'asc' | 'desc';
  }) => {
    let result = [...users];
    if (filters) {
      const { companyId, department, role, status, search, sortBy, sortOrder } = filters;

      if (companyId && companyId !== 'all') {
        result = result.filter(u => u.companyId === companyId);
      }
      if (department && department !== 'all') {
        result = result.filter(u => u.department && u.department.toLowerCase() === department.toLowerCase());
      }
      if (role && role !== 'all') {
        result = result.filter(u => u.role === role);
      }
      if (status && status !== 'ALL' && status !== 'all') {
        result = result.filter(u => u.status === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          (u.companyName && u.companyName.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q))
        );
      }
      if (sortBy) {
        const order = sortOrder === 'desc' ? -1 : 1;
        result.sort((a, b) => {
          let valA = '';
          let valB = '';
          if (sortBy === 'name') {
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
          } else if (sortBy === 'createdAt') {
            valA = a.createdAt || '';
            valB = b.createdAt || '';
          } else if (sortBy === 'lastLogin') {
            valA = a.lastLogin || '';
            valB = b.lastLogin || '';
          }
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      }
    }
    return result;
  },
  getUserById: (id: string) => users.find(u => u.id === id),
  addUser: (userData: Partial<User>) => {
    const company = userData.companyId ? DbStore.getCompanyById(userData.companyId) : null;
    const now = new Date().toISOString();
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: userData.name || 'New User',
      email: userData.email || '',
      phone: userData.phone || '',
      role: (userData.role as any) || 'viewer',
      companyId: userData.companyId || 'comp_01',
      companyName: company ? company.name : userData.companyName || 'Enterprise Entity',
      department: userData.department || 'General Operations',
      avatar: userData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      status: (userData.status as any) || 'active',
      mfaEnabled: userData.mfaEnabled ?? false,
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
    };
    users.unshift(newUser);
    DbStore.logAudit({
      userId: 'usr_admin',
      userName: 'System Admin',
      userRole: 'super_admin',
      companyId: newUser.companyId,
      action: 'CREATED_USER',
      entityType: 'User',
      entityId: newUser.id,
      details: `Created user ${newUser.name} (${newUser.email}).`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });
    return newUser;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      if (updates.companyId && updates.companyId !== users[idx].companyId) {
        const comp = DbStore.getCompanyById(updates.companyId);
        if (comp) {
          updates.companyName = comp.name;
        }
      }
      users[idx] = {
        ...users[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      DbStore.logAudit({
        userId: 'usr_admin',
        userName: 'System Admin',
        userRole: 'super_admin',
        companyId: users[idx].companyId,
        action: 'UPDATED_USER',
        entityType: 'User',
        entityId: id,
        details: `Updated user profile/credentials for ${users[idx].name}.`,
        ipAddress: '127.0.0.1',
        status: 'success'
      });
      return users[idx];
    }
    return null;
  },
  deleteUser: (id: string) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const deleted = users[idx];
      users.splice(idx, 1);
      return deleted;
    }
    return null;
  },

  // Records
  getRecords: (companyIdFilter?: string) => {
    if (companyIdFilter && companyIdFilter !== 'all') {
      return records.filter(r => r.companyId === companyIdFilter);
    }
    return records;
  },
  getRecordById: (id: string) => records.find(r => r.id === id),
  getRecordByQrToken: (token: string) => {
    if (!token) return null;
    const clean = token.trim().toLowerCase();
    return records.find(r => 
      (r.qrToken && r.qrToken.toLowerCase() === clean) ||
      (r.id && r.id.toLowerCase() === clean) ||
      (r.code && r.code.toLowerCase() === clean) ||
      (r.qrToken && clean.includes(r.qrToken.toLowerCase())) ||
      (r.id && clean.includes(r.id.toLowerCase()))
    ) || null;
  },
  addRecord: (recordData: Omit<ComplianceRecord, 'id' | 'qrToken' | 'status'>, actor: { userId: string; userName: string; userRole: string }) => {
    // Determine status automatically based on expiry
    const expDate = new Date(recordData.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    let status: ComplianceRecord['status'] = 'compliant';
    if (daysUntilExpiry < 0) {
      status = 'expired';
    } else if (daysUntilExpiry <= 30) {
      status = 'warning';
    }

    const id = 'rec_' + Math.random().toString(36).substr(2, 9);
    const newRecord: ComplianceRecord = {
      ...recordData,
      id,
      status,
      qrToken: 'QR-' + recordData.code + '-' + Math.floor(100000 + Math.random() * 900000),
      renewalStep: 'not_started'
    };

    records.push(newRecord);
    DbStore.recalculateCompanyComplianceScore(newRecord.companyId);

    DbStore.logAudit({
      userId: actor.userId,
      userName: actor.userName,
      userRole: actor.userRole,
      companyId: newRecord.companyId,
      action: 'CREATED_RECORD',
      entityType: 'ComplianceRecord',
      entityId: newRecord.id,
      details: `Created compliance record ${newRecord.title} (${newRecord.code}).`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return newRecord;
  },

  updateRecord: (id: string, updates: Partial<ComplianceRecord>, actor: { userId: string; userName: string; userRole: string }) => {
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
      // Re-evaluate status if expiry date updated
      if (updates.expiryDate) {
        const expDate = new Date(updates.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysUntilExpiry < 0) {
          updates.status = 'expired';
        } else if (daysUntilExpiry <= 30 && records[idx].status !== 'renewal_in_progress') {
          updates.status = 'warning';
        } else if (daysUntilExpiry > 30) {
          updates.status = 'compliant';
        }
      }

      records[idx] = { ...records[idx], ...updates };
      DbStore.recalculateCompanyComplianceScore(records[idx].companyId);

      DbStore.logAudit({
        userId: actor.userId,
        userName: actor.userName,
        userRole: actor.userRole,
        companyId: records[idx].companyId,
        action: 'UPDATED_RECORD',
        entityType: 'ComplianceRecord',
        entityId: id,
        details: `Updated compliance record ${records[idx].title}.`,
        ipAddress: '127.0.0.1',
        status: 'success'
      });

      return records[idx];
    }
    return null;
  },

  deleteRecord: (id: string, actor: { userId: string; userName: string; userRole: string }) => {
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
      const rec = records[idx];
      records.splice(idx, 1);
      DbStore.recalculateCompanyComplianceScore(rec.companyId);
      DbStore.logAudit({
        userId: actor.userId,
        userName: actor.userName,
        userRole: actor.userRole,
        companyId: rec.companyId,
        action: 'DELETED_RECORD',
        entityType: 'ComplianceRecord',
        entityId: id,
        details: `Deleted compliance record ${rec.title}.`,
        ipAddress: '127.0.0.1',
        status: 'warning'
      });
      return true;
    }
    return false;
  },

  advanceRenewalWorkflow: (id: string, nextStep: ComplianceRecord['renewalStep'], notes: string, actor: { userId: string; userName: string; userRole: string }) => {
    const rec = DbStore.getRecordById(id);
    if (!rec) return null;

    let newStatus: ComplianceRecord['status'] = 'renewal_in_progress';
    if (nextStep === 'completed') {
      newStatus = 'compliant';
      // Automatically extend expiry date by 365 days
      const currentExpiry = new Date(rec.expiryDate);
      currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
      rec.expiryDate = currentExpiry.toISOString().split('T')[0];
      rec.lastRenewedDate = new Date().toISOString().split('T')[0];
    }

    rec.renewalStep = nextStep;
    rec.status = newStatus;
    if (notes) {
      rec.notes = (rec.notes ? rec.notes + '\n' : '') + `[${new Date().toLocaleDateString()}] ${actor.userName}: ${notes}`;
    }

    DbStore.recalculateCompanyComplianceScore(rec.companyId);

    DbStore.logAudit({
      userId: actor.userId,
      userName: actor.userName,
      userRole: actor.userRole,
      companyId: rec.companyId,
      action: 'RENEWAL_WORKFLOW_ADVANCED',
      entityType: 'Renewal',
      entityId: id,
      details: `Advanced renewal workflow step for ${rec.title} to '${nextStep}'. Notes: ${notes || 'N/A'}`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return rec;
  },

  // Recalculate company health score
  recalculateCompanyComplianceScore: (companyId: string) => {
    const companyRecords = records.filter(r => r.companyId === companyId);
    if (companyRecords.length === 0) return;
    const compliantCount = companyRecords.filter(r => r.status === 'compliant' || r.status === 'renewal_in_progress').length;
    const score = Math.round((compliantCount / companyRecords.length) * 100);
    const comp = companies.find(c => c.id === companyId);
    if (comp) {
      comp.complianceScore = score;
    }
  },

  // Metrics Generator
  getDashboardMetrics: (companyIdFilter?: string): DashboardMetrics => {
    const list = DbStore.getRecords(companyIdFilter);
    const totalRecords = list.length;
    const compliantCount = list.filter(r => r.status === 'compliant').length;
    const warningCount = list.filter(r => r.status === 'warning').length;
    const expiredCount = list.filter(r => r.status === 'expired').length;
    const inProgressCount = list.filter(r => r.status === 'renewal_in_progress' || r.status === 'pending_review').length;

    const overallComplianceScore = totalRecords > 0 
      ? Math.round(((compliantCount + inProgressCount) / totalRecords) * 100) 
      : 100;

    const nowTime = new Date().getTime();
    let expiringIn30Days = 0;
    let expiringIn60Days = 0;
    let expiringIn90Days = 0;
    let totalEstimatedRenewalCost = 0;

    list.forEach(r => {
      totalEstimatedRenewalCost += r.estimatedCost || 0;
      const days = Math.ceil((new Date(r.expiryDate).getTime() - nowTime) / (1000 * 3600 * 24));
      if (days >= 0 && days <= 30) expiringIn30Days++;
      if (days >= 0 && days <= 60) expiringIn60Days++;
      if (days >= 0 && days <= 90) expiringIn90Days++;
    });

    // Breakdown by category
    const catMap: Record<string, { total: number; compliant: number }> = {};
    list.forEach(r => {
      if (!catMap[r.category]) {
        catMap[r.category] = { total: 0, compliant: 0 };
      }
      catMap[r.category].total++;
      if (r.status === 'compliant' || r.status === 'renewal_in_progress') {
        catMap[r.category].compliant++;
      }
    });

    const categoryBreakdown = Object.keys(catMap).map(cat => ({
      name: cat,
      value: catMap[cat].total,
      compliant: catMap[cat].compliant
    }));

    // Risk breakdown
    const riskMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    list.forEach(r => {
      riskMap[r.riskLevel] = (riskMap[r.riskLevel] || 0) + 1;
    });

    const riskBreakdown = [
      { name: 'Low Risk', value: riskMap['low'] },
      { name: 'Medium Risk', value: riskMap['medium'] },
      { name: 'High Risk', value: riskMap['high'] },
      { name: 'Critical Risk', value: riskMap['critical'] }
    ];

    const upcomingExpirations = [...list]
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 5);

    const recentAuditLogs = [...auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      totalRecords,
      compliantCount,
      warningCount,
      expiredCount,
      inProgressCount,
      overallComplianceScore,
      expiringIn30Days,
      expiringIn60Days,
      expiringIn90Days,
      totalEstimatedRenewalCost,
      categoryBreakdown,
      riskBreakdown,
      recentAuditLogs,
      upcomingExpirations
    };
  },

  getDashboardOverview: (companyIdFilter?: string) => {
    const records = DbStore.getRecords(companyIdFilter);
    const now = new Date();
    const nowMs = now.getTime();
    const in30DaysMs = nowMs + 30 * 24 * 60 * 60 * 1000;
    const in60DaysMs = nowMs + 60 * 24 * 60 * 60 * 1000;
    const in90DaysMs = nowMs + 90 * 24 * 60 * 60 * 1000;

    const totalDocuments = records.length;
    const activeDocuments = records.filter(r => r.status === 'compliant').length;
    const expiringSoonDocuments = records.filter(r => {
      const days = Math.ceil((new Date(r.expiryDate).getTime() - nowMs) / (1000 * 3600 * 24));
      return r.status === 'warning' || (days >= 0 && days <= 30);
    }).length;
    const expiredDocuments = records.filter(r => r.status === 'expired' || new Date(r.expiryDate).getTime() < nowMs).length;
    const pendingRenewals = records.filter(r => r.status === 'renewal_in_progress' || r.status === 'pending_review').length;
    
    // Count actual renewed documents from completed renewal workflows
    const renewedDocuments = renewals.filter(r => (!companyIdFilter || companyIdFilter === 'all' || r.companyId === companyIdFilter) && r.status === 'RENEWED').length;

    const cards = {
      totalDocuments,
      activeDocuments,
      expiringSoonDocuments,
      expiredDocuments,
      pendingRenewals,
      renewedDocuments,
    };

    const activePlusRenewed = activeDocuments + renewedDocuments;
    const totalDocs = totalDocuments || 1;
    const rawScore = (activePlusRenewed / totalDocs) * 100;
    const score = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

    let healthRating: 'Excellent' | 'Good' | 'Fair' | 'Critical' = 'Critical';
    if (score >= 90) healthRating = 'Excellent';
    else if (score >= 75) healthRating = 'Good';
    else if (score >= 50) healthRating = 'Fair';
    else healthRating = 'Critical';

    const healthSummary = {
      score,
      healthRating,
      activePlusRenewed,
      totalDocuments,
      formula: '(Active + Renewed Documents) / Total Documents * 100',
    };

    const riskSummary = {
      low: records.filter(r => r.riskLevel === 'low').length,
      medium: records.filter(r => r.riskLevel === 'medium').length,
      high: records.filter(r => r.riskLevel === 'high').length,
      critical: records.filter(r => r.riskLevel === 'critical').length,
    };

    let next30Days = 0;
    let next60Days = 0;
    let next90Days = 0;

    records.forEach(r => {
      const expMs = new Date(r.expiryDate).getTime();
      if (expMs > nowMs && expMs <= in30DaysMs) next30Days++;
      if (expMs > in30DaysMs && expMs <= in60DaysMs) next60Days++;
      if (expMs > in60DaysMs && expMs <= in90DaysMs) next90Days++;
    });

    const expiryForecast = {
      next30Days,
      next60Days,
      next90Days,
    };

    const highRiskDocuments = records
      .filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical' || r.status === 'expired' || new Date(r.expiryDate).getTime() < in30DaysMs)
      .slice(0, 10);

    const recentActivities = DbStore.getAuditLogs(companyIdFilter).slice(0, 10);

    return {
      cards,
      healthSummary,
      riskSummary,
      expiryForecast,
      highRiskDocuments,
      recentActivities,
    };
  },

  getDashboardCharts: (companyIdFilter?: string) => {
    const records = DbStore.getRecords(companyIdFilter);
    const total = records.length || 1;

    // 1. Category Distribution
    const catCounts: Record<string, number> = {};
    records.forEach(r => {
      const cat = r.category || 'Operational License';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(catCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }));

    // 2. Department Compliance
    const depts = DbStore.getDepartments({ companyId: companyIdFilter });
    const deptMap: Record<string, { id: string; name: string; total: number; active: number; expired: number; expiringSoon: number }> = {};

    depts.forEach(d => {
      deptMap[d.name] = {
        id: d.id,
        name: d.name,
        total: 0,
        active: 0,
        expired: 0,
        expiringSoon: 0,
      };
    });

    records.forEach(r => {
      const deptName = r.department || 'Legal, Tax & Regulatory Affairs';
      if (!deptMap[deptName]) {
        deptMap[deptName] = {
          id: 'dept_' + deptName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: deptName,
          total: 0,
          active: 0,
          expired: 0,
          expiringSoon: 0,
        };
      }
      deptMap[deptName].total++;
      if (r.status === 'compliant') deptMap[deptName].active++;
      else if (r.status === 'expired') deptMap[deptName].expired++;
      else if (r.status === 'warning') deptMap[deptName].expiringSoon++;
    });

    const departmentCompliance = Object.values(deptMap).map(d => {
      const dTotal = d.total || 1;
      return {
        departmentId: d.id,
        departmentName: d.name,
        total: d.total,
        active: d.active,
        expired: d.expired,
        expiringSoon: d.expiringSoon,
        complianceRate: Math.round((d.active / dTotal) * 1000) / 10,
      };
    });

    // 3. Monthly Renewal Trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const companyRenList = renewals.filter(r => !companyIdFilter || companyIdFilter === 'all' || r.companyId === companyIdFilter);

    const monthlyRenewalTrend = months.map((month, idx) => {
      let renewedCount = 0;
      let pendingCount = 0;
      let totalCost = 0;

      companyRenList.forEach(ren => {
        const d = new Date(ren.createdAt || ren.updatedAt || Date.now());
        if (d.getMonth() === idx) {
          if (ren.status === 'RENEWED') {
            renewedCount++;
            totalCost += ren.renewalCost || 0;
          } else {
            pendingCount++;
          }
        }
      });

      return {
        month,
        renewedCount,
        pendingCount,
        totalCost,
      };
    });

    return {
      categoryDistribution,
      departmentCompliance,
      monthlyRenewalTrend,
    };
  },

  // Audit Logs
  getAuditLogs: (companyId?: string) => {
    let list = [...auditLogs];
    if (companyId && companyId !== 'all') {
      list = list.filter(a => a.companyId === companyId);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  getAuditLogsFiltered: (params?: {
    companyId?: string;
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    severity?: string;
  }) => {
    let list = [...auditLogs];

    if (params) {
      if (params.companyId && params.companyId !== 'all' && params.companyId !== 'ALL') {
        list = list.filter(a => a.companyId === params.companyId);
      }
      if (params.userId && params.userId !== 'all' && params.userId !== 'ALL') {
        list = list.filter(a => a.userId === params.userId || a.userName.toLowerCase().includes(params.userId!.toLowerCase()));
      }
      if (params.action && params.action !== 'all' && params.action !== 'ALL') {
        list = list.filter(a => a.action.toLowerCase() === params.action!.toLowerCase());
      }
      if (params.entityType && params.entityType !== 'all' && params.entityType !== 'ALL') {
        list = list.filter(a => a.entityType.toLowerCase() === params.entityType!.toLowerCase());
      }
      if (params.severity && params.severity !== 'all' && params.severity !== 'ALL') {
        list = list.filter(a => a.status === params.severity);
      }
      if (params.startDate) {
        list = list.filter(a => a.timestamp >= params.startDate!);
      }
      if (params.endDate) {
        list = list.filter(a => a.timestamp <= params.endDate! + 'T23:59:59.999Z');
      }
      if (params.search && params.search.trim() !== '') {
        const q = params.search.toLowerCase().trim();
        list = list.filter(a =>
          a.action.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q) ||
          a.userName.toLowerCase().includes(q) ||
          a.userRole.toLowerCase().includes(q) ||
          a.entityType.toLowerCase().includes(q) ||
          a.entityId.toLowerCase().includes(q) ||
          a.ipAddress.includes(q)
        );
      }
    }

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  },
  getAuditMetrics: (companyIdFilter?: string) => {
    let list = [...auditLogs];
    if (companyIdFilter && companyIdFilter !== 'all' && companyIdFilter !== 'ALL') {
      list = list.filter(a => a.companyId === companyIdFilter);
    }

    const totalLogs = list.length;
    const successLogs = list.filter(a => a.status === 'success').length;
    const warningLogs = list.filter(a => a.status === 'warning').length;
    const failureLogs = list.filter(a => a.status === 'failure').length;
    const successRate = totalLogs > 0 ? Math.round((successLogs / totalLogs) * 100) : 100;
    const uniqueUsers = new Set(list.map(a => a.userId)).size;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEvents = list.filter(a => a.timestamp.startsWith(todayStr)).length;

    return {
      totalLogs,
      successLogs,
      warningLogs,
      failureLogs,
      successRate,
      uniqueUsers,
      todayEvents,
    };
  },
  globalSearch: (params: { query: string; category?: string; companyId?: string }) => {
    const q = (params.query || '').trim().toLowerCase();
    const cid = params.companyId && params.companyId !== 'all' && params.companyId !== 'ALL' ? params.companyId : undefined;

    let companiesRes: any[] = [];
    let departmentsRes: any[] = [];
    let usersRes: any[] = [];
    let recordsRes: any[] = [];
    let renewalsRes: any[] = [];
    let notificationsRes: any[] = [];

    const cat = params.category || 'all';

    if (!q) {
      return {
        query: '',
        totalResults: 0,
        companies: [],
        departments: [],
        users: [],
        complianceRecords: [],
        renewals: [],
        notifications: []
      };
    }

    // Search Companies
    if (cat === 'all' || cat === 'companies') {
      companiesRes = companies.filter(c => {
        if (cid && c.id !== cid) return false;
        return c.name.toLowerCase().includes(q) ||
          c.registrationNumber.toLowerCase().includes(q) ||
          c.taxId.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.contactEmail.toLowerCase().includes(q);
      });
    }

    // Search Departments
    if (cat === 'all' || cat === 'departments') {
      departmentsRes = departments.filter(d => {
        if (cid && d.companyId !== cid) return false;
        return d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          d.companyName.toLowerCase().includes(q);
      });
    }

    // Search Users
    if (cat === 'all' || cat === 'users') {
      usersRes = users.filter(u => {
        if (cid && u.companyId !== cid) return false;
        return u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q) ||
          u.companyName.toLowerCase().includes(q);
      });
    }

    // Search Compliance Records
    if (cat === 'all' || cat === 'compliance') {
      recordsRes = records.filter(r => {
        if (cid && r.companyId !== cid) return false;
        return r.title.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.issuingAuthority.toLowerCase().includes(q) ||
          r.companyName.toLowerCase().includes(q) ||
          (r.department && r.department.toLowerCase().includes(q)) ||
          (r.assignedUserName && r.assignedUserName.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q));
      });
    }

    // Search Renewals
    if (cat === 'all' || cat === 'renewals') {
      renewalsRes = renewals.filter(ren => {
        if (cid && ren.companyId !== cid) return false;
        return ren.renewalNumber.toLowerCase().includes(q) ||
          ren.complianceDocumentName.toLowerCase().includes(q) ||
          ren.licenseNumber.toLowerCase().includes(q) ||
          ren.companyName.toLowerCase().includes(q) ||
          ren.department.toLowerCase().includes(q) ||
          ren.requestedByName.toLowerCase().includes(q) ||
          ren.assignedReviewerName.toLowerCase().includes(q) ||
          (ren.notes && ren.notes.toLowerCase().includes(q));
      });
    }

    // Search Notifications
    if (cat === 'all' || cat === 'notifications') {
      notificationsRes = notifications.filter(n => {
        if (n.isDeleted) return false;
        if (cid && n.companyId !== cid) return false;
        return n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.recipientName && n.recipientName.toLowerCase().includes(q)) ||
          (n.recipientEmail && n.recipientEmail.toLowerCase().includes(q)) ||
          (n.companyName && n.companyName.toLowerCase().includes(q));
      });
    }

    const totalResults = companiesRes.length + departmentsRes.length + usersRes.length + recordsRes.length + renewalsRes.length + notificationsRes.length;

    return {
      query: q,
      totalResults,
      companies: companiesRes,
      departments: departmentsRes,
      users: usersRes,
      complianceRecords: recordsRes,
      renewals: renewalsRes,
      notifications: notificationsRes
    };
  },
  logAudit: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: 'audit_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    auditLogs.unshift(newLog);
    return newLog;
  },

  // Notifications
  getNotificationsFiltered: (params?: {
    userId?: string;
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    companyId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    let list = notifications.filter(n => !n.isDeleted);

    if (params) {
      const { search, status, priority, type, companyId, startDate, endDate, sortBy, sortOrder } = params;

      if (companyId && companyId !== 'all' && companyId !== 'ALL') {
        list = list.filter(n => n.companyId === companyId);
      }

      if (status && status !== 'all' && status !== 'ALL') {
        if (status === 'read') list = list.filter(n => n.read === true);
        if (status === 'unread') list = list.filter(n => n.read === false);
      }

      if (priority && priority !== 'all' && priority !== 'ALL') {
        list = list.filter(n => n.priority === priority.toLowerCase());
      }

      if (type && type !== 'all' && type !== 'ALL') {
        list = list.filter(n => n.type === type.toLowerCase());
      }

      if (startDate) {
        list = list.filter(n => n.createdAt >= startDate);
      }

      if (endDate) {
        list = list.filter(n => n.createdAt <= endDate + 'T23:59:59.999Z');
      }

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.recipientName && n.recipientName.toLowerCase().includes(q)) ||
          (n.recipientEmail && n.recipientEmail.toLowerCase().includes(q)) ||
          (n.companyName && n.companyName.toLowerCase().includes(q)) ||
          (n.sender && n.sender.toLowerCase().includes(q))
        );
      }

      if (sortBy) {
        const order = sortOrder === 'asc' ? 1 : -1;
        list.sort((a, b) => {
          let valA: any = '';
          let valB: any = '';

          if (sortBy === 'createdAt') {
            valA = a.createdAt;
            valB = b.createdAt;
          } else if (sortBy === 'priority') {
            const pMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
            valA = pMap[a.priority] || 0;
            valB = pMap[b.priority] || 0;
          } else if (sortBy === 'status' || sortBy === 'read') {
            valA = a.read ? 1 : 0;
            valB = b.read ? 1 : 0;
          } else if (sortBy === 'recipientName' || sortBy === 'recipient') {
            valA = a.recipientName || '';
            valB = b.recipientName || '';
          } else if (sortBy === 'title') {
            valA = a.title;
            valB = b.title;
          }

          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      } else {
        // Default sort: latest created first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return list;
  },

  getNotificationById: (id: string) => notifications.find(n => n.id === id && !n.isDeleted),

  getNotifications: (userId?: string) => {
    let list = notifications.filter(n => !n.isDeleted);
    if (userId) {
      return list.filter(n => n.userId === userId || n.userId === 'usr_admin' || n.userId === 'usr_compliance');
    }
    return list;
  },

  getNotificationMetrics: (companyIdFilter?: string) => {
    let list = notifications.filter(n => !n.isDeleted);
    if (companyIdFilter && companyIdFilter !== 'all' && companyIdFilter !== 'ALL') {
      list = list.filter(n => n.companyId === companyIdFilter);
    }

    const totalCount = list.length;
    const unreadCount = list.filter(n => !n.read).length;
    const highPriorityCount = list.filter(n => n.priority === 'high').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = list.filter(n => n.createdAt.startsWith(todayStr)).length;

    const readRate = totalCount > 0 ? Math.round(((totalCount - unreadCount) / totalCount) * 100) : 100;

    return {
      totalCount,
      unreadCount,
      highPriorityCount,
      todayCount,
      readRate,
    };
  },

  markNotificationRead: (id: string) => {
    const n = notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      n.readAt = new Date().toISOString();
    }
    return n;
  },

  markNotificationUnread: (id: string) => {
    const n = notifications.find(item => item.id === id);
    if (n) {
      n.read = false;
      n.readAt = null;
    }
    return n;
  },

  markAllNotificationsRead: (userId?: string) => {
    let count = 0;
    notifications.forEach(n => {
      if (!n.isDeleted && !n.read) {
        if (!userId || n.userId === userId || userId === 'usr_admin') {
          n.read = true;
          n.readAt = new Date().toISOString();
          count++;
        }
      }
    });
    return count;
  },

  bulkMarkNotificationsRead: (ids: string[]) => {
    let count = 0;
    notifications.forEach(n => {
      if (ids.includes(n.id) && !n.isDeleted) {
        n.read = true;
        n.readAt = new Date().toISOString();
        count++;
      }
    });
    return count;
  },

  deleteNotification: (id: string) => {
    const n = notifications.find(item => item.id === id);
    if (n) {
      n.isDeleted = true;
      return true;
    }
    return false;
  },

  bulkDeleteNotifications: (ids: string[]) => {
    let count = 0;
    notifications.forEach(n => {
      if (ids.includes(n.id)) {
        n.isDeleted = true;
        count++;
      }
    });
    return count;
  },

  createNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
      isDeleted: false
    };
    notifications.unshift(newNotif);
    return newNotif;
  },

  // Renewals Management
  getRenewals: (filter?: {
    companyId?: string;
    department?: string;
    status?: string;
    assignedReviewerId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'renewalNumber' | 'createdAt' | 'updatedAt' | 'expiryDate' | 'renewalCost';
    sortOrder?: 'asc' | 'desc';
  }) => {
    let list = [...renewals];

    if (filter) {
      const { companyId, department, status, assignedReviewerId, search, startDate, endDate, sortBy, sortOrder } = filter;

      if (companyId && companyId !== 'all' && companyId !== 'ALL') {
        list = list.filter(r => r.companyId === companyId);
      }
      if (department && department !== 'all' && department !== 'ALL') {
        list = list.filter(r => r.department && r.department.toLowerCase() === department.toLowerCase());
      }
      if (status && status !== 'all' && status !== 'ALL') {
        list = list.filter(r => r.status === status.toUpperCase());
      }
      if (assignedReviewerId && assignedReviewerId !== 'all' && assignedReviewerId !== 'ALL') {
        list = list.filter(r => r.assignedReviewerId === assignedReviewerId || r.assignedReviewerName?.toLowerCase().includes(assignedReviewerId.toLowerCase()));
      }
      if (startDate) {
        list = list.filter(r => r.createdAt >= startDate);
      }
      if (endDate) {
        list = list.filter(r => r.createdAt <= endDate + 'T23:59:59.999Z');
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(r =>
          r.renewalNumber.toLowerCase().includes(q) ||
          r.complianceDocumentName.toLowerCase().includes(q) ||
          r.companyName.toLowerCase().includes(q) ||
          (r.department && r.department.toLowerCase().includes(q)) ||
          (r.requestedByName && r.requestedByName.toLowerCase().includes(q)) ||
          (r.assignedReviewerName && r.assignedReviewerName.toLowerCase().includes(q)) ||
          (r.licenseNumber && r.licenseNumber.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
        );
      }

      if (sortBy) {
        const order = sortOrder === 'desc' ? -1 : 1;
        list.sort((a, b) => {
          let valA: any = '';
          let valB: any = '';
          if (sortBy === 'renewalNumber') {
            valA = a.renewalNumber;
            valB = b.renewalNumber;
          } else if (sortBy === 'createdAt') {
            valA = a.createdAt;
            valB = b.createdAt;
          } else if (sortBy === 'updatedAt') {
            valA = a.updatedAt;
            valB = b.updatedAt;
          } else if (sortBy === 'expiryDate') {
            valA = a.newExpiryDate;
            valB = b.newExpiryDate;
          } else if (sortBy === 'renewalCost') {
            valA = a.renewalCost;
            valB = b.renewalCost;
          }

          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      }
    }

    return list;
  },

  getRenewalById: (id: string) => renewals.find(r => r.id === id),

  addRenewal: (data: Partial<RenewalRecord>, actor: { userId: string; userName: string; userRole: string }) => {
    const rec = records.find(r => r.id === data.complianceRecordId) || records[0];
    const reviewer = users.find(u => u.id === data.assignedReviewerId) || users[0];
    const company = companies.find(c => c.id === (data.companyId || rec?.companyId)) || companies[0];

    const count = renewals.length + 1;
    const renewalNumber = `REN-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const nowStr = new Date().toISOString();

    const newRenewal: RenewalRecord = {
      id: 'ren_' + Math.random().toString(36).substring(2, 9),
      renewalNumber,
      complianceRecordId: rec.id,
      complianceDocumentName: rec.title,
      companyId: company.id,
      companyName: company.name,
      department: data.department || rec.department || 'Legal & Risk Compliance',
      requestedById: actor.userId,
      requestedByName: actor.userName,
      assignedReviewerId: reviewer.id,
      assignedReviewerName: reviewer.name,
      renewalCost: Number(data.renewalCost) || rec.estimatedCost || 5000,
      currency: data.currency || 'USD',
      status: 'CREATED',
      newIssueDate: data.newIssueDate || new Date().toISOString().split('T')[0],
      newExpiryDate: data.newExpiryDate || rec.expiryDate,
      licenseNumber: data.licenseNumber || rec.code,
      notes: data.notes || '',
      documentUrl: data.documentUrl || '',
      documentName: data.documentName || (data.documentUrl ? 'attachment.pdf' : ''),
      statusHistory: [
        {
          previousStatus: 'NONE',
          newStatus: 'CREATED',
          changedBy: actor.userName,
          changedAt: nowStr,
          notes: 'Created renewal request'
        }
      ],
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    renewals.unshift(newRenewal);

    // Also update compliance record status to 'renewal_in_progress'
    rec.status = 'renewal_in_progress';

    DbStore.logAudit({
      userId: actor.userId,
      userName: actor.userName,
      userRole: actor.userRole,
      companyId: newRenewal.companyId,
      action: 'CREATED_RENEWAL',
      entityType: 'Renewal',
      entityId: newRenewal.id,
      details: `Created renewal request ${newRenewal.renewalNumber} for ${newRenewal.complianceDocumentName}.`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return newRenewal;
  },

  updateRenewal: (id: string, updates: Partial<RenewalRecord>, actor: { userId: string; userName: string; userRole: string }) => {
    const idx = renewals.findIndex(r => r.id === id);
    if (idx !== -1) {
      if (updates.assignedReviewerId && updates.assignedReviewerId !== renewals[idx].assignedReviewerId) {
        const rev = users.find(u => u.id === updates.assignedReviewerId);
        if (rev) updates.assignedReviewerName = rev.name;
      }

      renewals[idx] = {
        ...renewals[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      DbStore.logAudit({
        userId: actor.userId,
        userName: actor.userName,
        userRole: actor.userRole,
        companyId: renewals[idx].companyId,
        action: 'UPDATED_RENEWAL',
        entityType: 'Renewal',
        entityId: id,
        details: `Updated renewal request details for ${renewals[idx].renewalNumber}.`,
        ipAddress: '127.0.0.1',
        status: 'success'
      });

      return renewals[idx];
    }
    return null;
  },

  transitionRenewalStatus: (id: string, newStatus: RenewalStatus, notes: string, actor: { userId: string; userName: string; userRole: string }) => {
    const item = renewals.find(r => r.id === id);
    if (!item) return null;

    const previousStatus = item.status;
    const nowStr = new Date().toISOString();

    item.status = newStatus;
    item.updatedAt = nowStr;
    item.statusHistory.unshift({
      previousStatus,
      newStatus,
      changedBy: actor.userName,
      changedAt: nowStr,
      notes: notes || ''
    });

    // If workflow completed (RENEWED)
    if (newStatus === 'RENEWED') {
      const rec = records.find(r => r.id === item.complianceRecordId);
      if (rec) {
        rec.status = 'compliant';
        rec.issueDate = item.newIssueDate;
        rec.expiryDate = item.newExpiryDate;
        rec.code = item.licenseNumber;
        rec.lastRenewedDate = nowStr.split('T')[0];
        rec.renewalStep = 'completed';
      }
    } else if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
      const rec = records.find(r => r.id === item.complianceRecordId);
      if (rec && rec.status === 'renewal_in_progress') {
        rec.status = 'warning';
      }
    }

    DbStore.logAudit({
      userId: actor.userId,
      userName: actor.userName,
      userRole: actor.userRole,
      companyId: item.companyId,
      action: 'TRANSITIONED_RENEWAL_STATUS',
      entityType: 'Renewal',
      entityId: item.id,
      details: `Transitioned renewal ${item.renewalNumber} status from ${previousStatus} to ${newStatus}. Notes: ${notes || 'N/A'}`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return item;
  },

  uploadRenewalAttachment: (id: string, documentUrl: string, documentName: string, actor: { userId: string; userName: string; userRole: string }) => {
    const item = renewals.find(r => r.id === id);
    if (!item) return null;

    item.documentUrl = documentUrl;
    item.documentName = documentName || 'supporting_document.pdf';
    item.updatedAt = new Date().toISOString();

    DbStore.logAudit({
      userId: actor.userId,
      userName: actor.userName,
      userRole: actor.userRole,
      companyId: item.companyId,
      action: 'UPLOADED_RENEWAL_ATTACHMENT',
      entityType: 'Renewal',
      entityId: id,
      details: `Uploaded attachment '${item.documentName}' to renewal ${item.renewalNumber}.`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return item;
  },

  deleteRenewalAttachment: (id: string, actor: { userId: string; userName: string; userRole: string }) => {
    const item = renewals.find(r => r.id === id);
    if (!item) return null;

    const oldName = item.documentName;
    item.documentUrl = '';
    item.documentName = '';
    item.updatedAt = new Date().toISOString();

    DbStore.logAudit({
      userId: actor.userId,
      userName: actor.userName,
      userRole: actor.userRole,
      companyId: item.companyId,
      action: 'DELETED_RENEWAL_ATTACHMENT',
      entityType: 'Renewal',
      entityId: id,
      details: `Deleted attachment '${oldName}' from renewal ${item.renewalNumber}.`,
      ipAddress: '127.0.0.1',
      status: 'warning'
    });

    return item;
  },

  deleteRenewal: (id: string, actor: { userId: string; userName: string; userRole: string }) => {
    const idx = renewals.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = renewals[idx];
      renewals.splice(idx, 1);

      DbStore.logAudit({
        userId: actor.userId,
        userName: actor.userName,
        userRole: actor.userRole,
        companyId: deleted.companyId,
        action: 'DELETED_RENEWAL',
        entityType: 'Renewal',
        entityId: id,
        details: `Deleted renewal request ${deleted.renewalNumber}.`,
        ipAddress: '127.0.0.1',
        status: 'warning'
      });

      return true;
    }
    return false;
  },

  getRenewalMetrics: (companyIdFilter?: string) => {
    let list = [...renewals];
    if (companyIdFilter && companyIdFilter !== 'all') {
      list = list.filter(r => r.companyId === companyIdFilter);
    }

    const pendingCount = list.filter(r => r.status === 'CREATED' || r.status === 'PENDING_RENEWAL').length;
    const processingCount = list.filter(r => r.status === 'PROCESSING').length;
    const approvedCount = list.filter(r => r.status === 'APPROVED').length;
    const rejectedCount = list.filter(r => r.status === 'REJECTED').length;
    const completedCount = list.filter(r => r.status === 'RENEWED').length;
    const totalCount = list.length;
    const totalRenewalCost = list.reduce((sum, r) => sum + (r.renewalCost || 0), 0);

    return {
      pendingCount,
      processingCount,
      approvedCount,
      rejectedCount,
      completedCount,
      totalCount,
      totalRenewalCost,
    };
  },

  getCalendarEvents: (params?: {
    search?: string;
    companyId?: string;
    department?: string;
    status?: string;
    category?: string;
    priority?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const todayStr = new Date().toISOString().split('T')[0];

    let allEvents: any[] = [];

    // 1. Compliance Records
    records.forEach(r => {
      let evtStatus = 'active';
      if (r.status === 'expired') evtStatus = 'expired';
      else if (r.status === 'warning') evtStatus = 'expiring_soon';
      else if (r.status === 'renewal_in_progress') evtStatus = 'renewal';

      const dept = r.companyId === 'comp_01' ? 'Legal & Risk Compliance' : r.companyId === 'comp_02' ? 'Operations & Licensing' : 'Environmental & Health Safety';

      allEvents.push({
        id: `evt_rec_${r.id}`,
        title: r.title,
        document: r.title,
        code: r.code,
        companyId: r.companyId,
        companyName: r.companyName,
        department: dept,
        responsiblePerson: r.assignedUserName || 'Md. Arif Hossain',
        issueDate: r.issueDate,
        expiryDate: r.expiryDate,
        eventDate: r.expiryDate,
        priority: r.riskLevel === 'critical' ? 'critical' : r.riskLevel === 'high' ? 'high' : 'medium',
        status: evtStatus,
        source: 'compliance',
        category: r.category,
        issuingAuthority: r.issuingAuthority,
        estimatedCost: r.estimatedCost,
        notes: r.notes,
        documentUrl: r.documentUrl,
        documentName: r.documentName,
        recordId: r.id
      });
    });

    // 2. Renewals
    renewals.forEach(ren => {
      const renAny = ren as any;
      const title = renAny.complianceTitle || ren.documentName || 'Compliance Renewal';
      allEvents.push({
        id: `evt_ren_${ren.id}`,
        title: `Renewal: ${title}`,
        document: title,
        code: ren.licenseNumber || ren.renewalNumber,
        companyId: ren.companyId,
        companyName: ren.companyName,
        department: ren.department,
        responsiblePerson: ren.assignedReviewerName || 'Md. Tanvir Ahmed',
        issueDate: ren.newIssueDate,
        expiryDate: ren.newExpiryDate,
        eventDate: ren.newExpiryDate,
        priority: 'high',
        status: 'renewal',
        source: 'renewal',
        category: 'Renewal Workflow',
        issuingAuthority: 'Regulatory Body',
        estimatedCost: ren.renewalCost,
        notes: ren.notes,
        documentUrl: ren.documentUrl,
        documentName: ren.documentName,
        renewalId: ren.id,
        recordId: renAny.complianceRecordId || renAny.complianceId
      });
    });

    // 3. Notifications / Reminders
    notifications.forEach(n => {
      const nAny = n as any;
      const dateVal = nAny.timestamp || n.createdAt || todayStr;
      const eventDate = dateVal ? dateVal.split('T')[0] : todayStr;
      const docTitle = nAny.complianceTitle || n.title;
      allEvents.push({
        id: `evt_not_${n.id}`,
        title: `Reminder: ${n.title}`,
        document: docTitle,
        companyId: n.companyId,
        companyName: n.companyName,
        department: 'Compliance Operations',
        responsiblePerson: n.recipientEmail || 'Md. Arif Hossain',
        expiryDate: eventDate,
        eventDate: eventDate,
        priority: (n.priority as any) || 'medium',
        status: 'reminder',
        source: 'reminder',
        category: 'Alert & Reminder',
        notes: n.message,
        notificationId: n.id
      });
    });

    // 4. Relative calendar events to ensure rich events across today, this week, and this month
    const relativeOffsetDays = [-28, -21, -14, -7, -3, -1, 0, 1, 2, 4, 7, 10, 14, 21, 28];
    const syntheticTemplates = [
      {
        title: 'Quarterly Environmental Audit & ETP Site Inspection',
        document: 'DoE Environmental Clearance & ETP Audit',
        companyId: 'comp_01',
        companyName: 'Bengal Manufacturing Ltd.',
        department: 'Environmental & Health Safety',
        responsiblePerson: 'Md. Tanvir Ahmed',
        priority: 'high',
        status: 'active',
        source: 'audit',
        category: 'Environmental & Safety'
      },
      {
        title: 'BSTI Bi-Annual Quality Assurance Standard Review',
        document: 'BSTI Quality Certificate & License',
        companyId: 'comp_03',
        companyName: 'Eastern Pharmaceuticals Ltd.',
        department: 'Operations & Licensing',
        responsiblePerson: 'Sadia Rahman',
        priority: 'critical',
        status: 'expiring_soon',
        source: 'compliance',
        category: 'Healthcare & BSTI'
      },
      {
        title: 'DIFE Factory Safety & Worker Welfare Control Verification',
        document: 'DIFE Factory Safety Compliance',
        companyId: 'comp_02',
        companyName: 'Rahman Textiles Ltd.',
        department: 'Legal & Risk Compliance',
        responsiblePerson: 'Md. Arif Hossain',
        priority: 'medium',
        status: 'reminder',
        source: 'reminder',
        category: 'Labor & Factory Safety'
      },
      {
        title: 'Trade License Renewal Dossier Submission Deadline',
        document: 'DNCC Trade License & Commercial Permit',
        companyId: 'comp_01',
        companyName: 'Bengal Manufacturing Ltd.',
        department: 'Executive Leadership & Governance',
        responsiblePerson: 'Nusrat Jahan',
        priority: 'high',
        status: 'renewal',
        source: 'renewal',
        category: 'Trade & Licensing'
      }
    ];

    relativeOffsetDays.forEach((offset, idx) => {
      const tmpl = syntheticTemplates[idx % syntheticTemplates.length];
      const evtDate = formatDate(offset);
      allEvents.push({
        id: `evt_syn_${idx}`,
        title: tmpl.title,
        document: tmpl.document,
        code: `REG-${2025 + (idx % 3)}-00${idx + 10}`,
        companyId: tmpl.companyId,
        companyName: tmpl.companyName,
        department: tmpl.department,
        responsiblePerson: tmpl.responsiblePerson,
        issueDate: formatDate(offset - 365),
        expiryDate: evtDate,
        eventDate: evtDate,
        priority: tmpl.priority,
        status: tmpl.status,
        source: tmpl.source,
        category: tmpl.category,
        issuingAuthority: 'Regulatory & Certification Body',
        estimatedCost: 5000 + (idx * 1200),
        notes: `Automated compliance milestone tracking for ${tmpl.document}.`,
        documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        documentName: `${tmpl.document.replace(/[^a-zA-Z0-9]/g, '_')}_Milestone.pdf`
      });
    });

    // Apply filtering
    if (params) {
      if (params.search) {
        const q = params.search.toLowerCase();
        allEvents = allEvents.filter(
          e =>
            e.title.toLowerCase().includes(q) ||
            e.document.toLowerCase().includes(q) ||
            e.companyName.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q) ||
            (e.code && e.code.toLowerCase().includes(q)) ||
            (e.responsiblePerson && e.responsiblePerson.toLowerCase().includes(q))
        );
      }

      if (params.companyId && params.companyId !== 'all') {
        allEvents = allEvents.filter(e => e.companyId === params.companyId);
      }

      if (params.department && params.department !== 'all') {
        allEvents = allEvents.filter(e => e.department.toLowerCase() === params.department!.toLowerCase());
      }

      if (params.status && params.status !== 'all') {
        allEvents = allEvents.filter(e => e.status === params.status);
      }

      if (params.category && params.category !== 'all') {
        allEvents = allEvents.filter(e => e.category === params.category);
      }

      if (params.priority && params.priority !== 'all') {
        allEvents = allEvents.filter(e => e.priority === params.priority);
      }

      if (params.source && params.source !== 'all') {
        allEvents = allEvents.filter(e => e.source === params.source);
      }

      if (params.startDate) {
        allEvents = allEvents.filter(e => e.eventDate >= params.startDate!);
      }

      if (params.endDate) {
        allEvents = allEvents.filter(e => e.eventDate <= params.endDate!);
      }
    }

    allEvents.sort((a, b) => a.eventDate.localeCompare(b.eventDate));

    return allEvents;
  },

  getCalendarSummary: (companyIdFilter?: string) => {
    const events = DbStore.getCalendarEvents({ companyId: companyIdFilter });
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYearMonth = todayStr.substring(0, 7);

    const totalEvents = events.length;
    const upcomingRenewals = events.filter(e => e.status === 'renewal' || e.source === 'renewal').length;
    const expiredDocuments = events.filter(e => e.status === 'expired').length;
    const todayEvents = events.filter(e => e.eventDate === todayStr).length;
    const thisMonthEvents = events.filter(e => e.eventDate.startsWith(currentYearMonth)).length;

    return {
      totalEvents,
      upcomingRenewals,
      expiredDocuments,
      todayEvents,
      thisMonthEvents,
    };
  }
};
