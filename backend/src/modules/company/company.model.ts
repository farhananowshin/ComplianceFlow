import mongoose, { Schema, Document, Model } from 'mongoose';
import { CompanyStatus } from '../../common/constants/enums.js';

export interface ICompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ICompanySettings {
  defaultCurrency: string;
  fiscalYearStartMonth: number;
  autoArchiving: boolean;
  allowManagerApprovals: boolean;
  timezone: string;
}

export interface ICompanyReminderSettings {
  defaultReminderDays: number[];
  notifyDepartmentManagers: boolean;
  notifyComplianceOfficers: boolean;
  emailEscalationDays: number;
  digestFrequency: 'DAILY' | 'WEEKLY';
}

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  registrationNumber: string;
  taxId?: string;
  industry: string;
  address?: ICompanyAddress;
  contactEmail: string;
  contactPhone?: string;
  logoUrl?: string;
  status: CompanyStatus;
  parentCompanyId?: mongoose.Types.ObjectId;
  settings: ICompanySettings;
  reminderSettings: ICompanyReminderSettings;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<ICompanyAddress>(
  {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    zipCode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const SettingsSchema = new Schema<ICompanySettings>(
  {
    defaultCurrency: { type: String, default: 'BDT', uppercase: true, trim: true },
    fiscalYearStartMonth: { type: Number, default: 7, min: 1, max: 12 },
    autoArchiving: { type: Boolean, default: false },
    allowManagerApprovals: { type: Boolean, default: true },
    timezone: { type: String, default: 'Asia/Dhaka' },
  },
  { _id: false }
);

const ReminderSettingsSchema = new Schema<ICompanyReminderSettings>(
  {
    defaultReminderDays: { type: [Number], default: [60, 30, 15, 7, 1] },
    notifyDepartmentManagers: { type: Boolean, default: true },
    notifyComplianceOfficers: { type: Boolean, default: true },
    emailEscalationDays: { type: Number, default: 3 },
    digestFrequency: { type: String, enum: ['DAILY', 'WEEKLY'], default: 'DAILY' },
  },
  { _id: false }
);

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Company code identifier is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Company registration number is required'],
      trim: true,
      index: true,
    },
    taxId: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry classification is required'],
      trim: true,
      default: 'General',
    },
    address: {
      type: AddressSchema,
      default: {},
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(CompanyStatus),
      default: CompanyStatus.ACTIVE,
      required: true,
      index: true,
    },
    parentCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
      index: true,
    },
    settings: {
      type: SettingsSchema,
      default: () => ({}),
    },
    reminderSettings: {
      type: ReminderSettingsSchema,
      default: () => ({}),
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
  },
  {
    timestamps: true,
  }
);

// Indexes
CompanySchema.index({ name: 1, isDeleted: 1 });
CompanySchema.index({ registrationNumber: 1, isDeleted: 1 });
CompanySchema.index({ code: 1, isDeleted: 1 });
CompanySchema.index({ parentCompanyId: 1, status: 1, isDeleted: 1 });

export const CompanyModel: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default CompanyModel;
