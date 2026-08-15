import cron, { ScheduledTask } from 'node-cron';
import mongoose from 'mongoose';
import ComplianceRecordModel, { IComplianceRecord } from '../modules/compliance/compliance.model.js';
import { NotificationModel } from '../modules/notification/notification.model.js';
import UserModel, { IUser } from '../modules/user/user.model.js';
import { sendEmail } from '../config/mailer.js';
import { env } from '../config/env.js';
import {
  NotificationType,
  PriorityLevel,
  DeliveryChannel,
  EmailSentStatus,
  ComplianceStatus,
} from '../common/constants/enums.js';
import { UserRole, UserStatus } from '../common/types/role.types.js';

// Expiry Milestones (in days) to trigger reminder notifications
const REMINDER_MILESTONES = [60, 30, 15, 7, 1];

interface MilestoneConfig {
  days: number;
  type: NotificationType;
  priority: PriorityLevel;
  subjectPrefix: string;
}

const getMilestoneConfig = (daysRemaining: number): MilestoneConfig | null => {
  if (daysRemaining === 60) {
    return {
      days: 60,
      type: NotificationType.EXPIRY_WARNING,
      priority: PriorityLevel.MEDIUM,
      subjectPrefix: '⚠️ [60 Days Notice] Compliance Expiration Reminder',
    };
  }
  if (daysRemaining === 30) {
    return {
      days: 30,
      type: NotificationType.EXPIRY_WARNING,
      priority: PriorityLevel.HIGH,
      subjectPrefix: '⚠️ [30 Days Notice] Action Required: Compliance Expiry Soon',
    };
  }
  if (daysRemaining === 15) {
    return {
      days: 15,
      type: NotificationType.EXPIRY_WARNING,
      priority: PriorityLevel.HIGH,
      subjectPrefix: '🚨 [15 Days Notice] Urgent: Compliance Expiry Imminent',
    };
  }
  if (daysRemaining === 7) {
    return {
      days: 7,
      type: NotificationType.EXPIRY_WARNING,
      priority: PriorityLevel.CRITICAL,
      subjectPrefix: '🚨 [7 Days Notice] CRITICAL: License Expiring Next Week',
    };
  }
  if (daysRemaining === 1) {
    return {
      days: 1,
      type: NotificationType.EXPIRY_WARNING,
      priority: PriorityLevel.CRITICAL,
      subjectPrefix: ' [1 Day Notice] CRITICAL: License Expires Tomorrow!',
    };
  }
  if (daysRemaining <= 0) {
    return {
      days: 0,
      type: NotificationType.EXPIRED_ALERT,
      priority: PriorityLevel.CRITICAL,
      subjectPrefix: '⛔ [EXPIRED] Compliance License Expired Alert',
    };
  }
  return null;
};

/**
 * Generate Responsive HTML Email Template
 */
const generateEmailHtml = (
  recipientName: string,
  record: IComplianceRecord,
  daysRemaining: number,
  milestoneConfig: MilestoneConfig
): string => {
  const expiryStr = new Date(record.expiryDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const appUrl = env.CLIENT_URL || 'http://localhost:3000';
  const isExpired = daysRemaining <= 0;
  const badgeColor = isExpired ? '#ef4444' : daysRemaining <= 7 ? '#f97316' : '#eab308';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${milestoneConfig.subjectPrefix}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; color: #1e293b; }
      .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .header { background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
      .content { padding: 32px 24px; }
      .badge { display: inline-block; padding: 6px 14px; background-color: ${badgeColor}; color: #ffffff; font-weight: 700; border-radius: 20px; font-size: 13px; text-transform: uppercase; margin-bottom: 20px; }
      .info-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; }
      .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .label { font-weight: 600; color: #64748b; font-size: 14px; }
      .value { font-weight: 600; color: #333d55; font-size: 14px; text-align: right; }
      .cta-btn { display: block; width: 220px; margin: 28px auto 10px; padding: 14px 20px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 700; border-radius: 8px; text-align: center; }
      .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>ComplianceFlow Notification</h1>
      </div>
      <div class="content">
        <p>Dear <strong>${recipientName}</strong>,</p>
        <span class="badge">${isExpired ? 'EXPIRED' : `${daysRemaining} Days Remaining`}</span>
        <p>This is an automated notice regarding compliance document <strong>${record.documentName}</strong>.</p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="label">Document Name:</span>
            <span class="value">${record.documentName}</span>
          </div>
          <div class="info-row">
            <span class="label">License / Reg Number:</span>
            <span class="value">${record.licenseNumber || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Category:</span>
            <span class="value">${record.category}</span>
          </div>
          <div class="info-row">
            <span class="label">Issuing Authority:</span>
            <span class="value">${record.issuingAuthority || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Expiry Date:</span>
            <span class="value" style="color: ${badgeColor};">${expiryStr}</span>
          </div>
        </div>

        <p>${
          isExpired
            ? 'This compliance record has officially expired. Please initiate a renewal immediately to maintain regulatory compliance.'
            : 'Please review this record and coordinate with your team to begin the renewal process before expiration.'
        }</p>

        <a href="${appUrl}" class="cta-btn">View in ComplianceFlow</a>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ComplianceFlow Platform. All rights reserved. <br/>
        This is an automated system email, please do not reply directly.
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Task: Evaluates documents nearing expiry and dispatches notifications & emails
 */
export const runEmailReminderJob = async (): Promise<{
  documentsScanned: number;
  notificationsCreated: number;
  emailsDelivered: number;
}> => {
  console.log(' [Email Reminder Job] Starting automated notification & email dispatch check...');

  const now = new Date();
  const startOfDayNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Fetch non-deleted, un-renewed compliance records
  const records = await ComplianceRecordModel.find({
    isDeleted: false,
    status: { $ne: ComplianceStatus.RENEWED },
  }).populate('companyId', 'name code');

  let notificationsCreated = 0;
  let emailsDelivered = 0;

  for (const record of records) {
    if (!record.expiryDate) continue;

    // Calculate calendar days remaining
    const expiryDate = new Date(record.expiryDate);
    const startOfExpiryDay = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
    const diffTime = startOfExpiryDay.getTime() - startOfDayNow.getTime();
    const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Check if current daysRemaining matches any target milestone (60, 30, 15, 7, 1, 0)
    const milestoneConfig = getMilestoneConfig(daysRemaining);
    if (!milestoneConfig) continue;

    // 2. Identify Recipient User(s)
    let recipients: IUser[] = [];

    if (record.responsiblePersonId) {
      const assignedUser = await UserModel.findOne({
        _id: record.responsiblePersonId,
        status: UserStatus.ACTIVE,
      });
      if (assignedUser) {
        recipients.push(assignedUser);
      }
    }

    // If no specific responsible person or inactive, fallback to Admins & Managers
    if (recipients.length === 0 && record.companyId) {
      recipients = await UserModel.find({
        companyId: record.companyId,
        role: { $in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN] },
        status: UserStatus.ACTIVE,
      });
    }

    if (recipients.length === 0) continue;

    // 3. Dispatch Notification & Email for each recipient
    for (const recipient of recipients) {
      // Duplicate Prevention Check: Check if notification for this compliance record & milestone tag already exists
      const milestoneTag = `[Milestone: ${daysRemaining}d]`;
      const existingNotification = await NotificationModel.findOne({
        relatedComplianceId: record._id,
        recipientId: recipient._id,
        title: { $regex: `\\[Milestone: ${daysRemaining}d\\]` },
      });

      if (existingNotification) {
        // Already notified for this exact milestone day, skip to prevent duplicates
        continue;
      }

      const notificationTitle = `${milestoneConfig.subjectPrefix} ${milestoneTag}: ${record.documentName}`;
      const notificationMessage = `Document '${record.documentName}' (License: ${
        record.licenseNumber
      }) ${daysRemaining <= 0 ? 'has EXPIRED' : `expires in ${daysRemaining} day(s)`} on ${expiryDate.toLocaleDateString()}.`;

      // Create Database Notification
      const notification = await NotificationModel.create({
        recipientId: recipient._id,
        companyId: record.companyId,
        title: notificationTitle,
        message: notificationMessage,
        type: milestoneConfig.type,
        priority: milestoneConfig.priority,
        relatedComplianceId: record._id,
        isRead: false,
        deliveryChannel: DeliveryChannel.BOTH,
        emailSentStatus: EmailSentStatus.PENDING,
      });

      notificationsCreated++;

      // Send Email via Mailer
      const emailHtml = generateEmailHtml(recipient.name, record, daysRemaining, milestoneConfig);
      const isSent = await sendEmail({
        to: recipient.email,
        subject: `${milestoneConfig.subjectPrefix}: ${record.documentName}`,
        html: emailHtml,
      });

      if (isSent) {
        notification.emailSentStatus = EmailSentStatus.SENT;
        emailsDelivered++;
      } else {
        notification.emailSentStatus = EmailSentStatus.FAILED;
      }
      await notification.save();
    }
  }

  console.log(
    ` [Email Reminder Job] Dispatch complete: ${records.length} records scanned, ${notificationsCreated} notifications created, ${emailsDelivered} emails delivered.`
  );

  return {
    documentsScanned: records.length,
    notificationsCreated,
    emailsDelivered,
  };
};

/**
 * Initialize Scheduled Cron Job (Runs daily at 08:00 AM)
 */
export const initEmailReminderJob = (): ScheduledTask => {
  console.log('[Cron Initialization] Scheduling Email Reminder Job (0 0 8 * * * - Daily at 08:00 AM)...');

  const task = cron.schedule('0 0 8 * * *', async () => {
    try {
      await runEmailReminderJob();
    } catch (error) {
      console.error(' [Email Reminder Job] Execution failed:', error);
    }
  });

  return task;
};

export default initEmailReminderJob;
