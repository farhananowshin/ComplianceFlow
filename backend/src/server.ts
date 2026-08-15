import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import app from './app.js';
import { initExpiryCheckerJob } from './jobs/expiryChecker.job.js';
import { initEmailReminderJob } from './jobs/emailReminder.job.js';

async function bootstrapServer() {
  try {
    // 1. Establish resilient connection to MongoDB database
    await connectDB();

    // 2. Initialize Background Cron Jobs
    const expiryCheckerTask = initExpiryCheckerJob();
    const emailReminderTask = initEmailReminderJob();

    // 3. Start Express HTTP Server Listener
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 ComplianceFlow Backend API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`🔗 Local Health Check: http://localhost:${env.PORT}/health`);
      console.log(`📡 API Base Route:     http://localhost:${env.PORT}${env.API_PREFIX}`);
    });

    // 4. Graceful Shutdown Handler
    const handleGracefulShutdown = (signal: string) => {
      console.log(`\n⚠️  Received ${signal}. Initiating graceful shutdown...`);
      expiryCheckerTask.stop();
      emailReminderTask.stop();
      server.close(async () => {
        console.log('🛑 ComplianceFlow HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force process termination if lingering active connections block exit
      setTimeout(() => {
        console.error('❌ Could not close lingering connections within 10s, forcing exit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('💥 Fatal error during ComplianceFlow server initialization:', error);
    process.exit(1);
  }
}

bootstrapServer();
