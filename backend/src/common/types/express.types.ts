import { Request } from 'express';
import { UserRole, UserStatus } from './role.types.js';

/**
 * Authenticated Express Request User Payload
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
  departmentId?: string;
  isMfaEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Active Authenticated Session Metadata
 */
export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Extended Express Request Object with Authenticated Session & User Context
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  session?: AuthSession;
  tenantId?: string; // Company ID for multi-tenant context
}
