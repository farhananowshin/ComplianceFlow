import auth from './backend/src/config/auth.js';
import mongoose from 'mongoose';
import { env } from './backend/src/config/env.js';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: 'admin@complianceflow.com',
        password: 'Password123!',
      }
    });
    console.log("RESPONSE:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit(0);
}
run();
