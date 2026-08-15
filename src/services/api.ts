import {
  Company,
  User,
  ComplianceRecord,
  AuditLog,
  NotificationItem,
  DashboardMetrics,
  DashboardOverviewData,
  DashboardChartsData
} from '../types';
import apiClient from '../lib/api-client';

const API_BASE = '/api';

export const ApiService = {
  // Auth
  login: async (email: string) => {
    return apiClient.post('/auth/login', { email });
  },

  getMe: async (userId: string) => {
    return apiClient.get('/auth/me');
  },

  // Dashboard Metrics & Analytics
  getDashboardMetrics: async (companyId?: string): Promise<{ success: boolean; metrics: DashboardMetrics }> => {
    const query = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    return apiClient.get(`/dashboard/metrics${query}`);
  },

  getDashboardOverview: async (companyId?: string, departmentId?: string): Promise<{ success: boolean; data: DashboardOverviewData; message?: string }> => {
    const params = new URLSearchParams();
    if (companyId && companyId !== 'all') params.append('companyId', companyId);
    if (departmentId && departmentId !== 'all') params.append('departmentId', departmentId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return apiClient.get(`/dashboard/overview${queryString}`);
  },

  getDashboardCharts: async (companyId?: string, departmentId?: string): Promise<{ success: boolean; data: DashboardChartsData; message?: string }> => {
    const params = new URLSearchParams();
    if (companyId && companyId !== 'all') params.append('companyId', companyId);
    if (departmentId && departmentId !== 'all') params.append('departmentId', departmentId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return apiClient.get(`/dashboard/charts${queryString}`);
  },
  getCompanies: async (): Promise<{ success: boolean; companies: Company[] }> => {
    const res: any = await apiClient.get('/companies');
    return { success: res.success || res.status === 'success', companies: res.data?.companies || [] };
  },

  createCompany: async (companyData: Partial<Company>): Promise<{ success: boolean; company: Company }> => {
    return apiClient.post('/companies', companyData);
  },

  updateCompany: async (id: string, updates: Partial<Company>): Promise<{ success: boolean; company: Company }> => {
    return apiClient.patch(`/companies/${id}`, updates);
  },

  // Departments
  getDepartments: async (companyId?: string): Promise<{ success: boolean; departments: any[] }> => {
    const qParams = new URLSearchParams();
    if (companyId && companyId !== 'all') qParams.append('companyId', companyId);
    
    const res: any = await apiClient.get(`/departments?${qParams.toString()}`);
    return { success: res.success || res.status === 'success', departments: res.data?.departments || res.departments || [] };
  },

  createDepartment: async (deptData: { name: string; companyId: string }): Promise<{ success: boolean; department: any }> => {
    return apiClient.post('/departments', deptData);
  },

  deleteDepartment: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/departments/${id}`);
  },

  // Users
  getUsers: async (): Promise<{ success: boolean; users: User[] }> => {
    const res: any = await apiClient.get('/users');
    return { success: res.success || res.status === 'success', users: res.data?.users || [] };
  },

  createUser: async (userData: Partial<User>): Promise<{ success: boolean; user: User }> => {
    return apiClient.post('/users', userData);
  },
  
  inviteUser: async (inviteData: { email: string; role: string; companyId: string }): Promise<{ success: boolean }> => {
    return apiClient.post('/users', { 
      email: inviteData.email,
      role: inviteData.role,
      companyId: inviteData.companyId,
      name: inviteData.email.split('@')[0], // Default name
      password: 'TemporaryPassword123!', // Auto-generated temporary password
    });
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<{ success: boolean; user: User }> => {
    return apiClient.put(`/users/${id}`, updates);
  },

  // Compliance Records
  getComplianceRecords: async (companyId?: string): Promise<{ success: boolean; records: ComplianceRecord[] }> => {
    const queryParams = new URLSearchParams();
    if (companyId && companyId !== 'all') queryParams.append('companyId', companyId);
    queryParams.append('limit', '1000'); // Fetch enough for client-side pagination to work correctly
    
    const res: any = await apiClient.get(`/compliance?${queryParams.toString()}`);
    const unwrappedRecords = res.data?.records || res.records || (Array.isArray(res.data) ? res.data : []);
    return { success: res.success || res.status === 'success', records: unwrappedRecords };
  },

  createComplianceRecord: async (recordData: Partial<ComplianceRecord> | FormData): Promise<{ success: boolean; record: ComplianceRecord }> => {
    return apiClient.post('/compliance', recordData);
  },

  updateComplianceRecord: async (id: string, updates: Partial<ComplianceRecord> | FormData): Promise<{ success: boolean; record: ComplianceRecord }> => {
    return apiClient.put(`/compliance/${id}`, updates);
  },

  deleteComplianceRecord: async (id: string, user: User): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/compliance/${id}`);
  },

  directRenewComplianceRecord: async (id: string, formData: FormData): Promise<{ success: boolean; record: ComplianceRecord }> => {
    // We use patch for the renewal endpoint. FormData handles the file and text fields.
    // Allow Axios to set Content-Type automatically to include the boundary
    return apiClient.patch(`/compliance/${id}/renew`, formData);
  },

  verifyQRToken: async (token: string) => {
    return apiClient.get(`/qr/verify/${encodeURIComponent(token)}`);
  },

  verifyQRCode: async (qrCodeId: string): Promise<{ success: boolean; record?: ComplianceRecord; message?: string }> => {
    try {
      return await apiClient.get(`/verify/${encodeURIComponent(qrCodeId)}`);
    } catch (err) {
      try {
        return await apiClient.get(`/qr/verify/${encodeURIComponent(qrCodeId)}`);
      } catch (e) {
        return { success: false, message: 'Failed to reach verification endpoint' };
      }
    }
  },

  getRenewalPipeline: async (): Promise<{ success: boolean; renewals: any[] }> => {
    try {
      const res: any = await apiClient.get('/renewals');
      const unwrappedRenewals = res.data?.renewals || res.renewals || res.data?.records || res.records || (Array.isArray(res.data) ? res.data : []);
      return { success: res.success || res.status === 'success', renewals: unwrappedRenewals };
    } catch (err) {
      return { success: true, renewals: [] };
    }
  },
  // Global Search
  globalSearch: async (params: { query: string; category?: string; companyId?: string }) => {
    const qParams = new URLSearchParams();
    if (params.query) qParams.append('query', params.query);
    if (params.category && params.category !== 'all') qParams.append('category', params.category);
    if (params.companyId && params.companyId !== 'all') qParams.append('companyId', params.companyId);
    
    return apiClient.get(`/search?${qParams.toString()}`);
  },

  // Notifications
  getNotifications: async (userId: string): Promise<{ success: boolean; notifications: NotificationItem[] }> => {
    const res: any = await apiClient.get(`/notifications`);
    const unwrappedNotifications = res.data?.notifications || res.notifications || (Array.isArray(res.data) ? res.data : []) || [];
    return { success: res.success || res.status === 'success', notifications: unwrappedNotifications };
  },

  markNotificationRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  sendEmailReminder: async (recordId: string, recipientEmail?: string) => {
    return apiClient.post('/reminders/trigger-email', { recordId, recipientEmail });
  },

  // Audit Logs
  getAuditLogs: async (companyId?: string): Promise<{ success: boolean; auditLogs: AuditLog[] }> => {
    const query = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    const res: any = await apiClient.get(`/audit-logs${query}`);
    const unwrappedLogs = res.data?.auditLogs || res.auditLogs || res.data?.logs || res.logs || (Array.isArray(res.data) ? res.data : []) || [];
    return { success: res.success || res.status === 'success', auditLogs: unwrappedLogs };
  },

  getAuditLogsFiltered: async (params: {
    companyId?: string;
    userId?: string;
    action?: string;
    entityType?: string;
    severity?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const qParams = new URLSearchParams();
    if (params.companyId && params.companyId !== 'all') qParams.append('companyId', params.companyId);
    if (params.userId && params.userId !== 'all') qParams.append('userId', params.userId);
    if (params.action && params.action !== 'all') qParams.append('action', params.action);
    if (params.entityType && params.entityType !== 'all') qParams.append('entityType', params.entityType);
    if (params.severity && params.severity !== 'all') qParams.append('severity', params.severity);
    if (params.search) qParams.append('search', params.search);
    if (params.startDate) qParams.append('startDate', params.startDate);
    if (params.endDate) qParams.append('endDate', params.endDate);
    if (params.page) qParams.append('page', params.page.toString());
    if (params.limit) qParams.append('limit', params.limit.toString());

    return apiClient.get(`/audit-logs?${qParams.toString()}`);
  },

  getAuditMetrics: async (companyId?: string) => {
    const query = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    return apiClient.get(`/audit-logs/metrics${query}`);
  },

  // Export CSV Helper
  exportCsvReport: async (type: 'summary' | 'expired' | 'renewals', companyId?: string): Promise<void> => {
    const scope = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    const blob: Blob = await apiClient.get(`/reports/${type}-csv${scope}`, { responseType: 'blob' }) as unknown as Blob;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default ApiService;
