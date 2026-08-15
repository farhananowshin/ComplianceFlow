import mongoose, { Schema, Document, Model } from 'mongoose';
import { RenewalStatus } from '../../common/constants/enums.js';

export interface IRenewalStatusHistory {
  status: RenewalStatus;
  changedBy: mongoose.Types.ObjectId;
  comment?: string;
  changedAt: Date;
}

export interface IRenewalRecord extends Document {
  _id: mongoose.Types.ObjectId;
  complianceId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  renewalNumber: string;
  requestedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  previousExpiryDate: Date;
  newExpiryDate: Date;
  nextRenewalDate?: Date;
  newIssueDate?: Date;
  newLicenseNumber?: string;
  renewalCost: number;
  currency: string;
  status: RenewalStatus;
  attachmentUrl?: string;
  attachmentPublicId?: string;
  receiptUrl?: string;
  notes?: string;
  rejectionReason?: string;
  completedAt?: Date;
  statusHistory: IRenewalStatusHistory[];
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RenewalStatusHistorySchema = new Schema<IRenewalStatusHistory>(
  {
    status: {
      type: String,
      enum: Object.values(RenewalStatus),
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      default: '',
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const RenewalRecordSchema = new Schema<IRenewalRecord>(
  {
    complianceId: {
      type: Schema.Types.ObjectId,
      ref: 'ComplianceRecord',
      required: [true, 'Compliance record reference is required'],
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
      index: true,
    },
    renewalNumber: {
      type: String,
      required: [true, 'Renewal request reference number is required'],
      trim: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user reference is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    previousExpiryDate: {
      type: Date,
      required: [true, 'Previous expiry date is required'],
    },
    newExpiryDate: {
      type: Date,
      required: [true, 'New extended expiry date is required'],
    },
    nextRenewalDate: {
      type: Date,
    },
    newIssueDate: {
      type: Date,
    },
    newLicenseNumber: {
      type: String,
      trim: true,
    },
    renewalCost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    currency: {
      type: String,
      default: 'BDT',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(RenewalStatus),
      default: RenewalStatus.CREATED,
      required: true,
      index: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentPublicId: {
      type: String,
      default: '',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
    statusHistory: {
      type: [RenewalStatusHistorySchema],
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
      required: [true, 'Creator reference is required'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance
RenewalRecordSchema.index({ companyId: 1, renewalNumber: 1, isDeleted: 1 });
RenewalRecordSchema.index({ companyId: 1, isDeleted: 1, status: 1 });
RenewalRecordSchema.index({ complianceId: 1, isDeleted: 1 });

export const RenewalRecordModel: Model<IRenewalRecord> =
  mongoose.models.RenewalRecord ||
  mongoose.model<IRenewalRecord>('RenewalRecord', RenewalRecordSchema);

export const RenewalHistoryModel = RenewalRecordModel;

export default RenewalRecordModel;
