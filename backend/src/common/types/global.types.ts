/**
 * Global Helper & Audit Types
 */

export type Environment = 'development' | 'production' | 'test';

export interface BaseAuditFields {
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplianceStatus =
  | 'PENDING'
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'IN_REVIEW'
  | 'EXPIRED'
  | 'NEARING_EXPIRY';
