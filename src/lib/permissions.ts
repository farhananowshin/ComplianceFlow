import { User } from '../types';

export type RoleCategory = 'admin' | 'employee';
export type CanonicalRole = 'ADMIN' | 'EMPLOYEE';

export type PermissionKey =
  | 'MANAGE_USERS'
  | 'MANAGE_COMPANIES'
  | 'MANAGE_DEPARTMENTS'
  | 'CREATE_RECORDS'
  | 'EDIT_RECORDS'
  | 'DELETE_RECORDS'
  | 'APPROVE_RENEWALS'
  | 'SUBMIT_RENEWALS'
  | 'VIEW_AUDIT_LOGS'
  | 'VIEW_REPORTS'
  | 'VIEW_ALL_RECORDS';

export type PermissionAction = PermissionKey;

export const Permissions: Record<PermissionKey, PermissionKey> = {
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_COMPANIES: 'MANAGE_COMPANIES',
  MANAGE_DEPARTMENTS: 'MANAGE_DEPARTMENTS',
  CREATE_RECORDS: 'CREATE_RECORDS',
  EDIT_RECORDS: 'EDIT_RECORDS',
  DELETE_RECORDS: 'DELETE_RECORDS',
  APPROVE_RENEWALS: 'APPROVE_RENEWALS',
  SUBMIT_RENEWALS: 'SUBMIT_RENEWALS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  VIEW_ALL_RECORDS: 'VIEW_ALL_RECORDS',
};

/**
 * Normalizes any role string into canonical UPPERCASE role ('ADMIN' | 'EMPLOYEE')
 */
export function normalizeRole(role?: string): CanonicalRole {
  const cat = getRoleCategory(role);
  if (cat === 'admin') return 'ADMIN';
  return 'EMPLOYEE';
}

/**
 * Normalizes any role string from frontend/backend into standard RBAC categories ('admin' | 'employee')
 */
export function getRoleCategory(role?: string): RoleCategory {
  if (!role) return 'employee';
  const norm = role.toLowerCase().trim();

  if (
    norm.includes('admin') ||
    norm.includes('super_admin') ||
    norm.includes('company_admin') ||
    norm.includes('global_admin')
  ) {
    return 'admin';
  }

  return 'employee';
}

/**
 * Friendly display labels for roles (strictly Admin or Employee)
 */
export function getRoleLabel(role?: string): string {
  const category = getRoleCategory(role);
  return category === 'admin' ? 'Admin' : 'Employee';
}

/**
 * Centralized RBAC permission evaluator (Admin vs Employee)
 */
export function hasPermission(user: User | null, permission: PermissionKey): boolean {
  if (!user) return false;
  const category = getRoleCategory(user.role);

  switch (permission) {
    case 'MANAGE_USERS':
    case 'MANAGE_COMPANIES':
    case 'MANAGE_DEPARTMENTS':
    case 'CREATE_RECORDS':
    case 'EDIT_RECORDS':
    case 'DELETE_RECORDS':
    case 'APPROVE_RENEWALS':
    case 'VIEW_AUDIT_LOGS':
    case 'VIEW_REPORTS':
      return category === 'admin';

    case 'SUBMIT_RENEWALS':
    case 'VIEW_ALL_RECORDS':
      return true; // Admin and Employee can view records & submit renewals

    default:
      return false;
  }
}

/**
 * Route access evaluator based strictly on user role
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return false;
  const category = getRoleCategory(user.role);

  switch (route) {
    case 'companies':
    case 'users':
    case 'departments':
    case 'reports':
    case 'audit':
      return category === 'admin';

    case 'dashboard':
    case 'records':
    case 'renewals':
    case 'calendar':
    case 'notifications':
    case 'search':
    case 'profile':
    case 'change_password':
      return true; // Accessible to both Admin and Employee

    default:
      return true;
  }
}

export function canAccessNavRoute(roleOrUser: string | User | null | undefined, route: string): boolean {
  if (!roleOrUser) return false;
  if (typeof roleOrUser === 'object') {
    return canAccessRoute(roleOrUser, route);
  }
  return canAccessRoute({ role: roleOrUser } as User, route);
}

export function canPerformAction(roleOrUser: string | User | null | undefined, action: PermissionKey): boolean {
  if (!roleOrUser) return false;
  if (typeof roleOrUser === 'object') {
    return hasPermission(roleOrUser, action);
  }
  return hasPermission({ role: roleOrUser } as User, action);
}
