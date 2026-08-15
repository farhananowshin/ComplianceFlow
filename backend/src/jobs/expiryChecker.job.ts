import cron, { ScheduledTask } from 'node-cron';
import ComplianceRecordModel from '../modules/compliance/compliance.model.js';
import { ComplianceStatus } from '../common/constants/enums.js';

/**
 * Task: Evaluates compliance document expiration dates and updates status badges
 */
export const runExpiryCheckerJob = async (): Promise<{
  totalEvaluated: number;
  expiredCount: number;
  expiringSoonCount: number;
}> => {
  console.log(' [Expiry Checker Job] Starting compliance document expiry status evaluation...');

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let expiredCount = 0;
  let expiringSoonCount = 0;

  // 1. Mark records as EXPIRED if expiryDate <= now and status is not EXPIRED or RENEWED
  const expiredResult = await ComplianceRecordModel.updateMany(
    {
      isDeleted: false,
      expiryDate: { $lte: now },
      status: { $nin: [ComplianceStatus.EXPIRED, ComplianceStatus.RENEWED] },
    },
    {
      $set: {
        status: ComplianceStatus.EXPIRED,
        updatedAt: now,
      },
    }
  );
  expiredCount = expiredResult.modifiedCount || 0;

  // 2. Mark records as EXPIRING_SOON if expiryDate > now and <= in30Days and status is ACTIVE / COMPLIANT
  const expiringSoonResult = await ComplianceRecordModel.updateMany(
    {
      isDeleted: false,
      expiryDate: { $gt: now, $lte: in30Days },
      status: { $in: [ComplianceStatus.ACTIVE, ComplianceStatus.COMPLIANT] },
    },
    {
      $set: {
        status: ComplianceStatus.EXPIRING_SOON,
        updatedAt: now,
      },
    }
  );
  expiringSoonCount = expiringSoonResult.modifiedCount || 0;

  const totalEvaluated = expiredCount + expiringSoonCount;

  console.log(
    `[Expiry Checker Job] Evaluation completed: ${expiredCount} documents marked EXPIRED, ${expiringSoonCount} documents marked EXPIRING_SOON.`
  );

  return { totalEvaluated, expiredCount, expiringSoonCount };
};

/**
 * Initialize Scheduled Cron Job (Runs daily at midnight 00:05 AM)
 */
export const initExpiryCheckerJob = (): ScheduledTask => {
  console.log(' [Cron Initialization] Scheduling Expiry Checker Job (0 5 0 * * * - Daily at 00:05 AM)...');

  const task = cron.schedule('0 5 0 * * *', async () => {
    try {
      await runExpiryCheckerJob();
    } catch (error) {
      console.error(' [Expiry Checker Job] Execution failed:', error);
    }
  });

  return task;
};

export default initExpiryCheckerJob;
