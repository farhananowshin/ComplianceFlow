import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  NotificationType,
  PriorityLevel,
  DeliveryChannel,
  EmailSentStatus,
} from '../../common/constants/enums.js';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  priority: PriorityLevel;
  relatedComplianceId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  deliveryChannel: DeliveryChannel;
  emailSentStatus: EmailSentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required'],
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification body message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(PriorityLevel),
      default: PriorityLevel.MEDIUM,
      required: true,
    },
    relatedComplianceId: {
      type: Schema.Types.ObjectId,
      ref: 'ComplianceRecord',
      required: false,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    deliveryChannel: {
      type: String,
      enum: Object.values(DeliveryChannel),
      default: DeliveryChannel.BOTH,
      required: true,
    },
    emailSentStatus: {
      type: String,
      enum: Object.values(EmailSentStatus),
      default: EmailSentStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default NotificationModel;
