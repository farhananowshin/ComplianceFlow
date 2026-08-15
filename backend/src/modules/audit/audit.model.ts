import mongoose, { Schema, Document, Model } from 'mongoose';
import { AuditAction, AuditEntity } from '../../common/constants/enums.js';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    userEmail: {
      type: String,
      required: false,
      default: 'public@verifier',
      lowercase: true,
      trim: true,
    },
    userRole: {
      type: String,
      required: false,
      default: 'PUBLIC',
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: [true, 'Audit action is required'],
      index: true,
    },
    entity: {
      type: String,
      enum: Object.values(AuditEntity),
      required: [true, 'Audit entity target is required'],
      index: true,
    },
    entityId: {
      type: String,
      default: '',
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable
  }
);

// Indexes
AuditLogSchema.index({ companyId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLogModel;
