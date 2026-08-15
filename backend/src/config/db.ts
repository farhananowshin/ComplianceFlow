import mongoose, { ConnectOptions } from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

let isEventListenerAttached = false;

/**
 * Attach global Mongoose connection event listeners for health monitoring.
 */
const attachConnectionEventListeners = (): void => {
  if (isEventListenerAttached) return;

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB Mongoose connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB Mongoose connection lost/disconnected.');
  });

  isEventListenerAttached = true;
};

/**
 * Establishes a resilient MongoDB connection with exponential/fixed retry strategy.
 */
export const connectDB = async (
  retries = MAX_RETRIES,
  delay = RETRY_INTERVAL_MS
): Promise<typeof mongoose> => {

  attachConnectionEventListeners();

  const options: ConnectOptions = {
    autoIndex: env.NODE_ENV === 'development',
    serverSelectionTimeoutMS: 5000,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 [Attempt ${attempt}/${retries}] Connecting to MongoDB at ${env.MONGODB_URI}...`);
      const conn = await mongoose.connect(env.MONGODB_URI, options);
      console.log(`🍃 Connected to MongoDB Database: "${conn.connection.name}" on host: "${conn.connection.host}:${conn.connection.port}"`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, (error as Error).message);

      if (attempt < retries) {
        console.log(`⏳ Retrying MongoDB connection in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('💥 All MongoDB connection retry attempts exhausted.');
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts.`);
      }
    }
  }

  throw new Error('Unexpected database connection state');
};

/**
 * Gracefully disconnects Mongoose driver from MongoDB cluster.
 */
export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      console.log('🛑 MongoDB Mongoose connection closed gracefully.');
    } catch (error) {
      console.error('❌ Error while closing MongoDB connection:', error);
    }
  }
};

export default connectDB;
