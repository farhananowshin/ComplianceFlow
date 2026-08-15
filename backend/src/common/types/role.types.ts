/**
 * ComplianceFlow - User Role & Access Definitions
 */
import { ROLES, UserRole } from '../../constants/roles.js';

export { ROLES, UserRole };

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export const ALL_ROLES: UserRole[] = Object.values(ROLES);

/**
 * Role Permission Hierarchies and Capability Maps
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [ROLES.SUPER_ADMIN]: [
    'system:all',
    'company:create',
    'company:read',
    'company:update',
    'company:delete',
    'user:all',
    'compliance:all',
    'audit:all',
    'report:all',
  ],
  [ROLES.ADMIN]: [
    'company:read',
    'company:update',
    'department:all',
    'user:manage_tenant',
    'compliance:all',
    'renewal:all',
    'audit:read',
    'notification:all',
  ],
  [ROLES.MANAGER]: [
    'compliance:create',
    'compliance:read',
    'compliance:update',
    'compliance:delete',
    'renewal:create',
    'renewal:read',
    'renewal:update',
    'department:read',
    'notification:read',
    'audit:read',
  ],
  [ROLES.EMPLOYEE]: [
    'compliance:read_assigned',
    'notification:read_self',
  ],
};
