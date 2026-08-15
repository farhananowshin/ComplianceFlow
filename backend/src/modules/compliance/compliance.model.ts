import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ComplianceCategory,
  ComplianceStatus,
  PriorityLevel,
  RenewalFrequency,
} from '../../common/constants/enums.js';

export interface IRenewalHistoryItem {
  _id?: mongoose.Types.ObjectId;
  year?: number;
  previousExpiryDate: Date;
  newExpiryDate: Date;
  previousIssueDate?: Date;
  newIssueDate?: Date;
  completedBy: mongoose.Types.ObjectId;
  completedAt: Date;
  notes?: string;
  supportingAttachmentUrl?: string;
  supportingAttachmentPublicId?: string;
  vendorInfo?: string;
  renewalCost?: number;
}

export interface IComplianceRecord extends Document {
  _id: mongoose.Types.ObjectId;
  documentName: string;
  licenseNumber: string;
  category: ComplianceCategory;
  companyId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  responsiblePersonId?: mongoose.Types.ObjectId;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  renewalFrequency: RenewalFrequency;
  priority: PriorityLevel;
  status: ComplianceStatus;
  notes?: string;
  supportingAttachmentUrl?: string;
  supportingAttachmentPublicId?: string;
  qrCodeId?: string;
  autoRenewalEnabled: boolean;
  renewalHistory: IRenewalHistoryItem[];
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Calculated Virtual Properties
  daysRemaining?: number;
}

const RenewalHistoryItemSchema = new Schema<IRenewalHistoryItem>(
  {
    year: { type: Number },
    previousExpiryDate: { type: Date, required: true },
    newExpiryDate: { type: Date, required: true },
    previousIssueDate: { type: Date },
    newIssueDate: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    supportingAttachmentUrl: { type: String, default: '' },
    supportingAttachmentPublicId: { type: String, default: '' },
    vendorInfo: { type: String, default: '' },
    renewalCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ComplianceRecordSchema = new Schema<IComplianceRecord>(
  {
    documentName: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License or Certificate number is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(ComplianceCategory),
      required: [true, 'Compliance category is required'],
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    responsiblePersonId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    issuingAuthority: {
      type: String,
      required: [true, 'Issuing authority name is required'],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true,
    },
    renewalFrequency: {
      type: String,
      enum: Object.values(RenewalFrequency),
      default: RenewalFrequency.ANNUAL,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(PriorityLevel),
      default: PriorityLevel.MEDIUM,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ComplianceStatus),
      default: ComplianceStatus.ACTIVE,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    supportingAttachmentUrl: {
      type: String,
      default: '',
    },
    supportingAttachmentPublicId: {
      type: String,
      default: '',
    },
    qrCodeId: {
      type: String,
      default: '',
    },
    autoRenewalEnabled: {
      type: Boolean,
      default: false,
    },
    renewalHistory: {
      type: [RenewalHistoryItemSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for Days Remaining Calculation
ComplianceRecordSchema.virtual('daysRemaining').get(function (this: IComplianceRecord) {
  if (!this.expiryDate) return undefined;
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for High-Performance Multi-tenant Queries
ComplianceRecordSchema.index({ companyId: 1, licenseNumber: 1, isDeleted: 1 }, { unique: true });
ComplianceRecordSchema.index({ companyId: 1, isDeleted: 1, status: 1, expiryDate: 1 });
ComplianceRecordSchema.index({ companyId: 1, departmentId: 1, isDeleted: 1, status: 1 });
ComplianceRecordSchema.index({ companyId: 1, category: 1, isDeleted: 1 });
ComplianceRecordSchema.index({ expiryDate: 1, isDeleted: 1, status: 1 }); // Cron / Expiry Check Index

export const ComplianceRecordModel: Model<IComplianceRecord> =
  mongoose.models.ComplianceRecord ||
  mongoose.model<IComplianceRecord>('ComplianceRecord', ComplianceRecordSchema);

export default ComplianceRecordModel;
