export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'COMPANY_ADMIN'
  | 'COMPLIANCE_OFFICER'
  | 'DEPARTMENT_MANAGER'
  | 'AUDITOR'
  | 'STAFF'
  | 'MANAGER'
  | 'EMPLOYEE';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string | Company;
  departmentId?: string | Department;
  phoneNumber?: string;
  status: UserStatus;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  _id?: string;
  name: string;
  code: string;
  registrationNumber?: string;
  taxId?: string;
  contactEmail?: string;
  industry?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  logoUrl?: string;
  createdAt?: string;
}

export interface Department {
  id: string;
  _id?: string;
  name: string;
  code: string;
  companyId: string | Company;
  description?: string;
  managerId?: string | User;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export type ComplianceCategory =
  | 'ENVIRONMENTAL'
  | 'HEALTH_SAFETY'
  | 'DATA_PRIVACY'
  | 'FINANCIAL'
  | 'TAX'
  | 'OPERATIONAL'
  | 'LABOR'
  | 'QUALITY'
  | 'OTHER';

export type ComplianceStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'PENDING_RENEWAL'
  | 'COMPLIANT'
  | 'NON_COMPLIANT';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ComplianceRecord {
  id: string;
  _id?: string;
  documentName: string;
  licenseNumber?: string;
  category: ComplianceCategory;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: ComplianceStatus;
  priority: PriorityLevel;
  supportingAttachmentUrl?: string;
  qrCodeId?: string;
  companyId: string | Company;
  departmentId?: string | Department;
  createdBy?: string | User;
  updatedBy?: string | User;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RenewalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RenewalRecord {
  id: string;
  _id?: string;
  renewalNumber: string;
  complianceId: string | ComplianceRecord;
  companyId: string | Company;
  departmentId?: string | Department;
  requestedBy: string | User;
  assignedApproverId?: string | User;
  renewalCost: number;
  currency: string;
  previousExpiryDate: string;
  newExpiryDate?: string;
  status: RenewalStatus;
  notes?: string;
  rejectionReason?: string;
  receiptAttachmentUrl?: string;
  newLicenseNumber?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  _id?: string;
  title: string;
  message: string;
  type: 'EXPIRY_WARNING' | 'RENEWAL_REQUIRED' | 'STATUS_CHANGE' | 'SYSTEM_ALERT';
  priority: PriorityLevel;
  isRead: boolean;
  relatedComplianceId?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  _id?: string;
  companyId?: string;
  userId?: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalResults: number;
  totalPages: number;
}
